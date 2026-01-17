#!/usr/bin/env python3
"""
Perfect Sync Agent
Ensures local and remote GitHub repos are in perfect live sync.
"""

import os
import subprocess
import time
import logging
from pathlib import Path
from github.github_agent import GitHubAgent

logging.basicConfig(filename=r'C:\AI\credentials\sync_agent.log', level=logging.INFO)

REPOS_DIR = Path(r'C:\AI\repos')

class PerfectSyncAgent:
    def __init__(self):
        self.github = GitHubAgent()

    def sync_repo(self, repo_name, local_path):
        """Sync a repo perfectly."""
        try:
            os.chdir(local_path)
            # Fetch all branches
            subprocess.run(['git', 'fetch', '--all', '--prune'], check=True)
            # Reset hard to origin/main
            subprocess.run(['git', 'reset', '--hard', 'origin/main'], check=True)
            # Clean untracked and ignored
            subprocess.run(['git', 'clean', '-fdx'], check=True)
            # Pull with rebase to avoid conflicts
            subprocess.run(['git', 'pull', '--rebase'], check=True)
            # Push any local commits
            subprocess.run(['git', 'push'], check=True)
            logging.info(f"Perfectly synced {repo_name}")
        except Exception as e:
            logging.error(f"Sync failed for {repo_name}: {e}")
            # Force sync on failure
            try:
                subprocess.run(['git', 'reset', '--hard', 'HEAD'], check=True)
                subprocess.run(['git', 'pull', '--force'], check=True)
                logging.info(f"Force synced {repo_name}")
            except:
                logging.error(f"Force sync also failed for {repo_name}")

    def sync_all_repos(self):
        """Sync all local repos with remote."""
        if not REPOS_DIR.exists():
            return
        for repo_dir in REPOS_DIR.iterdir():
            if repo_dir.is_dir() and (repo_dir / '.git').exists():
                repo_name = repo_dir.name
                self.sync_repo(repo_name, repo_dir)

    def run_perfect_sync(self):
        """Run perfect sync every 5 minutes."""
        while True:
            self.sync_all_repos()
            time.sleep(300)  # 5 minutes

if __name__ == "__main__":
    agent = PerfectSyncAgent()
    agent.run_perfect_sync()