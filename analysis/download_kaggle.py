"""Step 1: download the Kaggle outputs and convert the adapters (CPU only).

Needs a Kaggle API token, the same one the official `kaggle` tool uses: either a
new token (environment variable KAGGLE_API_TOKEN or the file ~/.kaggle/access_token)
or a legacy key (KAGGLE_USERNAME and KAGGLE_KEY, or ~/.kaggle/kaggle.json).
Create one under "API" at https://www.kaggle.com/settings.

The 48 adapters (about 0.9 GB) go to data/adapters/ and are converted to
data/npz/, which the analysis reads. The result tables go to
data/kaggle_outputs/<test bed>/ (they are already in the repository).

    python download_kaggle.py            # adapters and tables
    python download_kaggle.py --tables   # tables only
"""
import json
import os
import sys

import requests

from common import NPZ_DIR, PT_DIR, TABLES, pt_to_npz

# the request the official Kaggle client sends for `kaggle kernels output`
LIST_OUTPUT = "https://api.kaggle.com/v1/kernels.KernelsApiService/ListKernelSessionOutput"
OWNER = "ankitrajchoudhari01"
# (test bed, notebook, version, run folder). The lab notebook's version 4 ran Qwen2.5-0.5B, version 5 Qwen2.5-1.5B.
RUNS = [("lab05", "kmerge-merge-lab-1", "v4", "Qwen2_5_0_5B_Instruct_tr128-va40-te100_ep3_lr0.0005_sharedinit"),
        ("lab15", "kmerge-merge-lab-1", "v5", "Qwen2_5_1_5B_Instruct_tr128-va40-te100_ep3_lr0.0005_sharedinit"),
        ("real", "kmerge-real-benchmark", "v8", "Qwen2_5_1_5B_Instruct_r32_tr800-te150_ep2_lr0.0001")]
SKIP = ("predictions_test.csv", "eval_cache.jsonl", "results.zip")   # large and not needed here


class _Bearer(requests.auth.AuthBase):
    def __init__(self, token):
        self.token = token

    def __call__(self, r):
        r.headers["Authorization"] = f"Bearer {self.token}"
        return r


def credentials():
    home = os.environ.get("KAGGLE_CONFIG_DIR", os.path.expanduser("~/.kaggle"))
    token = os.environ.get("KAGGLE_API_TOKEN")
    if not token and os.path.exists(os.path.join(home, "access_token")):
        token = open(os.path.join(home, "access_token")).read().strip()
    if token:
        return _Bearer(token)
    if os.environ.get("KAGGLE_USERNAME") and os.environ.get("KAGGLE_KEY"):
        return requests.auth.HTTPBasicAuth(os.environ["KAGGLE_USERNAME"], os.environ["KAGGLE_KEY"])
    if os.path.exists(os.path.join(home, "kaggle.json")):
        with open(os.path.join(home, "kaggle.json")) as f:
            c = json.load(f)
        return requests.auth.HTTPBasicAuth(c["username"], c["key"])
    sys.exit("No Kaggle token found: set KAGGLE_API_TOKEN or save it to ~/.kaggle/access_token (see the top of this file).")


def list_outputs(auth, slug, label):
    files, token = [], None
    while True:
        body = {"userName": OWNER, "kernelSlug": slug, "versionLabel": label, "pageSize": 20}
        if token:
            body["pageToken"] = token
        r = requests.post(LIST_OUTPUT, json=body, auth=auth, timeout=120)
        r.raise_for_status()
        out = r.json()
        files += out.get("files", [])
        token = out.get("nextPageToken")
        if not token:
            return files


def fetch(url, out):
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with requests.get(url, stream=True, timeout=600) as r:   # signed download link, no token needed
        r.raise_for_status()
        with open(out + ".part", "wb") as fh:
            for chunk in r.iter_content(1 << 20):
                fh.write(chunk)
    os.replace(out + ".part", out)


def main(tables_only=False):
    auth = credentials()
    for model, slug, label, folder in RUNS:
        files = list_outputs(auth, slug, label)
        n_ad = 0
        for f in files:
            name, url = f["fileName"], f["url"]
            parts, base = name.split("/"), os.path.basename(name)
            if folder not in parts[:-1]:
                continue                                     # another run of the same notebook
            if name.endswith(".pt"):
                n_ad += 1
                npz = os.path.join(NPZ_DIR, f"{model}_{base[:-3]}.npz")
                if tables_only or os.path.exists(npz):
                    continue
                pt = os.path.join(PT_DIR, f"{model}_{base}")
                if not os.path.exists(pt):
                    fetch(url, pt)
                os.makedirs(NPZ_DIR, exist_ok=True)
                pt_to_npz(pt, npz)
                print("adapter", model, base, flush=True)
            elif base not in SKIP:
                fetch(url, os.path.join(TABLES, model, base))
                print("table", model, base, flush=True)
        print(f"{model}: {n_ad} adapters listed", flush=True)


if __name__ == "__main__":
    main(tables_only="--tables" in sys.argv)
