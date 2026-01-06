"""
Auto Pipeline: Diagnose, Scrape, Clean, Compile, Document
- Orchestrates full autonomous workflow for real estate intelligence
"""
import os
import time

STEPS = [
    ('Diagnose Environment', 'diagnose_env'),
    ('Scrape Data', 'florida_distressed_scraper.py'),
    ('Clean Data', 'data_cleaning.py'),
    ('Consensus & Sentiment', 'consensus_sentiment.py'),
    ('Compile Results', 'output_writer.py'),
    ('Document Results', 'results/dashboard/dashboard.py')
]

def run_step(name, script):
    print(f'[AUTO_PIPELINE] Running: {name}')
    if script == 'diagnose_env':
        # Simple environment check
        print('[DIAGNOSE] Python:', os.sys.version)
        print('[DIAGNOSE] Working Dir:', os.getcwd())
    elif script.endswith('.py'):
        os.system(f'C:/AI/infinity-matrix/.venv/Scripts/python.exe submodules/real_estate_intelligence/{script}')
    else:
        print(f'[AUTO_PIPELINE] Unknown step: {script}')
    print(f'[AUTO_PIPELINE] Completed: {name}\n')

if __name__ == "__main__":
    for name, script in STEPS:
        run_step(name, script)
        time.sleep(2)
    print('[AUTO_PIPELINE] All steps complete. Results and documents updated.')
