"""Step 3: does new-direction demand predict K-Merge's damage better than cosine?

Reads the geometry from geometry.py and writes every number used in the report
to results/geometry_results.json (plus a few CSV tables in results/).

    python stats.py
"""
from scipy.stats import binomtest, rankdata, spearmanr

from common import *

PRED = ["neg_cos", "demand2", "demand_out", "demand_in", "knew", "conflict"]
CUTS = ["demand2_0.8", "demand2_0.9", "demand2_0.95", "demand_full"]
SETS = ["lab05_pairs", "lab15_pairs", "lab05_pairs+triples", "lab15_pairs+triples", "real_slots"]   # order fixes the random draws


def joined():
    oc = build_outcomes()
    g = pd.concat([load_cache(f"geo_cases_{m}.pkl")[0] for m in ["lab05", "lab15", "real"]])
    j = oc.join(g, how="inner")
    j["neg_cos"] = -j["cos"].round(9)          # round so both tasks of a pair tie exactly (cosine is symmetric)
    j["cos_r"] = j["cos"].round(9)
    j["demand2"], j["demand_out"], j["demand_in"] = j["demand2_0.9"], j["demand_out_0.9"], j["demand_in_0.9"]
    j["knew"], j["kself"], j["kslot"] = j["knew_0.9"], j["kself_0.9"], j["kslot_0.9"]
    j["agree"] = j["agree_0.9"]
    j["conflict"] = -j["agree"]
    return j


def subsets(j):
    return {"lab05_pairs": j[j.ds == "lab05_pairs"], "lab15_pairs": j[j.ds == "lab15_pairs"],
            "lab05_pairs+triples": j[j.model == "lab05"], "lab15_pairs+triples": j[j.model == "lab15"],
            "real_slots": j[j.ds == "real_slots"]}


def rho(df, x):
    return spearmanr(df[x], df["damage"]).correlation


def partial_rho(df, x, controls):
    """Spearman correlation of x and damage after removing what the controls explain (rank regression)."""
    Z = [np.ones(len(df))]
    for c in controls:
        if df[c].dtype == object:
            Z += [(df[c] == lev).astype(float).values for lev in sorted(df[c].unique())[1:]]
        else:
            Z.append(rankdata(df[c]))
    Z = np.column_stack(Z)

    def resid(v):
        beta, *_ = np.linalg.lstsq(Z, v, rcond=None)
        return v - Z @ beta

    return float(np.corrcoef(resid(rankdata(df[x])), resid(rankdata(df["damage"])))[0, 1])


def cluster_bootstrap(sets, preds, B=1000, seed=SEED):
    """Resample whole merges (clusters), recompute every score's rho and its difference from -cosine."""
    rng = np.random.default_rng(seed)
    out = {}
    for name in SETS:
        df = sets[name]
        cl = df["cluster"].unique()
        idx = {c: df.index[df["cluster"] == c] for c in cl}
        draws = {p: [] for p in preds}
        diffs = {p: [] for p in preds if p != "neg_cos"}
        for _ in range(B):
            pick = rng.choice(cl, size=len(cl), replace=True)
            sub = df.loc[np.concatenate([idx[c] for c in pick])]
            if sub["damage"].nunique() < 3:
                continue
            rc = rho(sub, "neg_cos")
            for p in preds:
                rp = rho(sub, p)
                draws[p].append(rp)
                if p != "neg_cos":
                    diffs[p].append(rp - rc)
        out[name] = (draws, diffs)
    return out


def main():
    j = joined()
    sets = subsets(j)
    res = {}

    # ---- main test and the cut-off check (one set of random draws for all scores)
    boot = cluster_bootstrap(sets, PRED + [c for c in CUTS if c != "demand2_0.9"])
    rows, robust = [], []
    for name in SETS:
        df = sets[name]
        draws, diffs = boot[name]
        rc = rho(df, "neg_cos")
        for p in PRED:
            r0 = rho(df, p)
            row = dict(set=name, n=len(df), pred=p, rho=r0, lo=np.nanpercentile(draws[p], 2.5), hi=np.nanpercentile(draws[p], 97.5))
            if p != "neg_cos":
                row.update(d_point=r0 - rc, d_lo=np.nanpercentile(diffs[p], 2.5), d_hi=np.nanpercentile(diffs[p], 97.5),
                           d_vs_cos=float(np.mean(diffs[p])), p_better=float(np.mean(np.array(diffs[p]) > 0)))
            rows.append(row)
        for c in CUTS:
            dd = diffs["demand2" if c == "demand2_0.9" else c]
            robust.append(dict(set=name, cut=c, rho_cos=rc, rho_dem=rho(df, "demand2" if c == "demand2_0.9" else c),
                               d=rho(df, "demand2" if c == "demand2_0.9" else c) - rc,
                               lo=np.nanpercentile(dd, 2.5), hi=np.nanpercentile(dd, 97.5)))
    res["rho"] = pd.DataFrame(rows).round(4).to_dict(orient="records")
    res["robust"] = pd.DataFrame(robust).round(4).to_dict(orient="records")
    pd.DataFrame(rows).to_csv(os.path.join(RESULTS, "rho_table.csv"), index=False)

    # ---- real tasks: what task type and slot size explain
    R = sets["real_slots"]
    res["real_partial"] = {p: dict(raw=round(rho(R, p), 4), partial_n=round(partial_rho(R, p, ["n"]), 4),
                                   partial_type=round(partial_rho(R, p, ["ttype"]), 4),
                                   partial_n_type=round(partial_rho(R, p, ["n", "ttype"]), 4)) for p in PRED + CUTS}
    res["real_rho_n_damage"] = round(spearmanr(R.n, R.damage).correlation, 4)
    res["real_type_means"] = R.groupby("ttype")[["damage", "cos", "demand2", "agree"]].mean().round(4).to_dict()

    # ---- does demand add anything beyond cosine? (partial correlation, own bootstrap seed)
    rng2 = np.random.default_rng(7)

    def boot_partial(df, x, controls, B=1000):
        cl = df["cluster"].unique()
        idx = {c: df.index[df["cluster"] == c] for c in cl}
        v = []
        for _ in range(B):
            pick = rng2.choice(cl, size=len(cl), replace=True)
            sub = df.loc[np.concatenate([idx[c] for c in pick])]
            if sub["damage"].nunique() < 3:
                continue
            try:
                v.append(partial_rho(sub, x, controls))
            except Exception:
                pass
        return np.nanpercentile(v, [2.5, 97.5])

    inc = []
    for name in ["lab05_pairs", "lab15_pairs", "real_slots"]:
        df = sets[name]
        for x, ctrl in [("demand2", ["cos_r"]), ("neg_cos", ["demand2"])]:
            lo, hi = boot_partial(df, x, ctrl)
            inc.append(dict(set=name, x=x, given="cos" if ctrl[0] == "cos_r" else ctrl[0], partial=round(partial_rho(df, x, ctrl), 4), lo=round(float(lo), 4), hi=round(float(hi), 4)))
    res["incremental_partial"] = inc
    res["spearman_cos_demand"] = {k: round(float(spearmanr(sets[k].cos_r, sets[k].demand2).correlation), 4)
                                  for k in ["lab05_pairs", "lab15_pairs", "real_slots"]}

    # ---- direction: inside one slot, is the task with the higher score the one hurt more?
    j["slot_id"] = [f"{r.ds}|{r.seed}|{r.get('K', '')}|{r.get('order', '')}|" + "+".join(sorted([r.target] + list(r.rest)))
                    for _, r in j.iterrows()]
    direction = []
    for ds in ["lab05_pairs", "lab15_pairs", "lab05_triples", "lab15_triples", "real_slots"]:
        d = j[j.ds == ds]
        for p in ["demand2", "neg_cos"]:
            right = wrong = tied = 0
            for _, g in d.groupby("slot_id"):
                g = g.reset_index(drop=True)
                for a in range(len(g)):
                    for b in range(a + 1, len(g)):
                        dd, dp = g.damage[a] - g.damage[b], g[p][a] - g[p][b]
                        if abs(dd) < 1e-9 or abs(dp) < 1e-9:
                            tied += 1
                        elif dp * dd > 0:
                            right += 1
                        else:
                            wrong += 1
            pv = binomtest(right, right + wrong, 0.5).pvalue if right + wrong else None
            direction.append(dict(ds=ds, pred=p, right=right, wrong=wrong, tied=tied, sign_p=None if pv is None else round(pv, 4)))
    res["direction_test"] = direction

    # ---- geometry summaries
    res["n_outcomes"] = j.groupby("ds").size().to_dict()
    res["geo_means"] = j.groupby("ds")[["demand2", "demand_out", "demand_in", "agree", "cos", "knew", "kself", "kslot", "damage"]].mean().round(4).to_dict(orient="index")
    res["robust_overlap_real"] = {c: round(float(1 - R[c].mean()), 4) for c in CUTS}
    res["robust_min_new_all"] = {c: round(float(j[c].min()), 4) for c in CUTS}
    res["robust_knew_kself_real"] = {str(f): [round(float(R[f"knew_{f}"].mean()), 2), round(float(R[f"kself_{f}"].mean()), 2)] for f in FRACS}
    res["identity_max_err"] = float(np.max(np.abs(j.cos_pooled - np.sqrt(j.ov_full) * j.agree_full)))
    res["ranges"] = {ds: dict(n=len(d), dem_min=round(d.demand2.min(), 4), dem_max=round(d.demand2.max(), 4), cos_min=round(d.cos.min(), 4),
                              cos_max=round(d.cos.max(), 4), dmg_mean=round(d.damage.mean(), 4), dmg_max=round(d.damage.max(), 4),
                              zero_dmg=round(float((d.damage.abs() < 1e-9).mean()), 4)) for ds, d in j.groupby("ds")}
    res["ranges"]["all"] = dict(n=len(j), dem_min=round(j.demand2.min(), 4), dem_max=round(j.demand2.max(), 4))
    lp = j[j.ds.isin(["lab05_pairs", "lab15_pairs"])]
    asym = {m: dict(A_cos=round(lp[lp.model == m].A_cos.mean(), 4), B_cos=round(lp[lp.model == m].B_cos.mean(), 4)) for m in ["lab05", "lab15"]}

    # ---- the 12 x 12 overlap map of real adapters
    JP = load_cache("geo_realpairs.pkl")
    JP["overlap"], JP["partner"] = 1 - JP["demand2_0.9"], JP.rest.str[0]
    mat = JP.pivot_table(index="target", columns="partner", values="overlap").loc[TASKS, TASKS]
    res["overlap_matrix"] = {"tasks": TASKS, "values": [[None if pd.isna(v) else round(float(v), 4) for v in row] for row in mat.values]}
    same_type = JP[JP.target.str.split("_").str[0] == JP.partner.str.split("_").str[0]]
    same_lang = JP[JP.target.str.split("_").str[1] == JP.partner.str.split("_").str[1]]
    neither = JP.drop(same_type.index.union(same_lang.index))
    res["overlap_groups"] = {g: dict(overlap=round(d.overlap.mean(), 4), ov_out=round(1 - d["demand_out_0.9"].mean(), 4), cos=round(d.cos.mean(), 4), n=len(d))
                             for g, d in [("same_type", same_type), ("same_language", same_lang), ("neither", neither)]}
    res["kself_real"] = JP.groupby("target")["kself_0.9"].first().round(2).to_dict()
    # directions an adapter needs for 90% of its own energy: median of the 8 adapters (2 seeds x 4 languages) of each task type
    ks = j[j.model == "real"].groupby(["seed", "target"])["kself_0.9"].first().reset_index()
    res["kself_type"] = {t: round(float(ks[ks.target.str.startswith(t + "_")]["kself_0.9"].median()), 1) for t in TYPES}
    # A vs B similarity of real adapters: all 132 ordered pairs of each seed, both seeds together
    ab = load_cache("ab_real.pkl")
    off = ~np.eye(len(TASKS), dtype=bool)
    av = np.concatenate([ab[s][0][off] for s in ab]); bv = np.concatenate([ab[s][1][off] for s in ab])
    asym["real"] = dict(A_cos=round(float(av.mean()), 4), A_min=round(float(av.min()), 4), B_cos=round(float(bv.mean()), 4),
                        B_min=round(float(bv.min()), 4), B_max=round(float(bv.max()), 4), pairs=int(off.sum()), seeds=len(ab))
    res["asym"] = asym

    # ---- overlap layer by layer
    oc = build_outcomes()
    store = {}
    for m in ["lab05", "lab15", "real"]:
        store.update(load_cache(f"geo_cases_{m}.pkl")[1])
    res["layer_profiles"] = {}
    for ds in ["lab05_pairs", "lab15_pairs", "real_slots"]:
        s = sum(store[i] for i in oc.index[oc.ds == ds])
        res["layer_profiles"][ds] = [round(float(x), 4) for x in s[:, 0] / s[:, 1]]

    # ---- per layer and module: demand vs cosine against the activation change measured on Kaggle
    layer_test = []
    for model in ["lab05", "lab15"]:
        ld = table(model, "layer_diagnostics.csv")
        mg = load_cache(f"module_geom_{model}.pkl")
        long = []
        for side in ["a", "b"]:
            x = ld.copy()
            x["lang"] = x.pair.str.split("-").str[0 if side == "a" else 1]
            x["dact"] = x[f"dact_{side}"]
            long.append(x[["seed", "pair", "layer", "module", "lang", "cos", "subspace_overlap", "dact"]])
        L = pd.concat(long).merge(mg, on=["seed", "pair", "layer", "module", "lang"])
        L["neg_cos"], L["neg_subov"] = -L["cos"], -L["subspace_overlap"]
        for p in ["neg_cos", "demand", "neg_subov"]:
            within = L.groupby(["seed", "pair", "lang"])[[p, "dact"]].apply(lambda g: spearmanr(g[p], g["dact"]).correlation).mean()
            layer_test.append(dict(model=model, n=len(L), pred=p, target="dact", pooled_rho=round(spearmanr(L[p], L["dact"]).correlation, 4),
                                   mean_within_task_rho=round(float(within), 4)))
    res["layer_test"] = layer_test

    # ---- energy held by the top k directions (real adapters, seed 0)
    curves = load_cache("energy_curves.pkl")
    res["energy_frac_real_s0"] = {f"top{k}": round(float(np.mean([curves[(0, t)][k] for t in TASKS])), 4) for k in [1, 3, 5, 8, 16, 32]}

    # ---- per-case table for anyone who wants to redo the statistics without the adapters
    keep = ["ds", "model", "seed", "target", "rest", "n", "ttype", "damage", "cluster", "cos", "cos_pooled", "ov_full", "agree_full"] + \
           [c for c in j.columns if c.startswith(("demand", "knew_", "kself_", "kslot_", "agree_"))]
    j[keep].to_csv(os.path.join(RESULTS, "cases_geometry.csv"), index=False)
    update_results(res)
    print(pd.DataFrame(rows)[["set", "pred", "rho", "d_point", "d_lo", "d_hi"]].round(3).to_string(index=False))


if __name__ == "__main__":
    os.makedirs(RESULTS, exist_ok=True)
    main()
