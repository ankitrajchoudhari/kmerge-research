import json, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager
from matplotlib.ticker import FuncFormatter, MultipleLocator

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, "data.json")))
OUT = os.path.join(HERE, "charts")
os.makedirs(OUT, exist_ok=True)

plt.rcParams.update({
    "font.family": "Inter", "font.size": 11, "axes.edgecolor": "#C9D1D9", "axes.linewidth": 0.8,
    "axes.spines.top": False, "axes.spines.right": False, "xtick.color": "#4A5561", "ytick.color": "#4A5561",
    "axes.labelcolor": "#4A5561", "figure.dpi": 200, "savefig.dpi": 200, "axes.titleweight": "bold",
})
INK, MUTED, GRID = "#1B263B", "#6B7785", "#E6EBF0"
COL = {"kmerge": "#D1495B", "linear": "#A3ADB8", "ties": "#A3ADB8", "dare_ties": "#A3ADB8", "delta_avg": "#A3ADB8",
       "regmean": "#E9A23B", "regmean_cf": "#E9A23B", "split": "#5FA97E", "kshare": "#0E7C86"}
NAME = {"kmerge": "K-Merge", "linear": "Plain average", "ties": "TIES", "dare_ties": "DARE + TIES",
        "regmean": "RegMean (best merge)", "regmean_cf": "RegMean (best merge)", "split": "Split (sharing)",
        "kshare": "K-Share (sharing)", "delta_avg": "Plain average"}


def title(fig, main, sub=None, y=0.985):
    fig.text(0.012, y, main, fontsize=15, fontweight="bold", color=INK, ha="left", va="top")
    if sub:
        fig.text(0.012, y - 0.075, sub, fontsize=10.5, color=MUTED, ha="left", va="top")


def source(fig, text):
    fig.text(0.012, 0.012, text, fontsize=8.5, color=MUTED, ha="left", va="bottom")


def pct(v):
    return f"{v * 100:.1f}"


def nudge(vals, gap):
    """Return label y positions so that no two are closer than gap (keeps order)."""
    idx = sorted(range(len(vals)), key=lambda i: vals[i])
    pos = [None] * len(vals)
    prev = None
    for i in idx:
        p = vals[i] if prev is None else max(vals[i], prev + gap)
        pos[i] = p; prev = p
    # re-centre the block so labels stay near their points
    shift = (sum(pos) - sum(vals)) / len(vals)
    return [p - shift for p in pos]


# ---------------- R1: who vs how ----------------
def r1():
    cfgs = [("kmerge|kmerge", "K-Merge as published\n(cosine partner + average)", COL["kmerge"]),
            ("kmerge|global_cos", "Better partner choice,\nsame averaging", "#E8A0A8"),
            ("kmerge|oracle", "Partner chosen with labelled\ndata (oracle), same averaging", "#E8A0A8"),
            ("gramU|kmerge", "Same partner, smarter merge\n(RegMean-style)", COL["regmean"]),
            ("kshare|kmerge", "Same partner, share the slot\n(K-Share)", COL["kshare"])]
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.6), sharey=True)
    for ax, key, lab in ((axs[0], "syn05", "Qwen2.5-0.5B"), (axs[1], "syn15", "Qwen2.5-1.5B")):
        vals = [D[key]["online4"][c][1] for c, _, _ in cfgs]
        ys = list(range(len(cfgs)))[::-1]
        lo = 0.75
        ax.barh(ys, [v - lo for v in vals], left=lo, color=[c for _, _, c in cfgs], height=0.62)
        for y, v in zip(ys, vals):
            ax.text(v + 0.004, y, pct(v), va="center", fontsize=10.5, color=INK, fontweight="bold")
        ax.set_xlim(lo, 1.04)
        ax.set_xticks([0.8, 0.85, 0.9, 0.95, 1.0]); ax.set_xticklabels(["80", "85", "90", "95", "100"])
        ax.xaxis.grid(True, color=GRID); ax.set_axisbelow(True)
        ax.set_title(lab, loc="left", fontsize=11.5, color=INK)
        ax.set_yticks(ys); ax.set_yticklabels([n for _, n, _ in cfgs], fontsize=9.5)
        ax.set_xlabel("weakest language, % of its own adapter")
    title(fig, "Changing HOW a slot stores tasks helps far more than changing WHO gets merged",
          "4 grammar-correction adapters (EN/DE/FR/HI) into K = 2 slots, all 24 arrival orders x 3 seeds; bars start at 75")
    source(fig, "Source: merge-lab notebook, FULL runs (sequence_summary.csv). Score = exact match / the language's own adapter.")
    fig.tight_layout(rect=(0, 0.04, 1, 0.84))
    fig.savefig(os.path.join(OUT, "r1_who_vs_how.png")); plt.close(fig)


# ---------------- R2: real benchmark dumbbell ----------------
ORDER = ["kmerge", "linear", "dare_ties", "ties", "regmean", "split", "kshare"]


def r2():
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.4), sharey=True)
    for ax, K in ((axs[0], "K2"), (axs[1], "K4")):
        tab = D[f"real_{K}"]
        ys = list(range(len(ORDER)))
        for y, m in zip(ys, ORDER):
            w, a = tab[m]["worst"], tab[m]["mean"]
            ax.plot([w, a], [y, y], color="#D5DCE3", lw=3, zorder=1)
            ax.scatter([w], [y], s=46, facecolor="white", edgecolor=COL[m], lw=2, zorder=2)
            ax.scatter([a], [y], s=58, color=COL[m], zorder=3)
            ax.text(a + 0.008, y, pct(a), va="center", fontsize=9.5, color=INK, fontweight="bold")
            ax.text(w - 0.008, y, pct(w), va="center", ha="right", fontsize=9.5, color=MUTED)
        ax.set_xlim(0.56, 1.06)
        ax.set_xticks([0.6, 0.7, 0.8, 0.9, 1.0]); ax.set_xticklabels(["60", "70", "80", "90", "100"])
        ax.xaxis.grid(True, color=GRID); ax.set_axisbelow(True)
        ax.set_yticks(ys); ax.set_yticklabels([("RegMean" if m == "regmean" else NAME[m]) for m in ORDER])
        ax.set_title(f"K = {K[1]} slots", loc="left", fontsize=11.5, color=INK)
        ax.set_xlabel("% of each task's own adapter")
    axs[0].scatter([], [], s=58, color=INK, label="average over 12 tasks")
    axs[0].scatter([], [], s=46, facecolor="white", edgecolor=INK, lw=2, label="weakest task")
    axs[0].legend(loc="upper left", frameon=False, fontsize=9)
    title(fig, "On 12 real tasks, sharing keeps about 99% on average and about 95% on the weakest task",
          "Grammar correction, summarisation and QA in EN/DE/ES/IT; Qwen2.5-1.5B-Instruct; 2 seeds x 2 arrival orders")
    source(fig, "Source: FULL_A run (leaderboard_K2/K4.csv). Every method uses K-Merge's slot grouping; split uses exactly one LoRA per slot.")
    fig.tight_layout(rect=(0, 0.04, 1, 0.84))
    fig.savefig(os.path.join(OUT, "r2_real_benchmark.png")); plt.close(fig)


# ---------------- R3: gain retained ----------------
def r3():
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.3), gridspec_kw={"width_ratios": [1.15, 1]})
    ax = axs[0]
    g = D["real_gain_retained_mean"]["K2"]
    ys = list(range(len(ORDER)))
    vals = [g[m] for m in ORDER]
    ax.barh(ys, vals, color=[COL[m] for m in ORDER], height=0.62)
    for y, v in zip(ys, vals):
        ax.text(v + 0.012, y, f"{v * 100:.0f}%", va="center", fontsize=10.5, color=INK, fontweight="bold")
    ax.set_yticks(ys); ax.set_yticklabels([NAME[m] for m in ORDER])
    ax.set_xlim(0, 1.12); ax.set_xticks([0, 0.25, 0.5, 0.75, 1.0]); ax.set_xticklabels(["0", "25", "50", "75", "100"])
    ax.xaxis.grid(True, color=GRID); ax.set_axisbelow(True)
    ax.set_title("All 12 tasks, K = 2", loc="left", fontsize=11.5, color=INK)
    ax.set_xlabel("% of the adapters' improvement over the base model that survives")
    ax = axs[1]
    bt = D["real_gain_retained_K2_by_type"]
    meths = ["kmerge", "regmean", "split", "kshare"]
    types = [("gec", "Grammar\ncorrection"), ("sum", "Summarisation"), ("qa", "Question\nanswering")]
    w = 0.19
    for i, m in enumerate(meths):
        xs = [j + (i - 1.5) * w for j in range(len(types))]
        vs = [bt[m][t] for t, _ in types]
        ax.bar(xs, vs, width=w * 0.92, color=COL[m], label=NAME[m])
        for x, v in zip(xs, vs):
            if m in ("kmerge", "kshare"):
                ax.text(x, v + 0.02, f"{v * 100:.0f}", ha="center", fontsize=8.5, color=INK)
    ax.set_xticks(range(len(types))); ax.set_xticklabels([n for _, n in types])
    ax.set_ylim(0, 1.38); ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0]); ax.set_yticklabels(["0", "25", "50", "75", "100"])
    ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)
    ax.set_title("By task type, K = 2", loc="left", fontsize=11.5, color=INK)
    ax.legend(frameon=False, fontsize=8.5, ncol=2, loc="upper left", bbox_to_anchor=(0, 1.0), columnspacing=1.0, handlelength=1.2)
    title(fig, "K-Merge keeps only 64% of what the adapters learned, and 36% for grammar correction",
          "Share of each task's gain (own adapter minus base model) still present after the slot is built; mean over tasks, seeds and orders")
    source(fig, "Computed afterwards from stream_results.csv (score, base, solo per task). Pooled version: K-Merge 58%, RegMean 80%, Split 95%, K-Share 95%.")
    fig.tight_layout(rect=(0, 0.04, 1, 0.84))
    fig.savefig(os.path.join(OUT, "r3_gain_retained.png")); plt.close(fig)


# ---------------- R4: stress ----------------
def r4():
    r = D["stress"]["r"]
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.4), sharey=False)
    for ax, key, lab in ((axs[0], "mean", "Average over the 12 tasks"), (axs[1], "worst", "Weakest task")):
        ms_ = ["kmerge", "regmean", "split", "kshare"]
        ends = nudge([D["stress"][key][m][-1] for m in ms_], 0.011 if key == "mean" else 0.022)
        starts = nudge([D["stress"][key][m][0] for m in ms_], 0.011 if key == "mean" else 0.022)
        for m, ye, ys_ in zip(ms_, ends, starts):
            v = D["stress"][key][m]
            ax.plot(r, v, marker="o", lw=2.4, ms=6, color=COL[m], label=NAME[m])
            ax.text(r[-1] * 1.08, ye, pct(v[-1]), va="center", fontsize=9, color=COL[m], fontweight="bold")
            ax.text(r[0] / 1.08, ys_, pct(v[0]), va="center", ha="right", fontsize=9, color=COL[m])
        ax.set_xscale("log", base=2); ax.set_xticks(r); ax.set_xticklabels([str(x) for x in r])
        ax.set_xlim(2.6, 23)
        ax.set_xlabel("directions (rank) available in the one shared slot")
        ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)
        ax.set_title(lab, loc="left", fontsize=11.5, color=INK)
        ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v * 100:.0f}"))
    h, l = axs[0].get_legend_handles_labels()
    fig.legend(h, l, frameon=False, fontsize=9.5, ncol=4, loc="upper left", bbox_to_anchor=(0.06, 0.86))
    axs[0].set_ylim(0.842, 0.99)
    axs[0].yaxis.set_major_locator(MultipleLocator(0.02)); axs[1].yaxis.set_major_locator(MultipleLocator(0.05))
    axs[0].text(4.5, 0.849, "at 4 directions, split leaves 8 of the 12 tasks with nothing", fontsize=8.5, color=MUTED, va="center")
    title(fig, "When one slot must hold all 12 tasks, the shared basis (K-Share) degrades gracefully",
          "All 12 real tasks squeezed into ONE slot with 16, 8 or 4 directions; Qwen2.5-1.5B; seed 0 (single seed)")
    source(fig, "Source: real-benchmark notebook, stress test (stress_table.csv). Score = % of each task's own adapter.")
    fig.tight_layout(rect=(0, 0.04, 1, 0.80))
    fig.savefig(os.path.join(OUT, "r4_stress.png")); plt.close(fig)


# ---------------- R5: capacity synthetic ----------------
def r5():
    M = [2, 3, 4]
    fig, axs = plt.subplots(1, 2, figsize=(10, 4.3), sharey=True)
    for ax, key, lab in ((axs[0], "syn05", "Qwen2.5-0.5B"), (axs[1], "syn15", "Qwen2.5-1.5B")):
        ms_ = ["kmerge", "delta_avg", "regmean_cf", "split", "kshare"]
        ends = nudge([D[key]["capacity_worst"][m][-1] for m in ms_], 0.018)
        for m, ye in zip(ms_, ends):
            v = D[key]["capacity_worst"][m]
            ls = "--" if m == "delta_avg" else "-"
            ax.plot(M, v, marker="o", lw=2.3, ms=6, color=COL[m], ls=ls, label=NAME[m])
            ax.text(4.08, ye, pct(v[-1]), va="center", fontsize=9, color=COL[m], fontweight="bold")
        ax.set_xticks(M); ax.set_xlim(1.8, 4.45)
        ax.set_xlabel("tasks sharing one rank-8 slot")
        ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)
        ax.set_title(lab, loc="left", fontsize=11.5, color=INK)
    axs[0].yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v * 100:.0f}"))
    axs[0].set_ylabel("weakest language, % of own adapter")
    axs[0].legend(frameon=False, fontsize=8.5, loc="lower left")
    title(fig, "The more tasks a slot holds, the more averaging hurts; sharing stays near 100%",
          "Synthetic grammar correction (EN/DE/FR/HI), every subset of languages, 3 seeds")
    source(fig, "Source: merge-lab notebook, FULL runs (capacity_summary.csv).")
    fig.tight_layout(rect=(0, 0.04, 1, 0.84))
    fig.savefig(os.path.join(OUT, "r5_capacity.png")); plt.close(fig)


# ---------------- R6: predictors ----------------
def r6():
    preds = [("cosine", "Cosine similarity\n(K-Merge's rule)"), ("self_gram", "Weight-only\ndistortion"),
             ("generated_input", "Distortion on\ngenerated inputs"), ("unlabeled_input", "Distortion on\n32 real inputs")]
    fig, ax = plt.subplots(figsize=(10, 4.2))
    w = 0.34
    for i, (key, lab, c) in enumerate((("syn05", "Qwen2.5-0.5B", "#7FA7C9"), ("syn15", "Qwen2.5-1.5B", "#2F5D8A"))):
        xs = [j + (i - 0.5) * w for j in range(len(preds))]
        vs = [D[key]["predictors_kmerge_only"][p] for p, _ in preds]
        ax.bar(xs, vs, width=w * 0.92, color=c, label=lab)
        for x, v in zip(xs, vs):
            ax.text(x, v + (0.02 if v >= 0 else -0.05), f"{v:+.2f}", ha="center", fontsize=9.5, color=INK)
    ax.axhline(0, color="#8B96A3", lw=1)
    ax.set_xticks(range(len(preds))); ax.set_xticklabels([n for _, n in preds])
    ax.set_ylim(-0.5, 0.6); ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)
    ax.set_ylabel("Spearman rho with damage\n(above 0 = works as expected)")
    ax.legend(frameon=False, fontsize=9.5, loc="upper right")
    title(fig, "No cheap score reliably predicts K-Merge's damage; cosine even flips direction between models",
          "36 language outcomes per model (18 K-Merge merges: 6 pairs x 3 seeds, 2 languages each); damage = 1 - normalised exact match")
    source(fig, "Source: merge-lab notebook, FULL runs (predictors.csv). Cosine is entered as -cosine, so above 0 means 'more similar, less damage'.")
    fig.tight_layout(rect=(0, 0.04, 1, 0.84))
    fig.savefig(os.path.join(OUT, "r6_predictors.png")); plt.close(fig)


# ---------------- R7: layer-selective ----------------
def r7():
    fig, ax = plt.subplots(figsize=(10, 3.9))
    groups = [("syn05", "0.5B average"), ("syn05", "0.5B weakest"), ("syn15", "1.5B average"), ("syn15", "1.5B weakest")]
    w = 0.36
    for i, (m, lab, c) in enumerate((("kmerge", "K-Merge (merge every layer)", COL["kmerge"]),
                                     ("layer_sel", "Layer-selective merge (keep stored adapter\nin conflicting layers)", "#7D6B91"))):
        xs = [j + (i - 0.5) * w for j in range(len(groups))]
        vs = [D[k]["pairs"][m][0 if "average" in g else 1] for k, g in groups]
        ax.bar(xs, vs, width=w * 0.92, color=c, label=lab)
        for x, v in zip(xs, vs):
            ax.text(x, v + 0.004, pct(v), ha="center", fontsize=9.5, color=INK)
    ax.set_xticks(range(len(groups))); ax.set_xticklabels([g for _, g in groups])
    ax.set_ylim(0.8, 1.06); ax.yaxis.grid(True, color=GRID); ax.set_axisbelow(True)
    ax.set_yticks([0.8, 0.85, 0.9, 0.95, 1.0]); ax.set_yticklabels(["80", "85", "90", "95", "100"])
    ax.set_ylabel("% of own adapter (axis starts at 80)")
    ax.legend(frameon=False, fontsize=9, loc="upper right", ncol=2, bbox_to_anchor=(1.0, 1.04))
    title(fig, "Skipping conflicting layers protects one language but costs the other: it loses to plain K-Merge",
          "6 language pairs x 3 seeds per model; normalised exact match; the gap between the two languages roughly doubles (0.5B) or grows 7x (1.5B)")
    source(fig, "Source: merge-lab notebook, FULL runs (leaderboard.csv). Worst single pair on 1.5B: EN-HI at 54%.")
    fig.tight_layout(rect=(0, 0.04, 1, 0.84))
    fig.savefig(os.path.join(OUT, "r7_layer_selective.png")); plt.close(fig)


# ---------------- R8: synthetic leaderboard ----------------
FAM = {"split": ("sharing", COL["split"]), "kshare": ("sharing", COL["kshare"]), "kshare_eq": ("sharing", COL["kshare"]),
       "gramU": ("functional merge", COL["regmean"]), "regmean_cf": ("functional merge", COL["regmean"]), "gramG": ("functional merge", COL["regmean"]),
       "kmerge": ("K-Merge", COL["kmerge"]), "layer_sel": ("lab idea", "#7D6B91"), "ocp": ("lab idea", "#7D6B91"), "casc_soft": ("lab idea", "#7D6B91"),
       "gram_iso": ("functional merge", "#F2C987")}
LABEL8 = {"split": "Split (each task keeps own directions)", "kshare": "K-Share (shared basis + small core)", "kshare_eq": "K-Share, exactly one slot of storage",
          "gramU": "GRAM-U (ours; = RegMean)", "regmean_cf": "RegMean", "gramG": "GRAM-G (generated inputs)", "tsv": "TSV-M", "ties": "TIES",
          "magmax": "MagMax", "knots_ties": "KnOTS + TIES", "slerp": "SLERP", "ocp": "Orthogonal-complement (lab)", "dare": "DARE",
          "delta_avg": "Plain average", "iso_c": "Iso-C", "gram_iso": "GRAM with isotropic prior", "task_arith": "Task arithmetic",
          "casc_soft": "Soft cascade (lab)", "kmerge": "K-Merge (Eq. 8)", "layer_sel": "Layer-selective (lab)"}


def r8():
    pairs = {k: v for k, v in D["syn05"]["pairs"].items() if not k.startswith("selfgram")}
    items = sorted(pairs.items(), key=lambda kv: kv[1][0])
    fig, ax = plt.subplots(figsize=(10, 6.6))
    ys = list(range(len(items)))
    for y, (m, (a, w)) in zip(ys, items):
        c = FAM.get(m, ("standard merge", "#A3ADB8"))[1]
        ax.barh(y, a - 0.85, left=0.85, color=c, height=0.68)
        ax.text(a + 0.002, y, pct(a), va="center", fontsize=8.5, color=INK)
    ax.set_yticks(ys); ax.set_yticklabels([LABEL8.get(m, m) for m, _ in items], fontsize=9)
    ax.set_xlim(0.85, 1.012); ax.set_xticks([0.85, 0.9, 0.95, 1.0]); ax.set_xticklabels(["85", "90", "95", "100"])
    ax.xaxis.grid(True, color=GRID); ax.set_axisbelow(True)
    ax.set_xlabel("average of the two languages, % of own adapter (bars start at 85)")
    from matplotlib.patches import Patch
    handles = [Patch(color=COL["kshare"], label="sharing"), Patch(color=COL["regmean"], label="functional merge (needs inputs)"),
               Patch(color="#A3ADB8", label="standard weight merge"), Patch(color="#7D6B91", label="our earlier lab ideas"),
               Patch(color=COL["kmerge"], label="K-Merge")]
    ax.legend(handles=handles, frameon=False, fontsize=8.5, loc="lower right")
    title(fig, "Only the three methods that share the slot stay near 100%",
          "Qwen2.5-0.5B, 6 language pairs x 3 seeds; 20 of 25 lab methods (3 ablation copies and 2 weight-only merges at 4.8% and 43.2% not shown)", y=0.99)
    fig.texts[-1].set_y(0.99 - 0.042)
    source(fig, "Source: merge-lab notebook, FULL 0.5B run (leaderboard.csv). Hyper-parameters chosen on a separate validation split.")
    fig.tight_layout(rect=(0, 0.03, 1, 0.9))
    fig.savefig(os.path.join(OUT, "r8_leaderboard_syn05.png")); plt.close(fig)


for f in (r1, r2, r3, r4, r5, r6, r7, r8):
    f()
print(sorted(os.listdir(OUT)))
