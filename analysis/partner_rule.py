"""Step 4: use demand as K-Merge's partner rule and replay the online procedure.

For all 24 arrival orders x 3 seeds (4 languages, K = 2 slots), each rule
decides which slot a newcomer joins. Every grouping is scored with the quality
the lab notebook measured for it (sequence_results.csv); groupings that were
never measured are skipped.

    python partner_rule.py
"""
import itertools

from common import *

N_CLUSTERS = [18, 18, 27, 26, 14]   # clusters per set in stats.py; replayed so the intervals match the report exactly


def simulate(lookup, model, seed, order, score):
    slots = []
    for t in order:
        if len(slots) < 2:
            slots.append([t])
            continue
        vals = [score(lookup[(model, seed, t, tuple(sorted(s)))]) for s in slots]
        slots[int(np.argmax(vals))].append(t)
    return frozenset(frozenset(s) for s in slots)


def main():
    combos = pd.concat([load_cache(f"geo_combos_{m}.pkl") for m in ["lab05", "lab15"]])
    lookup = {(r.model, r.seed, r.target, tuple(sorted(r.rest))): r for _, r in combos.iterrows()}
    rules = {"cosine (K-Merge)": lambda r: r.cos, "lowest demand": lambda r: -r["demand2_0.9"],
             "lowest output demand": lambda r: -r["demand_out_0.9"]}
    seqtab = {}
    for model in ["lab05", "lab15"]:
        sq = table(model, "sequence_results.csv")
        km = sq[(sq.rule == "kmerge") & (sq.set == "4lang")]
        for _, r in km.iterrows():
            seqtab[(model, int(r.seed), frozenset(frozenset(g) for g in parse_slots(r.slots)))] = (r.avg_nem, r.worst_nem)
    summary = []
    for model in ["lab05", "lab15"]:
        for name, sc in rules.items():
            avg, worst, miss, same = [], [], 0, 0
            for seed in range(3):
                for order in itertools.permutations(LAB_LANGS):
                    part = simulate(lookup, model, seed, order, sc)
                    if (model, seed, part) not in seqtab:
                        miss += 1
                        continue
                    a, w = seqtab[(model, seed, part)]
                    avg.append(a)
                    worst.append(w)
                    same += part == simulate(lookup, model, seed, order, rules["cosine (K-Merge)"])
            summary.append(dict(model=model, rule=name, runs=len(avg), missing=miss, avg=np.mean(avg), worst=np.mean(worst), same_as_kmerge=same))
        # for reference: the partner policies the lab notebook itself ran (kmerge = cosine, global_cos, oracle)
        sq = table(model, "sequence_results.csv")
        for pol in ["kmerge", "global_cos", "oracle"]:
            t = sq[(sq.rule == "kmerge") & (sq.set == "4lang") & (sq.policy == pol)]
            summary.append(dict(model=model, rule=f"table: {pol}", runs=len(t), missing=0, avg=t.avg_nem.mean(), worst=t.worst_nem.mean(), same_as_kmerge=np.nan))
    # matched comparison: runs where both rules produced a measured grouping
    rng = np.random.default_rng(SEED)
    for n in N_CLUSTERS:          # same random stream as the report
        for _ in range(1000):
            rng.choice(n, size=n, replace=True)
    matched = []
    for model in ["lab05", "lab15"]:
        pairs = []
        for seed in range(3):
            for order in itertools.permutations(LAB_LANGS):
                k = simulate(lookup, model, seed, order, rules["cosine (K-Merge)"])
                d = simulate(lookup, model, seed, order, rules["lowest demand"])
                if (model, seed, k) in seqtab and (model, seed, d) in seqtab:
                    pairs.append((seqtab[(model, seed, k)], seqtab[(model, seed, d)]))
        ka = np.array([p[0][0] for p in pairs]); kw = np.array([p[0][1] for p in pairs])
        da = np.array([p[1][0] for p in pairs]); dw = np.array([p[1][1] for p in pairs])
        bs = [np.mean(rng.choice(dw - kw, size=len(dw))) for _ in range(4000)]
        matched.append(dict(model=model, runs=len(pairs), kmerge_avg=ka.mean(), demand_avg=da.mean(), kmerge_worst=kw.mean(),
                            demand_worst=dw.mean(), d_worst=float(np.mean(dw - kw)), lo=float(np.percentile(bs, 2.5)), hi=float(np.percentile(bs, 97.5))))
    update_results({"who_all": pd.DataFrame(summary).round(4).to_dict(orient="records"),
                    "who_matched": pd.DataFrame(matched).round(4).to_dict(orient="records")})
    print(pd.DataFrame(summary).round(4).to_string(index=False))
    print(pd.DataFrame(matched).round(4).to_string(index=False))


if __name__ == "__main__":
    main()
