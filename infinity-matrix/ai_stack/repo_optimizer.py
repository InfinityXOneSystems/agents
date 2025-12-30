#!/usr/bin/env python3
"""
Repo Optimizer
Optimizes and fixes issues in repos autonomously.
"""

import os
import subprocess
import logging
from pathlib import Path

logging.basicConfig(filename=r'C:\AI\credentials\repo_optimize.log', level=logging.INFO)

REPOS_DIR = Path(r'C:\AI\repos')

def optimize_repo(repo_path):
    """Optimize a single repo."""
    try:
        os.chdir(repo_path)
        # Clean untracked files
        subprocess.run(['git', 'clean', '-fd'], check=True)
        # Reset to head
        subprocess.run(['git', 'reset', '--hard', 'HEAD'], check=True)
        # Pull latest
        subprocess.run(['git', 'pull'], check=True)
        logging.info(f"Optimized {repo_path}")
        print(f"✅ Optimized {repo_path}")
    except Exception as e:
        logging.error(f"Failed to optimize {repo_path}: {e}")
        print(f"❌ Failed {repo_path}: {e}")

def optimize_all_repos():
    """Optimize all repos in C:\AI\repos."""
    if not REPOS_DIR.exists():
        print("❌ Repos dir not found")
        return
    for repo in REPOS_DIR.iterdir():
        if repo.is_dir() and (repo / '.git').exists():
            optimize_repo(repo)

if __name__ == "__main__":
    print("Optimizing repos...")
    optimize_all_repos()
    print("Repo optimization complete!")