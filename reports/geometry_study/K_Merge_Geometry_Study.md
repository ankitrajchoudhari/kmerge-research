# K-Merge Geometry Study: How Much Is Really New?

13 October 2026, updated 17 October 2026 · Ankit Raj Choudhary · Supervisor: Prof. Divya Saxena, IIT Jodhpur (SAIDE)

Deck: K_Merge_Geometry_Study.pptx (22 slides, speaker notes on every slide). Raw numbers: geometry_results.json.

## The question (Prof. Saxena)

"How much genuinely new information does the incoming adapter bring?" Measure the overlap and residual between the incoming LoRA and the current slot, and check whether this "new-direction demand" predicts when K-Merge fails better than simple cosine similarity. If it does, store only the genuinely new directions instead of averaging complete adapters.

Pass rule, fixed before looking at the results: demand must beat cosine with a 95% interval above zero on both lab models and on the real tasks.

## Method (CPU only, no new GPU runs)

- **Data:** 48 saved adapters from Phase 3:
  - 0.5B lab: Qwen2.5-0.5B, rank 8, q and v.
  - 1.5B lab: Qwen2.5-1.5B, rank 8, q and v.
  - Real benchmark: Qwen2.5-1.5B, rank 32, q k v o.
- **Cases:** 221 cases where K-Merge put a task into a shared slot and its damage is known:
  - 0.5B lab: 36 pair cases and 27 three-task cases.
  - 1.5B lab: 36 pair cases and 24 three-task cases.
  - Real benchmark: 86 slot cases and 12 cases from the one-slot stress test.
- **Slot:** the equal average of the other tasks' A and B, as K-Merge's Eq. 8 stores it.
- **Important directions:** from the slot's SVD, the top directions holding 90% of its energy.
- **Overlap:** ||U_k^T ΔW_t V_k||² / ||ΔW_t||², pooled over all layers and modules by energy. Demand = 1 − overlap.
- **k_self:** the number of directions the newcomer needs to keep 90% of its own energy.
- **k_new:** the number of extra directions the slot needs to cover 90% of the newcomer.
- **Statistics:** Spearman ρ with damage; cluster bootstrap with 1,000 draws (seed 20261013); partial ρ controlling for slot size and task type.
- **Correction made during checking:** cosine gives the same value to both tasks of a pair, so those values must count as exact ties. With ties handled correctly, cosine's ρ matches the Phase 3 report: +0.44 (0.5B) and −0.34 (1.5B).

## Results

**1. About 90% of every adapter is new.**

| Test bed | Overlap | New |
|---|---|---|
| 0.5B lab, pairs | 7.8% | 92.2% |
| 0.5B lab, 3-task slots | 10.9% | 89.1% |
| 1.5B lab, pairs | 5.6% | 94.4% |
| 1.5B lab, 3-task slots | 8.2% | 91.8% |
| Real, K-Merge slots | 11.1% | 88.9% |
| Real, one-slot stress test | 10.2% | 89.8% |

- In all 221 cases, at least 80.5% of the newcomer was new.
- The slot's existing directions save almost no room. A newcomer needs about as many new directions as it needs on its own:
  - Real: k_new 17.5 vs k_self 17.1, out of 32 directions.
  - Lab: k_new 4.4–4.6 vs k_self 4.3–4.5, out of 8.

**2. Task type decides overlap; language barely does.** These are real pairs, seed 0, over 132 ordered pairs.

| Pair type | Overlap | Cosine |
|---|---|---|
| Same task type | 10.2% | 0.16 |
| Same language, different task | 4.9% | 0.02 |
| Different task and language | 4.5% | 0.02 |

The highest single pair is Spanish → Italian summaries, at 15.8%.

**3. Demand vs cosine as a predictor of damage.** Spearman ρ. For cosine the sign is flipped, so for both scores a higher ρ means a better predictor.

| Test bed | −cosine | Demand | Demand − cosine (95% CI) |
|---|---|---|---|
| 0.5B lab, pairs (36) | 0.44 | 0.58 | +0.14 (+0.01 to +0.32): better |
| 1.5B lab, pairs (36) | −0.34 | −0.25 | +0.09 (−0.11 to +0.31): not significant |
| Real slots (86) | 0.65 | 0.62 | −0.03 (−0.06 to +0.004): not better |

- **With the 3-task slots added:** 0.5B gives +0.14 (+0.06 to +0.24); 1.5B gives +0.06 (−0.06 to +0.18).
- **Pass rule: not met.**

**4. On real tasks, task type and slot size explain both scores.**

| | Raw ρ | Slot size held fixed | Slot size and task type held fixed |
|---|---|---|---|
| −Cosine | 0.65 | 0.61 | 0.00 |
| Demand | 0.62 | 0.57 | 0.03 |

| Task type | Damage | Cosine | Demand |
|---|---|---|---|
| Grammar | 19.4% | 0.12 | 91.0% |
| Summaries | 5.3% | 0.23 | 86.8% |
| QA | 0.4% | 0.19 | 88.2% |

**5. Used as a partner rule, demand changes nothing.**

- **Setup:** K-Merge's online procedure, replayed for 24 arrival orders × 3 seeds with K = 2.
- **Same slots:** the demand rule built exactly the same slots as cosine in 60 of 70 runs (0.5B) and 64 of 68 runs (1.5B).
- **0.5B weakest language:** −0.4 points (95% CI −1.1 to +0.4).
- **1.5B:** identical results.

**6. Check (17 October): the 90% cut-off does not change the answer.**

| Cut-off | New share, real tasks | Lowest new share (221 cases) | k_new vs k_self (real) | Demand − cosine: 0.5B | 1.5B | Real |
|---|---|---|---|---|---|---|
| 80% | 91.6% | 83.5% | 11.0 vs 10.8 | +0.16 (+0.05 to +0.34) better | +0.11 (−0.08 to +0.36) | −0.01 (−0.04 to +0.02) |
| 90% (used) | 88.9% | 80.5% | 17.5 vs 17.1 | +0.14 (+0.01 to +0.32) better | +0.09 (−0.11 to +0.31) | −0.03 (−0.06 to +0.004) |
| 95% | 86.9% | 78.4% | 22.8 vs 22.3 | +0.12 (−0.03 to +0.30) | +0.05 (−0.18 to +0.27) | −0.04 (−0.06 to −0.01) worse |
| 100% (all directions) | 83.9% | 75.4% | – | +0.12 (−0.04 to +0.32) | +0.001 (−0.21 to +0.20) | −0.05 (−0.09 to −0.004) worse |

- Demand never beats cosine on all three test beds at any cut-off.
- With slot size and task type held fixed, demand's partial ρ on real tasks is between −0.03 and 0.06 at every cut-off (cosine: 0.00).

**7. Capacity by function, measured from the saved Phase 3 results (17 October, CPU only).**

- **Why this works without a GPU:** under split, each task reads only its own top k directions, so its score depends only on its own k. The same task with the same k always gave exactly the same score in different slots (checked). The saved runs give each real task at k = 0 (base model), 1, 2, 3, 4 and 8 directions (seed 0; seed 1 has 3, 4, 8 and more).
- **Functional need** (fewest own directions keeping ≥ 97% of the task's own-adapter quality, seed 0):
  - QA: 1 direction, for all four languages.
  - Grammar: 1–8 (median 3). Summaries: 3–10 (median 3.5).
  - Those directions hold only about 55% of the energy (range 29–80%). Keeping 90% of the energy would take 16–18 directions.
  - All 12 tasks together need about 40 directions (39 in seed 0, 42 in seed 1), but one slot has 32. So a 32-direction slot fits about 9–10 tasks with their own directions.
- **Giving directions by need instead of equally** (all 12 real tasks in one slot, seed 0). "By need" is a best case: each task's number of directions was chosen with the same test scores, the same number in every layer, so it is an upper bound.

| Directions in the slot | Equal split | By need (best case) | By energy (Phase 3) | K-Share |
|---|---|---|---|---|
| 4 | 87.1% | 87.8% | 90.7% | 94.4% |
| 8 | 91.0% | 92.9% | 94.3% | 96.7% |
| 16 | 98.2% | 98.5% | 96.0% | 97.8% |

- Giving directions by need adds at most +1.9 points over an equal split, even with perfect knowledge.
- When tasks outnumber directions, a shared basis (K-Share) wins: 96.7% vs 92.9% at 8 directions.
- The energy-based method varies the number per layer and module, which is why it can beat the best case when the slot is crowded.
- So the planned GPU test (unequal private directions by need) has little room to win, and was not run.

## Lessons (the new side)

1. **Cosine already contains the overlap.**
   - Exact identity: cosine = √(overlap with all of the slot's directions) × agreement. It was checked on all 221 cases; the error is below 10⁻¹⁵.
   - Demand and cosine rank cases almost identically: ρ = −0.91 (0.5B), −0.88 (1.5B), −0.98 (real).
   - **What demand adds is direction.** Cosine gives both tasks of a pair the same value; demand does not. On 0.5B pairs, the task with the higher demand was the one hurt more in 16 of 18 pairs (p = 0.001). On 1.5B this held in 10 of 16 (p = 0.45).
2. **The task lives in B, and A is almost shared.**
   - Cosine between two different tasks' A matrices is 0.97–0.99, against 0.06–0.15 for their B matrices.
   - On the input side, 65–81% of a newcomer is already in the slot. On the output side, only 7–13% is.
   - The reason: all adapters started from the same random A, and A barely moves during training (Zhu et al., ICML 2024).
   - Storage idea: one shared A per slot plus one B per task (the HydraLoRA design).
3. **Energy is not function.**
   - A real adapter needs about 17 of its 32 directions to keep 90% of its energy.
   - Yet with about 3 directions per task (11 tasks in one 32-direction slot), split kept 98.5–98.9% of quality. Those 3 directions hold only about 55% of the energy.
   - Phase 3's energy-based allocation helped only when the slot was crowded. At 4 directions it scored 90.7% against split's 87.1%; at 16 directions it scored 96.0% against split's 98.2%.
4. **Layers.**
   - Overlap peaks in the middle layers: up to 17% at layer 17 on the real tasks. It is lowest in the last layers (6–8%), so those layers hold the most task-specific directions.
   - Per layer and module, cosine tracked the activation change caused by merging slightly better than demand did: 0.64 vs 0.60 on 0.5B, and 0.64 vs 0.51 on 1.5B.

## Answer and next step

- **How much is new?** About 90%.
- **Does the amount that is new predict when K-Merge fails?** Not beyond the 0.5B lab. Task type and crowding do.
- **The capacity-aware idea:**
  - Storing each task's own directions instead of averaging is right. That is what sharing does: 98.9% vs K-Merge's 90.8% in Phase 3.
  - Little is shared (about 10%, mostly within a task type), so storing only the new directions saves little room.
  - By function most tasks need only 1–4 of their own directions, but giving unequal shares adds at most about 2 points. When crowded, a shared basis (K-Share) is better.
  - The rule that remains: keep each task's own directions while their needs fit the slot (about 9–10 tasks in 32 directions); beyond that, share a basis.
- **Next GPU time (suggested):** the missing seeds of the main results (stress test seeds 1–2, real benchmark seed 2), instead of the capacity test, whose best case is already known.
- **Prior work:**
  - Iso-CTS (Marczak et al., ICML 2025): a common subspace plus task-specific directions.
  - TSV-C (Gargiulo et al., CVPR 2025): each task keeps its top directions.
  - HydraLoRA (Tian et al., NeurIPS 2024): one shared A with several B matrices.
  - What would be new: capacity set by functional need, inside K-Merge's online, fixed-storage setting.

## Sources

- Shenaj et al. K-Merge. ACL 2026. https://arxiv.org/abs/2510.13537
- Zhu et al. Asymmetry in Low-Rank Adapters of Foundation Models. ICML 2024. https://arxiv.org/abs/2402.16842
- Tian et al. HydraLoRA: An Asymmetric LoRA Architecture for Efficient Fine-Tuning. NeurIPS 2024. https://arxiv.org/abs/2404.19245
- Marczak et al. No Task Left Behind: Isotropic Model Merging with Common and Task-Specific Subspaces. ICML 2025. https://arxiv.org/abs/2502.04959
- Gargiulo et al. Task Singular Vectors: Reducing Task Interference in Model Merging. CVPR 2025. https://arxiv.org/abs/2412.00081
