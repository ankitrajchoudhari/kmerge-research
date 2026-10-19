# Reports and slide decks

| Folder | Files | Built by |
|---|---|---|
| `phase3/` | `K_Merge_Phase3_Report.md` (the text), `K_Merge_Phase3_Report.docx`, `K_Merge_Phase3_Explainer.pptx` (25 slides), `K_Merge_Proof_Tracker.xlsx`, `charts/` | `build_docx.py`, `build_deck.js`, `build_tracker.py`, `charts.py` |
| `geometry_study/` | `K_Merge_Geometry_Study.md`, `K_Merge_Geometry_Study.pptx` (22 slides with speaker notes) | `build_deck.js`; `prep.py` turns `geometry_results.json` into `deck_data.json` |

## Rebuild

Slide decks (Node.js 18 or newer):

```bash
cd reports
npm install
node phase3/build_deck.js
node geometry_study/build_deck.js
```

Charts, Word report and tracker (the Word report also needs pandoc):

```bash
pip install matplotlib numpy python-docx lxml openpyxl
python phase3/charts.py        # draws phase3/charts/ (uses the Inter font when it is installed)
python phase3/build_docx.py    # uses the charts
python phase3/build_tracker.py
```

`build_tracker.py` writes formulas without stored results; Excel calculates them when it opens the file. The copy in this folder was saved once in LibreOffice, so its values are already filled in.

## Inputs

- `phase3/data.json`: the numbers the Phase 3 charts and deck use, taken from the Kaggle result tables (plus the Phase 1 and 2 figures).
- `geometry_study/geometry_results.json`: the results file the geometry deck was built from (17 October 2026). `analysis/run_all.py` writes the same numbers to `results/geometry_results.json`.
- `geometry_study/oct17.json`: the 17 October part of that file (cut-off check and capacity), read directly by the deck.
- `img/`: 3D icons from Microsoft Fluent Emoji (MIT License, see `img/NOTICE.md`).
