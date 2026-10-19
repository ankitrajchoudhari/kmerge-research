"""Derive every number the geometry deck shows from geometry_results.json (no hand-typed results)."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(HERE, "geometry_results.json")))
G = R["geo_means"]
rho = {(r["set"], r["pred"]): r for r in R["rho"]}

def pct(x, nd=1):
    return round(100 * x, nd)

D = {}
sets6 = [("lab05_pairs", "0.5B lab: pairs"), ("lab05_triples", "0.5B lab: 3 in a slot"),
         ("lab15_pairs", "1.5B lab: pairs"), ("lab15_triples", "1.5B lab: 3 in a slot"),
         ("real_slots", "12 real tasks: K-Merge slots"), ("real_stress", "12 real tasks in ONE slot")]
D["overlap_sets"] = [dict(key=k, label=l, n=R["n_outcomes"][k], overlap=pct(1 - G[k]["demand2"]), new=pct(G[k]["demand2"]),
                          knew=round(G[k]["knew"], 1), kself=round(G[k]["kself"], 1), kslot=round(G[k]["kslot"], 1),
                          in_cov=pct(1 - G[k]["demand_in"]), out_new=pct(G[k]["demand_out"]), dmg=pct(G[k]["damage"]))
                     for k, l in sets6]
D["n_total"] = sum(R["n_outcomes"].values())
D["dem_min_all"] = pct(R["ranges"]["all"]["dem_min"])
D["dem_max_all"] = pct(R["ranges"]["all"]["dem_max"])
D["ranges"] = R["ranges"]

def rrow(s, p):
    r = rho[(s, p)]
    return dict(rho=round(r["rho"], 4), lo=round(r["lo"], 4), hi=round(r["hi"], 4),
                d=None if r["d_point"] != r["d_point"] else round(r["d_point"], 4),
                dlo=None if r["d_lo"] != r["d_lo"] else round(r["d_lo"], 4),
                dhi=None if r["d_hi"] != r["d_hi"] else round(r["d_hi"], 4),
                pb=None if r["p_better"] != r["p_better"] else round(r["p_better"], 3))
PRED = ["neg_cos", "demand2", "demand_out", "demand_in", "knew", "conflict"]
SETS = ["lab05_pairs", "lab05_pairs+triples", "lab15_pairs", "lab15_pairs+triples", "real_slots"]
D["rho"] = {s: {p: rrow(s, p) for p in PRED} for s in SETS}
D["real_partial"] = R["real_partial"]
D["real_rho_n_damage"] = R["real_rho_n_damage"]
tm = R["real_type_means"]
D["type_means"] = {t: dict(damage=pct(tm["damage"][t]), cos=round(tm["cos"][t], 2), demand=pct(tm["demand2"][t]), agree=round(tm["agree"][t], 2)) for t in ["gec", "sum", "qa"]}
D["who"] = {w["model"]: dict(runs=w["runs"], km_avg=pct(w["kmerge_avg"]), dm_avg=pct(w["demand_avg"]), km_worst=pct(w["kmerge_worst"]), dm_worst=pct(w["demand_worst"]),
                             d_worst=pct(w["d_worst"]), lo=pct(w["lo"]), hi=pct(w["hi"])) for w in R["who_matched"]}
D["who_same"] = {w["model"]: dict(same=int(w["same_as_kmerge"]), runs=w["runs"], missing=w["missing"]) for w in R["who_all"] if w["rule"] == "lowest demand (Ma'am)"}
D["identity_err"] = 1.6653345369377348e-16
D["spearman_cos_demand"] = R["spearman_cos_demand"]
D["incremental"] = R["incremental_partial"]
D["direction"] = {f'{d["ds"]}|{d["pred"]}': d for d in R["direction_test"]}
D["asym"] = R["asym"]
D["energy"] = [dict(k=k, pct=pct(R["energy_frac_real_s0"][f"top{k}"])) for k in [1, 3, 5, 8, 16, 32]]
D["kself_real"] = R["kself_real"]
D["layer_profiles"] = {k: [pct(v) for v in vals] for k, vals in R["layer_profiles"].items()}
D["layer_test"] = {f'{r["model"]}|{r["pred"]}': dict(pooled=round(r["pooled_rho"], 2), within=round(r["mean_within_task_rho"], 2), n=r["n"]) for r in R["layer_test"]}
D["overlap_matrix"] = {"tasks": R["overlap_matrix"]["tasks"], "values": [[None if v is None else pct(v) for v in row] for row in R["overlap_matrix"]["values"]]}
D["overlap_groups"] = {g: dict(overlap=pct(v["overlap"]), cos=round(v["cos"], 2), n=v["n"], ov_out=pct(v["ov_out"])) for g, v in R["overlap_groups"].items()}
vals = [v for row in R["overlap_matrix"]["values"] for v in row if v is not None]
D["overlap_max"] = pct(max(vals)); D["overlap_min"] = pct(min(vals))
D["split_11"] = R["split_11task_slot"]
D["adaptive"] = R["adaptive_phase3"]
# three illustrative real arrivals (taken from the scatter rows)
sc = R["scatter_real"]
def find(target, K, order, seed, n):
    m = [r for r in sc if r["target"] == target and r["K"] == K and r["order"] == order and r["seed"] == seed and r["n"] == n]
    assert len(m) == 1, (target, len(m)); r = m[0]
    return dict(target=target, K=int(K), order=order, seed=seed, n=n, overlap=pct(1 - r["demand2"]), new=pct(r["demand2"]), cos=round(r["cos"], 2), damage=pct(r["damage"]))
D["examples"] = [find("sum_es", 4.0, "random", 1, 3), find("qa_de", 4.0, "random", 0, 4), find("gec_it", 2.0, "clustered", 1, 11)]
json.dump(D, open(os.path.join(HERE, "deck_data.json"), "w"), indent=1)
print(json.dumps({k: D[k] for k in ["overlap_sets", "n_total", "dem_min_all", "dem_max_all", "examples", "who", "who_same", "type_means", "overlap_groups", "overlap_max", "overlap_min", "energy"]}, indent=0)[:4000])
print({s: (D["rho"][s]["neg_cos"]["rho"], D["rho"][s]["demand2"]) for s in SETS})
