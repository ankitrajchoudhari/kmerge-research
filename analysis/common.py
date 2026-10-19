"""Shared helpers for the K-Merge geometry and capacity analysis.

Everything here runs on a CPU with numpy, pandas and scipy. The trained LoRA
adapters (.pt files saved by the Kaggle notebooks) are read without PyTorch.
"""
import collections
import io
import json
import os
import pickle
import re
import zipfile

import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.environ.get("KMERGE_DATA", os.path.join(ROOT, "data"))
TABLES = os.path.join(DATA, "kaggle_outputs")   # result tables from the Kaggle runs (kept in git)
PT_DIR = os.path.join(DATA, "adapters")         # downloaded .pt adapters (not in git, ~920 MB)
NPZ_DIR = os.path.join(DATA, "npz")             # the same adapters as numpy arrays (not in git)
CACHE = os.path.join(DATA, "cache")             # intermediate results (not in git)
RESULTS = os.path.join(ROOT, "results")
RESULTS_JSON = os.path.join(RESULTS, "geometry_results.json")

# the three test beds
MODELS = {
    "lab05": dict(name="Qwen/Qwen2.5-0.5B-Instruct", layers=24, mods=["q", "v"], rank=8),
    "lab15": dict(name="Qwen/Qwen2.5-1.5B-Instruct", layers=28, mods=["q", "v"], rank=8),
    "real": dict(name="Qwen/Qwen2.5-1.5B-Instruct", layers=28, mods=["q", "k", "v", "o"], rank=32),
}
LAB_LANGS = ["en", "de", "fr", "hi"]
TYPES = ["gec", "sum", "qa"]
REAL_LANGS = ["en", "de", "es", "it"]
TASKS = [f"{t}_{l}" for t in TYPES for l in REAL_LANGS]
FRACS = [0.8, 0.9, 0.95]   # energy cut-offs that define the slot's "important directions"
SEED = 20261013            # bootstrap seed used for every interval in the report


def table(model, name):
    return pd.read_csv(os.path.join(TABLES, model, name))


# ---------------- reading torch.save() files without PyTorch ----------------
_DT = {"FloatStorage": np.float32, "HalfStorage": np.float16, "DoubleStorage": np.float64, "BFloat16Storage": "bf16"}


def _rebuild(storage, offset, size, stride, *args):
    item = storage.itemsize
    view = np.lib.stride_tricks.as_strided(storage[offset:], shape=tuple(size), strides=tuple(s * item for s in stride))
    return view.astype(np.float32).copy()


class _TorchFree(pickle.Unpickler):
    """Unpickler that only rebuilds tensors and OrderedDicts, so a downloaded file cannot run code."""

    def __init__(self, f, z, prefix):
        super().__init__(f)
        self.z, self.prefix = z, prefix

    def find_class(self, module, name):
        if module == "torch._utils" and name == "_rebuild_tensor_v2":
            return _rebuild
        if module == "torch" and name.endswith("Storage"):
            return name
        if module == "collections" and name == "OrderedDict":
            return collections.OrderedDict
        raise pickle.UnpicklingError(f"blocked {module}.{name}")

    def persistent_load(self, pid):
        _, stype, key, _location, _numel = pid
        buf = self.z.read(f"{self.prefix}/data/{key}")
        dt = _DT[stype]
        if dt == "bf16":
            return (np.frombuffer(buf, dtype=np.uint16).astype(np.uint32) << 16).view(np.float32)
        return np.frombuffer(buf, dtype=dt)


def load_pt(path):
    z = zipfile.ZipFile(path)
    pkl = [n for n in z.namelist() if n.endswith("data.pkl")][0]
    return _TorchFree(io.BytesIO(z.read(pkl)), z, pkl[: -len("/data.pkl")]).load()


_KEY = re.compile(r"layers\.(\d+)\.self_attn\.(q|k|v|o)_proj\.lora_(A|B)")


def pt_to_npz(pt_path, npz_path):
    """Keep only the LoRA A and B matrices, stored as L{layer}_{module}_{A|B}."""
    sd = load_pt(pt_path)
    if isinstance(sd, dict) and isinstance(sd.get("state_dict"), dict):
        sd = sd["state_dict"]
    arrs = {}
    for k, v in sd.items():
        m = _KEY.search(k)
        if m and hasattr(v, "shape"):
            arrs[f"L{m.group(1)}_{m.group(2)}_{m.group(3)}"] = v.astype(np.float32)
    np.savez(npz_path, **arrs)
    return len(arrs)


_open = {}


def adapter(model, seed, task):
    path = os.path.join(NPZ_DIR, f"{model}_seed{seed}_{task}.npz")
    if path not in _open:
        _open[path] = np.load(path)
    return _open[path]


# ---------------- linear algebra ----------------
def thin_svd(B, A):
    """SVD of the low-rank update B @ A without forming the full d_out x d_in matrix."""
    Qb, Rb = np.linalg.qr(B)
    Qa, Ra = np.linalg.qr(A.T)
    Um, S, Vmt = np.linalg.svd(Rb @ Ra.T)
    return Qb @ Um, S, Qa @ Vmt.T


def k_at(S2, frac):
    """Fewest top directions whose energy (squared singular values) reaches `frac` of the total."""
    tot = S2.sum()
    return int(np.searchsorted(np.cumsum(S2) / tot, frac) + 1) if tot > 0 else 0


# ---------------- the 221 K-Merge cases ----------------
def parse_slots(s):
    return [sorted(re.findall(r"[a-z]{2}", p)) for p in [x.strip() for x in s.split("|")]]


def build_outcomes():
    """Every case where K-Merge averaged a task into a shared slot and its damage is known.

    damage = 1 - (score after K-Merge) / (the task's own adapter score)
    cluster = the merge the case belongs to (both tasks of a pair are resampled together)
    """
    rows = []
    for key in ["lab05", "lab15"]:
        pw = table(key, "pairwise_results.csv")
        for _, r in pw[pw.method == "kmerge"].iterrows():
            for t, o, nem in [(r.a, r.b, r.nem_a), (r.b, r.a, r.nem_b)]:
                rows.append(dict(ds=f"{key}_pairs", model=key, seed=int(r.seed), target=t, rest=[o], damage=1 - nem, n=2,
                                 cluster=f"{key}-{r.seed}-{r.pair}", cos_table=r.cos, ttype="gec"))
    for key in ["lab05", "lab15"]:
        sq, aq = table(key, "sequence_results.csv"), table(key, "adapter_quality.csv")
        solo = {(r.lang, int(r.seed)): r.solo_em for _, r in aq.iterrows()}
        seen = set()
        for _, r in sq[sq.rule == "kmerge"].iterrows():
            for grp in parse_slots(r.slots):
                if len(grp) != 3 or (int(r.seed), tuple(grp)) in seen:
                    continue
                seen.add((int(r.seed), tuple(grp)))
                for t in grp:
                    rows.append(dict(ds=f"{key}_triples", model=key, seed=int(r.seed), target=t, rest=[x for x in grp if x != t],
                                     damage=1 - r[f"em_{t}"] / solo[(t, int(r.seed))], n=3,
                                     cluster=f"{key}-{r.seed}-{'+'.join(grp)}", cos_table=np.nan, ttype="gec"))
    sr = table("real", "stream_results.csv")
    for _, r in sr[sr.method == "kmerge"].iterrows():
        grp = r.slot.split("+")
        if len(grp) < 2:
            continue
        rows.append(dict(ds="real_slots", model="real", seed=int(r.seed), target=r.task, rest=[x for x in grp if x != r.task],
                         damage=1 - r.nscore, n=len(grp), cluster=f"real-{r.seed}-K{r.K}-{r.order}-{r.slot}", cos_table=np.nan,
                         ttype=r.type, K=int(r.K), order=r.order))
    st = table("real", "stress_results.csv")
    for _, r in st[(st.method == "kmerge") & (st.r_slot == 16)].iterrows():
        rows.append(dict(ds="real_stress", model="real", seed=int(r.seed), target=r.task, rest=[x for x in TASKS if x != r.task],
                         damage=1 - r.nscore, n=12, cluster=f"stress-{r.seed}", cos_table=np.nan, ttype=r.type))
    return pd.DataFrame(rows)


# ---------------- small I/O helpers ----------------
def save_cache(obj, name):
    os.makedirs(CACHE, exist_ok=True)
    with open(os.path.join(CACHE, name), "wb") as f:
        pickle.dump(obj, f)


def load_cache(name):
    with open(os.path.join(CACHE, name), "rb") as f:
        return pickle.load(f)


def update_results(new):
    """Merge `new` into results/geometry_results.json (each script owns its own keys)."""
    os.makedirs(RESULTS, exist_ok=True)
    cur = {}
    if os.path.exists(RESULTS_JSON):
        with open(RESULTS_JSON) as f:
            cur = json.load(f)
    cur.update(new)
    with open(RESULTS_JSON, "w") as f:
        json.dump(cur, f, indent=1, default=float)
