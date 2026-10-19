"""Step 2: overlap, residual and new-direction demand of every incoming LoRA.

For each case the slot is rebuilt the way K-Merge stores it (Eq. 8: the equal
average of the other tasks' A and B). Its SVD gives the slot's directions; the
"important" ones are the fewest top directions holding a given share of the
slot's energy (80%, 90% or 95%; 100% = all of them). The newcomer's update
dW_t = B_t A_t is projected onto them. Everything is pooled over layers and
modules, weighted by energy.

    python geometry.py                 # every part
    python geometry.py cases lab05     # one part (cases | pairs | combos | modules | energy | abcos) for one model
"""
import itertools
import sys
import time

from common import *


def geometry(rows, model, seed, fracs=FRACS, residual=True, per_layer=False):
    spec = MODELS[model]
    acc = {i: collections.defaultdict(float) for i in rows.index}
    cos_mod = {i: [] for i in rows.index}
    ab = {i: ([], []) for i in rows.index}
    layers = {i: np.zeros((spec["layers"], 2)) for i in rows.index}
    for l in range(spec["layers"]):
        for m in spec["mods"]:
            cache = {}

            def W(task):
                if task not in cache:
                    z = adapter(model, seed, task)
                    cache[task] = (z[f"L{l}_{m}_B"].astype(np.float64), z[f"L{l}_{m}_A"].astype(np.float64))
                return cache[task]

            for i, r in rows.iterrows():
                Bt, At = W(r.target)
                rest = [W(x) for x in r.rest]
                Br, Ar = np.mean([b for b, _ in rest], axis=0), np.mean([a for _, a in rest], axis=0)
                U, S, V = thin_svd(Br, Ar)
                S2 = S ** 2
                GA, GB = At @ At.T, Bt.T @ Bt
                Et = float(np.sum(GA * GB))                          # ||dW_t||^2
                St2 = thin_svd(Bt, At)[1] ** 2                       # the newcomer's own spectrum
                Xf, Yf = U.T @ Bt, At @ V                            # the newcomer in the slot's basis
                Pf = Xf @ Yf
                inner = float(np.sum((Bt.T @ Br) * (At @ Ar.T)))     # <dW_t, dW_slot>
                a = acc[i]
                a["E_t"] += Et
                a["E_r"] += float(S2.sum())
                a["inner"] += inner
                a["pf2"] += float(np.sum(Pf * Pf))
                a["agf"] += float(np.sum(np.diag(Pf) * S))
                cos_mod[i].append(inner / np.sqrt(Et * S2.sum()))
                for f in fracs:
                    k = k_at(S2, f)
                    X, Y = Xf[:k], Yf[:, :k]
                    P, Sk = X @ Y, S[:k]
                    p2 = float(np.sum(P * P))
                    a[f"p2_{f}"] += p2                                   # two-sided overlap energy
                    a[f"out_{f}"] += float(np.sum((X @ GA) * X))         # output side only
                    a[f"inn_{f}"] += float(np.sum((GB @ Y) * Y))         # input side only
                    a[f"agree_{f}"] += float(np.sum(np.diag(P) * Sk))
                    a[f"sk2_{f}"] += float(np.sum(Sk ** 2))
                    a[f"kselfE_{f}"] += k_at(St2, f) * Et
                    a[f"kslotE_{f}"] += k * Et
                    if residual:   # extra directions the slot would need to cover f of the newcomer's energy
                        Uk, Vk = U[:, :k], V[:, :k]
                        _, R1 = np.linalg.qr(np.concatenate([Bt, Uk], axis=1))
                        _, R2 = np.linalg.qr(np.concatenate([At, -(P @ Vk.T)], axis=0).T)
                        res2 = np.linalg.svd(R1 @ R2.T, compute_uv=False) ** 2
                        need = f * Et - p2
                        a[f"knewE_{f}"] += (0 if need <= 0 else int(np.searchsorted(np.cumsum(res2), need) + 1)) * Et
                    if per_layer and f == 0.9:
                        layers[i][l] += (p2, Et)
                if len(r.rest) == 1:
                    Bo, Ao = rest[0]
                    ab[i][0].append(float(np.sum(At * Ao) / np.linalg.norm(At) / np.linalg.norm(Ao)))
                    ab[i][1].append(float(np.sum(Bt * Bo) / np.linalg.norm(Bt) / np.linalg.norm(Bo)))
    out = []
    for i, a in acc.items():
        E = a["E_t"]
        d = dict(idx=i, cos=float(np.mean(cos_mod[i])), cos_pooled=a["inner"] / np.sqrt(E * a["E_r"]),
                 ov_full=a["pf2"] / E, demand_full=1 - a["pf2"] / E, agree_full=a["agf"] / np.sqrt(a["pf2"] * a["E_r"]),
                 A_cos=float(np.mean(ab[i][0])) if ab[i][0] else np.nan, B_cos=float(np.mean(ab[i][1])) if ab[i][1] else np.nan)
        for f in fracs:
            d[f"demand2_{f}"] = 1 - a[f"p2_{f}"] / E
            d[f"demand_out_{f}"] = 1 - a[f"out_{f}"] / E
            d[f"demand_in_{f}"] = 1 - a[f"inn_{f}"] / E
            d[f"agree_{f}"] = a[f"agree_{f}"] / np.sqrt(a[f"p2_{f}"] * a[f"sk2_{f}"])
            d[f"kself_{f}"] = a[f"kselfE_{f}"] / E
            d[f"kslot_{f}"] = a[f"kslotE_{f}"] / E
            if residual:
                d[f"knew_{f}"] = a[f"knewE_{f}"] / E
        out.append(d)
    return pd.DataFrame(out).set_index("idx"), (layers if per_layer else None)


def part_cases(model):
    """The 221 K-Merge cases: geometry at every cut-off, plus the per-layer overlap."""
    oc = build_outcomes()
    parts, layer_store = [], {}
    for seed in sorted(oc[oc.model == model].seed.unique()):
        rows = oc[(oc.model == model) & (oc.seed == seed)]
        g, lay = geometry(rows, model, int(seed), per_layer=True)
        parts.append(g)
        layer_store.update(lay)
    save_cache((pd.concat(parts), layer_store), f"geo_cases_{model}.pkl")


def part_pairs():
    """Every ordered pair of the 12 real adapters (seed 0): the overlap map and the A/B similarity."""
    rows = pd.DataFrame([dict(target=a, rest=[b]) for a in TASKS for b in TASKS if a != b])
    g, _ = geometry(rows, "real", 0, fracs=[0.9], residual=False)
    save_cache(rows.join(g), "geo_realpairs.pkl")


def part_combos(model):
    """Every (newcomer, slot) combination of the 4 lab languages, for replaying K-Merge's partner rule."""
    rows = []
    for seed in range(3):
        for t in LAB_LANGS:
            others = [x for x in LAB_LANGS if x != t]
            for k in [1, 2]:
                for rest in itertools.combinations(others, k):
                    rows.append(dict(model=model, seed=seed, target=t, rest=list(rest)))
    rows = pd.DataFrame(rows)
    parts = []
    for seed in range(3):
        sub = rows[rows.seed == seed]
        g, _ = geometry(sub, model, seed, fracs=[0.9], residual=False)
        parts.append(sub.join(g))
    save_cache(pd.concat(parts), f"geo_combos_{model}.pkl")


def part_modules(model):
    """Demand per layer and module for the lab pairs (compared with the measured activation change)."""
    pw = table(model, "pairwise_results.csv")
    out = []
    for _, r in pw[pw.method == "kmerge"].iterrows():
        za, zb = adapter(model, int(r.seed), r.a), adapter(model, int(r.seed), r.b)
        for l in range(MODELS[model]["layers"]):
            for m in MODELS[model]["mods"]:
                Ba, Aa = za[f"L{l}_{m}_B"].astype(np.float64), za[f"L{l}_{m}_A"].astype(np.float64)
                Bb, Ab = zb[f"L{l}_{m}_B"].astype(np.float64), zb[f"L{l}_{m}_A"].astype(np.float64)
                for (Bt, At, name), (Br, Ar) in [((Ba, Aa, r.a), (Bb, Ab)), ((Bb, Ab, r.b), (Ba, Aa))]:
                    U, S, V = thin_svd(Br, Ar)
                    k = k_at(S ** 2, 0.9)
                    Et = float(np.sum((At @ At.T) * (Bt.T @ Bt)))
                    P = (U[:, :k].T @ Bt) @ (At @ V[:, :k])
                    out.append(dict(model=model, seed=int(r.seed), pair=f"{r.a}-{r.b}", layer=l, module=f"{m}_proj", lang=name,
                                    demand=1 - float(np.sum(P * P)) / Et))
    save_cache(pd.DataFrame(out), f"module_geom_{model}.pkl")


def part_energy():
    """Share of each real adapter's energy in its top k directions (pooled over all 112 modules)."""
    curves = {}
    for seed in [0, 1]:
        for t in TASKS:
            z = adapter("real", seed, t)
            cum, tot = np.zeros(33), 0.0
            for l in range(28):
                for m in ["q", "k", "v", "o"]:
                    S2 = thin_svd(z[f"L{l}_{m}_B"].astype(np.float64), z[f"L{l}_{m}_A"].astype(np.float64))[1] ** 2
                    cum[1:len(S2) + 1] += np.cumsum(S2)
                    cum[len(S2) + 1:] += S2.sum()
                    tot += S2.sum()
            curves[(seed, t)] = cum / tot
    save_cache(curves, "energy_curves.pkl")


def part_abcos():
    """Cosine between two real adapters' A matrices and between their B matrices (per module, both seeds)."""
    out = {}
    for seed in [0, 1]:
        zs = [adapter("real", seed, t) for t in TASKS]
        cA, cB = [], []
        for l in range(28):
            for m in ["q", "k", "v", "o"]:
                for key, store in [("A", cA), ("B", cB)]:
                    X = np.stack([z[f"L{l}_{m}_{key}"].astype(np.float64).ravel() for z in zs])
                    G = X @ X.T
                    d = np.sqrt(np.diag(G))
                    store.append(G / np.outer(d, d))
        out[seed] = (np.mean(cA, axis=0), np.mean(cB, axis=0))   # 12 x 12, averaged over the 112 modules
    save_cache(out, "ab_real.pkl")


PARTS = {"cases": part_cases, "pairs": part_pairs, "combos": part_combos, "modules": part_modules, "energy": part_energy, "abcos": part_abcos}
DEFAULT = [("cases", "lab05"), ("cases", "lab15"), ("cases", "real"), ("pairs", None), ("combos", "lab05"), ("combos", "lab15"),
           ("modules", "lab05"), ("modules", "lab15"), ("energy", None), ("abcos", None)]

if __name__ == "__main__":
    jobs = DEFAULT if len(sys.argv) == 1 else [(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)]
    for part, model in jobs:
        t0 = time.time()
        PARTS[part](model) if model else PARTS[part]()
        print(f"{part} {model or ''}: done in {time.time() - t0:.0f} s", flush=True)
