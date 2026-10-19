# K-Merge research: merging vs sharing LoRA adapters on a device

Ankit Raj Choudhari · Supervisor: Prof. Divya Saxena, IIT Jodhpur (SAIDE)

K-Merge (Shenaj et al., ACL 2026) keeps only K LoRA adapter slots on a phone. When a new task's adapter arrives, K-Merge averages it into the most similar slot. This research tests where that averaging breaks, and whether sharing the slot instead (each task keeps its own directions inside it) works better.

This repository holds the Kaggle notebooks that trained and tested the adapters, the CPU analysis behind the geometry study, and the reports and slide decks together with the scripts that build them.

## Contents

| Folder | What is in it |
|---|---|
| `notebooks/` | The four Kaggle notebooks (they need a GPU) |
| `data/kaggle_outputs/` | Result tables and figures saved by the Kaggle runs |
| `analysis/` | CPU-only code for the geometry and capacity study (numpy, pandas, scipy) |
| `results/` | What `analysis/` writes: every number in the geometry study |
| `reports/` | Phase 3 report, decks, proof tracker and the geometry study, with their build scripts |

## Notebooks

| File | Kaggle notebook | What it does |
|---|---|---|
| `01_lora_research.ipynb` | `lora-research` | Phase 1 on Qwen2.5-0.5B: small grammar-correction adapters for EN, DE and FR (LoRA r = 8 on q and v) that arrive one after another and are merged |
| `02_kmerge.ipynb` | `kmerge` | The same Phase 1 experiments on Qwen2.5-1.5B |
| `03_kmerge_merge_lab.ipynb` | `kmerge-merge-lab-1` | Phase 3 merge lab: 25 merging and sharing methods on synthetic grammar correction in EN, DE, FR and HI, 3 seeds. Saved here as version 4 (Qwen2.5-0.5B). Version 5 is the same notebook with `MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"` |
| `04_kmerge_real_benchmark.ipynb` | `kmerge-real-benchmark` | Phase 3 real benchmark (version 8): 12 real tasks (grammar correction, summaries and QA in EN, DE, ES, IT) on Qwen2.5-1.5B with LoRA r = 32 on q, k, v, o, plus the one-slot stress test |

The notebooks download the models and build their data themselves. Their outputs stay on Kaggle (user `ankitrajchoudhari01`); the result tables used here are copied into `data/kaggle_outputs/`:

| Folder | Notebook and version | Run |
|---|---|---|
| `lab05` | `kmerge-merge-lab-1`, version 4 | Qwen2.5-0.5B, 128 train / 40 validation / 100 test examples per language |
| `lab15` | `kmerge-merge-lab-1`, version 5 | Qwen2.5-1.5B, same data |
| `real` | `kmerge-real-benchmark`, version 8 | Qwen2.5-1.5B, r = 32, 800 train / 150 test examples per task |

## Main results

**Phase 3 (5 October 2026).** Most of the damage comes from averaging, not from choosing the wrong partner. On 12 real tasks with K = 2, sharing the slot (split) kept 98.9% of each task's own-adapter quality at exactly the same storage, against 95.6% for the best merging methods (RegMean, TIES) and 90.8% for K-Merge. See `reports/phase3/`.

**Geometry study (13 to 17 October 2026, CPU only).** Prof. Saxena's question: how much genuinely new information does an incoming adapter bring, and does that "new-direction demand" predict when K-Merge fails better than cosine similarity?

- About 90% of every incoming adapter is new: the slot's important directions cover only about 10% of it.
- Demand predicts K-Merge's damage better than cosine only on the 0.5B lab. On real tasks, task type and slot size explain both scores.
- By function, most tasks need only 1 to 4 of their own directions (QA needs 1). Giving directions by need adds at most about 2 points over an equal split; when a slot is crowded, a shared basis (K-Share) is better.

See `reports/geometry_study/`.

## Reproduce the geometry study

```bash
cd analysis
pip install -r requirements.txt
python download_kaggle.py   # needs a Kaggle API token; fetches the 48 adapters (about 0.9 GB)
python run_all.py           # about 10 minutes on one CPU core
```

`run_all.py` rewrites `results/geometry_results.json`. Details are in `analysis/README.md`.

## Not in this repository

- The trained adapters (`.pt` files, about 0.9 GB). `analysis/download_kaggle.py` fetches them from the notebooks' saved outputs.
- The real benchmark's datasets and their machine translations (W&I+LOCNESS, Falko-MERLIN, COWS-L2H, MERLIN, SAMSum, SQuAD). Each has its own licence; notebook 04 downloads them and builds the tasks.
- Large per-example files from the runs (`predictions_test.csv`, `eval_cache.jsonl`, `results.zip`).

## References

- Shenaj et al. K-Merge. ACL 2026. https://arxiv.org/abs/2510.13537
- Zhu et al. Asymmetry in Low-Rank Adapters of Foundation Models. ICML 2024. https://arxiv.org/abs/2402.16842
- Tian et al. HydraLoRA. NeurIPS 2024. https://arxiv.org/abs/2404.19245
- Marczak et al. No Task Left Behind: Isotropic Model Merging with Common and Task-Specific Subspaces. ICML 2025. https://arxiv.org/abs/2502.04959
- Gargiulo et al. Task Singular Vectors: Reducing Task Interference in Model Merging. CVPR 2025. https://arxiv.org/abs/2412.00081
