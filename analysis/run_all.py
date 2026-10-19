"""Run the whole CPU analysis: geometry, statistics, partner rule, capacity.

    python download_kaggle.py   # once, needs Kaggle credentials (adapters are not in git)
    python run_all.py           # about 10 minutes on a laptop CPU
"""
import subprocess
import sys

for script in ["geometry.py", "stats.py", "partner_rule.py", "capacity.py"]:
    print(f"== {script}", flush=True)
    subprocess.run([sys.executable, script], check=True)
