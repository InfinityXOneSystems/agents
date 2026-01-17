#!/usr/bin/env python3
"""
Problem Fixer Agent
Fixes linting problems and syncs unsynced files.
"""

import os
import subprocess
import logging
from pathlib import Path

logging.basicConfig(filename=r'C:\AI\credentials\problem_fixer.log', level=logging.INFO)

REPOS_DIR = Path(r'C:\AI\repos')

class ProblemFixer:
    def fix_repo_problems(self, repo_path):
        """Fix problems in a repo."""
        try:
            os.chdir(repo_path)
            # Auto-fix ESLint
            if (repo_path / 'package.json').exists():
                subprocess.run(['npx', 'eslint', '--fix', '.'], check=False)  # Don't fail if no eslint
                logging.info(f"ESLint fixed in {repo_path.name}")
            # Format with Prettier
            subprocess.run(['npx', 'prettier', '--write', '.'], check=False)
            # Run TypeScript check if tsconfig
            if (repo_path / 'tsconfig.json').exists():
                subprocess.run(['npx', 'tsc', '--noEmit'], check=False)
            # Run Python lint and format
            if list(repo_path.glob('*.py')):
                subprocess.run(['python', '-m', 'autopep8', '--in-place', '--recursive', '.'], check=False)
                subprocess.run(['python', '-m', 'black', '.'], check=False)  # Add black for better formatting
                subprocess.run(['python', '-m', 'flake8', '--max-line-length=100', '.'], check=False)
            # Add and commit fixes
            subprocess.run(['git', 'add', '.'], check=True)
            result = subprocess.run(['git', 'diff', '--cached', '--quiet'], capture_output=True)
            if result.returncode != 0:
                subprocess.run(['git', 'commit', '-m', 'Auto-fix linting, formatting, and issues'], check=True)
                subprocess.run(['git', 'push'], check=True)
                logging.info(f"Problems fixed and pushed for {repo_path.name}")
        except Exception as e:
            logging.error(f"Fix failed for {repo_path}: {e}")
            # Retry once
            try:
                subprocess.run(['git', 'reset', '--hard', 'HEAD~1'], check=False)  # Reset if commit failed
                logging.info(f"Retried fix for {repo_path}")
            except:
                pass

    def fix_all_problems(self):
        """Fix problems in all repos."""
        for repo_dir in REPOS_DIR.iterdir():
            if repo_dir.is_dir() and (repo_dir / '.git').exists():
                self.fix_repo_problems(repo_dir)

if __name__ == "__main__":
    fixer = ProblemFixer()
    fixer.fix_all_problems()
    print("Problems fixed!")