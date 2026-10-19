# Geometry and capacity analysis (CPU only)

This folder recomputes every number in the geometry study (`reports/geometry_study/`) from the Kaggle outputs. It needs no GPU and no PyTorch: the adapters are read with a small loader that only rebuilds tensors, so a downloaded file cannot run code.

## Run it

```bash
pip install -r requirements.txt
python download_kaggle.py   # once: the 48 adapters into data/adapters and data/npz
python run_all.py           # steps 2 to 5, about 10 minutes on one CPU core
```

`download_kaggle.py` needs a Kaggle API token, the same one the official `kaggle` tool uses: `KAGGLE_API_TOKEN` (or `~/.kaggle/access_token`), or the older `kaggle.json` key.

| Step | Script | What it does | Writes |
|---|---|---|---|
| 1 | `download_kaggle.py` | Downloads the adapters and result tables from the notebooks' saved outputs (lab notebook version 4 = 0.5B, version 5 = 1.5B; real benchmark version 8) and converts the adapters to numpy | `data/adapters/`, `data/npz/` |
| 2 | `geometry.py` | For each of the 221 K-Merge cases, rebuilds the slot as K-Merge stores it (equal average of the other tasks' A and B, Eq. 8), takes its SVD and measures how much of the newcomer lies in the slot's important directions: overlap, demand, k_new, k_self and agreement at the 80%, 90%, 95% and 100% cut-offs. Also the 12 x 12 overlap map, the lab partner-rule combinations, demand per layer and module, energy curves and the A/B similarity | `data/cache/*.pkl` |
| 3 | `stats.py` | Spearman rho of each score with damage, cluster bootstrap (1,000 draws, seed 20261013), partial rho controlling for slot size and task type, the direction (sign) test and the summaries | `results/geometry_results.json`, `results/rho_table.csv`, `results/cases_geometry.csv` |
| 4 | `partner_rule.py` | Replays K-Merge's online procedure for 24 arrival orders x 3 seeds with cosine or demand as the partner rule | `who_all`, `who_matched` in the results file |
| 5 | `capacity.py` | Capacity by function from the saved split runs: the fewest directions that keep at least 97% of a task's quality, and the best possible allocation by need | `capacity`, `split_11task_slot` in the results file, `results/split_curves.csv` |

## Where each number in the report comes from

All keys are in `results/geometry_results.json`.

| Report section | Keys |
|---|---|
| 1. About 90% of every adapter is new | `geo_means` (demand2 = new share at the 90% cut-off), `ranges`, `robust_knew_kself_real` |
| 2. Task type decides overlap | `overlap_groups`, `overlap_matrix` |
| 3. Demand vs cosine | `rho` (`d_point`, `d_lo`, `d_hi`: demand minus cosine and its 95% interval) |
| 4. Task type and slot size explain both scores | `real_partial`, `real_type_means`, `real_rho_n_damage` |
| 5. Demand as a partner rule | `who_all`, `who_matched` |
| 6. The cut-off check | `robust`, `robust_overlap_real`, `robust_min_new_all`, `robust_knew_kself_real`, `real_partial` (the demand cut-offs) |
| 7. Capacity by function | `capacity` (`need97`, `alloc`, `curve_seed0`), `kself_type`, `energy_frac_real_s0`, `split_11task_slot` |
| Lessons | `identity_max_err`, `spearman_cos_demand`, `direction_test`, `asym`, `layer_profiles`, `layer_test`, `incremental_partial` |

A fresh run on 19 October 2026 reproduced every value in the report's results file to 4 decimals.

## Definitions

- **Case:** one task in one K-Merge slot whose score after merging is known. 221 cases: 0.5B lab 36 pair and 27 three-task cases, 1.5B lab 36 and 24, real benchmark 86 slot cases and 12 from the one-slot stress test.
- **Damage** = 1 - (score after K-Merge) / (the task's own adapter score).
- **Overlap** = ||U_k^T dW_t V_k||^2 / ||dW_t||^2, pooled over layers and modules by energy, where U_k and V_k are the slot's top directions holding the cut-off share of its energy. **Demand** = 1 - overlap.
- **k_self:** directions the newcomer needs for 90% of its own energy. **k_new:** extra directions the slot would need to cover 90% of the newcomer.
- Cosine is symmetric, so both tasks of a pair get the same value. It is rounded to 9 decimals so that those values tie exactly in the rank correlation.
- The intervals use one random stream (seed 20261013) in a fixed order of test beds. `partner_rule.py` continues that stream, so its interval also matches the report.
