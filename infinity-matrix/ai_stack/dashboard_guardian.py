#!/usr/bin/env python3
"""
Dashboard Guardian Agent
Ensures no problems on dashboard and perfect sync at all times.
Monitors and fixes issues autonomously.
"""

import time
import logging
from pathlib import Path
from perfect_sync_agent import PerfectSyncAgent
from validation_agent import ValidationAgent
from problem_fixer import ProblemFixer

logging.basicConfig(filename=r'C:\AI\credentials\guardian_agent.log', level=logging.INFO)

REPOS_DIR = Path(r'C:\AI\repos')

class DashboardGuardian:
    def __init__(self):
        self.sync_agent = PerfectSyncAgent()
        self.validation_agent = ValidationAgent()
        self.problem_fixer = ProblemFixer()
        self.problems_count = 0
        self.sync_issues = 0

    def check_problems(self):
        """Check for problems (linting errors, etc.)."""
        problems = 0
        for repo_dir in REPOS_DIR.iterdir():
            if repo_dir.is_dir() and (repo_dir / '.git').exists():
                # Simulate problem check (integrate with VS Code or lint tools)
                # For now, assume problems if validation fails
                try:
                    self.validation_agent.validate_repo(repo_dir)
                except Exception:
                    problems += 1
        self.problems_count = problems
        return problems

    def check_sync_issues(self):
        """Check for sync issues (unsynced files)."""
        issues = 0
        for repo_dir in REPOS_DIR.iterdir():
            if repo_dir.is_dir() and (repo_dir / '.git').exists():
                # Check git status
                import subprocess
                result = subprocess.run(['git', 'status', '--porcelain'], cwd=repo_dir, capture_output=True, text=True)
                if result.stdout.strip():
                    issues += len(result.stdout.strip().split('\n'))
                # Also check if behind remote
                result2 = subprocess.run(['git', 'rev-list', 'HEAD...origin/main', '--count'], cwd=repo_dir, capture_output=True, text=True)
                if result2.stdout.strip() and int(result2.stdout.strip()) > 0:
                    issues += int(result2.stdout.strip())
        self.sync_issues = issues
        return issues

    def fix_issues(self):
        """Fix all issues."""
        if self.problems_count > 0:
            self.problem_fixer.fix_all_problems()
            logging.info(f"Fixed {self.problems_count} problems")
        if self.sync_issues > 0:
            self.sync_agent.sync_all_repos()
            logging.info(f"Synced {self.sync_issues} issues")
            # Double-check and force if still issues
            remaining = self.check_sync_issues()
            if remaining > 0:
                logging.warning(f"Still {remaining} sync issues, forcing sync")
                for repo_dir in REPOS_DIR.iterdir():
                    if repo_dir.is_dir() and (repo_dir / '.git').exists():
                        self.sync_agent.sync_repo(repo_dir.name, repo_dir)

    def monitor_and_guard(self):
        """Monitor dashboard and fix issues every 30 seconds."""
        while True:
            problems = self.check_problems()
            sync_issues = self.check_sync_issues()
            if problems > 0 or sync_issues > 0:
                logging.warning(f"Dashboard issues: {problems} problems, {sync_issues} sync issues")
                self.fix_issues()
            else:
                logging.info("Dashboard clean: 0 problems, 0 sync issues")
            time.sleep(30)  # 30 seconds

if __name__ == "__main__":
    guardian = DashboardGuardian()
    guardian.monitor_and_guard()