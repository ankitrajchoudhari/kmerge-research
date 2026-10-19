"""Step 5: capacity by function, measured from the saved Phase 3 results.

Under "split" every task keeps only its own top k directions, so its score
depends only on its own k (checked below: the same task with the same k always
scored the same). The real benchmark ran split in slots of 1, 3, 4, 8, 9 and 11
tasks and in a one-slot stress test with 4, 8 and 16 directions, which gives
each task's quality at k = 0 (base model), 1, 2, 3, 4, 8, ... directions.

    python capacity.py
"""
from common import *

R_SLOT = 32   # directions in one real slot (LoRA rank 32)


def split_curves():
    sr, st = table("real", "stream_results.csv"), table("real", "stress_results.csv")
    pts = []
    for _, r in sr[sr.method == "split"].iterrows():
        slot = r.slot.split("+")
        n, i = len(slot), slot.index(r.task)
        k = R_SLOT // n + (1 if i < R_SLOT % n else 0)      # how split shares the slot (first tasks get the remainder)
        pts.append(dict(seed=int(r.seed), task=r.task, k=min(k, R_SLOT), nscore=r.nscore))
    for _, r in st[st.method == "split"].iterrows():
        R_, i = int(r.r_slot), TASKS.index(r.task)
        pts.append(dict(seed=int(r.seed), task=r.task, k=R_ // 12 + (1 if i < R_ % 12 else 0), nscore=r.nscore))
    pt = pd.DataFrame(pts)
    spread = pt.groupby(["seed", "task", "k"]).nscore.agg(lambda s: s.max() - s.min()).max()
    assert spread < 1e-12, f"split is not deterministic in k (spread {spread})"
    base = {}
    for r in sr.drop_duplicates(["seed", "task"]).itertuples():           # k = 0: the base model alone
        base[(int(r.seed), r.task)] = (r.base / r.solo) if r.solo >= 0.05 else r.base
    pt0 = pd.DataFrame([dict(seed=s, task=t, k=0, nscore=v) for (s, t), v in base.items()])
    return pd.concat([pt, pt0]).groupby(["seed", "task", "k"], as_index=False).nscore.first()


def best_allocation(opts, R, objective="mean"):
    """Exact best number of directions per task (from the measured curves) under a budget of R directions."""
    best = {0: (0.0 if objective == "mean" else np.inf, [])}
    for t in TASKS:
        nb = {}
        for used, (sc, al) in best.items():
            for k, q in opts[t]:
                if used + k > R:
                    continue
                ns = sc + q if objective == "mean" else min(sc, q)
                if used + k not in nb or ns > nb[used + k][0]:
                    nb[used + k] = (ns, al + [(t, k, q)])
        best = nb
    _, al = max(best.values(), key=lambda x: x[0])
    qs = [q for _, _, q in al]
    return dict(mean=float(np.mean(qs)), worst=float(np.min(qs)), alloc=[(t, int(k)) for t, k, _ in al])


def main():
    cur = split_curves()
    energy = load_cache("energy_curves.pkl")
    cur["energy"] = [float(energy[(r.seed, r.task)][int(r.k)]) for r in cur.itertuples()]
    cur.to_csv(os.path.join(RESULTS, "split_curves.csv"), index=False)
    need = []
    for (s, t), g in cur.groupby(["seed", "task"]):
        ok = g[g.nscore >= 0.97].sort_values("k")
        need.append(dict(seed=int(s), task=t, need=int(ok.k.iloc[0]) if len(ok) else None,
                         energy=round(float(ok.energy.iloc[0]), 3) if len(ok) else None))
    # what giving directions by need could reach in the crowded one-slot test (seed 0; an upper bound,
    # because each task's k is chosen with the same test scores)
    c0 = cur[cur.seed == 0]
    opts = {t: list(zip(g.k.astype(int), g.nscore)) for t, g in c0.groupby("task")}
    st = table("real", "stress_results.csv")
    st = st[st.seed == 0]
    alloc = []
    for R_ in [4, 8, 16]:
        a = best_allocation(opts, R_)
        meas = {m: st[(st.method == m) & (st.r_slot == R_)].nscore for m in ["split", "kshare", "adaptive"]}
        alloc.append(dict(R=R_, split=round(meas["split"].mean(), 4), split_worst=round(meas["split"].min(), 4),
                          byneed=round(a["mean"], 4), byneed_worst=round(a["worst"], 4), energy=round(meas["adaptive"].mean(), 4),
                          kshare=round(meas["kshare"].mean(), 4), kshare_worst=round(meas["kshare"].min(), 4), byneed_alloc=a["alloc"]))
    # the crowded K = 2 slot (11 of 12 tasks) of the real benchmark: about 3 directions per task under split
    sr = table("real", "stream_results.csv")
    sr = sr[sr.slot.str.count("[+]") == 10]
    eleven = {m: [round(float(sr[(sr.method == m) & (sr.seed == s)].nscore.mean()), 4) for s in sorted(sr.seed.unique())] for m in ["split", "kmerge", "kshare"]}
    eleven["split_worst"] = [round(float(sr[(sr.method == "split") & (sr.seed == s)].nscore.min()), 4) for s in sorted(sr.seed.unique())]
    eleven["rows"] = int(len(sr))
    update_results({"split_11task_slot": eleven})
    update_results({"capacity": {"need97": need, "alloc": alloc,
                                 "curve_seed0": {t: {str(int(k)): round(float(q), 4) for k, q in zip(g.k, g.nscore)} for t, g in c0.groupby("task")}}})
    print(pd.DataFrame(need).pivot_table(index="task", columns="seed", values="need").to_string())
    print(pd.DataFrame(alloc).drop(columns="byneed_alloc").to_string(index=False))


if __name__ == "__main__":
    os.makedirs(RESULTS, exist_ok=True)
    main()
