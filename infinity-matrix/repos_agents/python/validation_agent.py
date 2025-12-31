#!/usr/bin/env python3
"""
Validation Agent
Verifies perfect code and linting in repos.
"""

import os
import subprocess
import logging
import time
from pathlib import Path

logging.basicConfig(filename=r'C:\AI\credentials\validation_agent.log', level=logging.INFO)

REPOS_DIR = Path(r'C:\AI\repos')

class ValidationAgent:
    def validate_repo(self, repo_path):
        """Validate a repo for code quality and lint."""
        try:
            os.chdir(repo_path)
            # Run ESLint if package.json exists
            if (repo_path / 'package.json').exists():
                result = subprocess.run(['npx', 'eslint', '.'], capture_output=True, text=True)
                if result.returncode != 0:
                    logging.warning(f"ESLint issues in {repo_path.name}: {result.stdout}")
                else:
                    logging.info(f"ESLint passed for {repo_path.name}")
            # Run Prettier check
            result = subprocess.run(['npx', 'prettier', '--check', '.'], capture_output=True, text=True)
            if result.returncode != 0:
                logging.warning(f"Prettier issues in {repo_path.name}: {result.stdout}")
            # Run Python lint if applicable
            if list(repo_path.glob('*.py')):
                result = subprocess.run(['python', '-m', 'flake8', '.'], capture_output=True, text=True)
                if result.returncode != 0:
                    logging.warning(f"Flake8 issues in {repo_path.name}: {result.stdout}")
        except Exception as e:
            logging.error(f"Validation failed for {repo_path}: {e}")

    def validate_all_repos(self):
        """Validate all repos."""
        for repo_dir in REPOS_DIR.iterdir():
            if repo_dir.is_dir() and (repo_dir / '.git').exists():
                self.validate_repo(repo_dir)

    def run_validation(self):
        """Run validation every 10 minutes."""
        while True:
            self.validate_all_repos()
            time.sleep(600)  # 10 minutes

if __name__ == "__main__":
    import time
    agent = ValidationAgent()
    agent.run_validation()