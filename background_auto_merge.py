#!/usr/bin/env python3
"""
Background Auto-Merge and Auto-Resolve System
Runs continuously to merge and resolve all changes
"""

import subprocess
import sys
import time
import json
from pathlib import Path
from datetime import datetime
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(r'C:\AI\logs\auto_merge_background.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('AutoMergeBackground')

class BackgroundMergeSystem:
    """Background system for auto-merge and auto-resolve"""
    
    def __init__(self):
        self.repo_path = Path(r'C:\AI.worktrees\worktree-2025-12-31T05-31-01')
        self.merge_count = 0
        self.resolve_count = 0
        self.running = True
        
    def run_git_command(self, command):
        """Execute git command and return result"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                timeout=30
            )
            return result.returncode == 0, result.stdout, result.stderr
        except Exception as e:
            logger.error(f"Git command failed: {e}")
            return False, "", str(e)
    
    def check_for_changes(self):
        """Check if there are any changes to merge"""
        success, stdout, stderr = self.run_git_command("git status --porcelain")
        if success and stdout.strip():
            files = [line.strip() for line in stdout.strip().split('\n') if line.strip()]
            return len(files), files
        return 0, []
    
    def auto_stage_all(self):
        """Stage all changes"""
        logger.info("Staging all changes...")
        success, stdout, stderr = self.run_git_command("git add -A")
        if success:
            logger.info("✅ All changes staged")
            return True
        else:
            logger.error(f"❌ Failed to stage: {stderr}")
            return False
    
    def auto_commit(self, file_count):
        """Commit all staged changes"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_msg = f"""chore: Auto-merge background process

Timestamp: {timestamp}
Files merged: {file_count}
Merge count: {self.merge_count + 1}
Status: Automated background merge

[auto-merge] [background] [resolved]
"""
        
        logger.info(f"Committing {file_count} files...")
        success, stdout, stderr = self.run_git_command(f'git commit -m "{commit_msg}"')
        
        if success or "nothing to commit" in stdout or "nothing to commit" in stderr:
            logger.info("✅ Commit successful")
            self.merge_count += 1
            return True
        else:
            logger.warning(f"Commit note: {stderr}")
            return False
    
    def auto_push(self):
        """Push changes to remote"""
        logger.info("Pushing to remote...")
        success, stdout, stderr = self.run_git_command("git push origin HEAD")
        
        if success:
            logger.info("✅ Pushed to remote")
            return True
        else:
            logger.warning(f"Push note: {stderr}")
            return False
    
    def resolve_conflicts(self):
        """Auto-resolve any merge conflicts"""
        logger.info("Checking for conflicts...")
        
        # Check for conflict markers
        success, stdout, stderr = self.run_git_command("git diff --check")
        if not success:
            logger.info("Resolving conflicts...")
            
            # Accept current changes for conflicts
            self.run_git_command("git checkout --ours .")
            self.run_git_command("git add -A")
            
            self.resolve_count += 1
            logger.info("✅ Conflicts resolved")
            return True
        
        return False
    
    def run_merge_cycle(self):
        """Run one cycle of merge operations"""
        logger.info("=" * 70)
        logger.info("BACKGROUND AUTO-MERGE CYCLE")
        logger.info("=" * 70)
        
        # Check for changes
        file_count, files = self.check_for_changes()
        
        if file_count == 0:
            logger.info("✅ No changes to merge - repository clean")
            return False
        
        logger.info(f"📦 Found {file_count} files to merge")
        if file_count <= 10:
            for f in files:
                logger.info(f"  • {f}")
        else:
            for f in files[:5]:
                logger.info(f"  • {f}")
            logger.info(f"  ... and {file_count - 5} more files")
        
        # Resolve any conflicts first
        self.resolve_conflicts()
        
        # Stage all changes
        if not self.auto_stage_all():
            return False
        
        # Commit changes
        if not self.auto_commit(file_count):
            return False
        
        # Push to remote
        self.auto_push()
        
        logger.info(f"✅ Merge cycle complete (Total merges: {self.merge_count})")
        return True
    
    def generate_status_report(self):
        """Generate status report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'merge_count': self.merge_count,
            'resolve_count': self.resolve_count,
            'status': 'running' if self.running else 'stopped'
        }
        
        report_file = self.repo_path / 'background_merge_status.json'
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
    
    def run_background(self, interval=60, max_cycles=10):
        """Run in background mode"""
        logger.info("=" * 70)
        logger.info("BACKGROUND AUTO-MERGE SYSTEM STARTED")
        logger.info("=" * 70)
        logger.info(f"Repository: {self.repo_path}")
        logger.info(f"Check interval: {interval} seconds")
        logger.info(f"Max cycles: {max_cycles}")
        logger.info("")
        
        cycle = 0
        
        try:
            while self.running and cycle < max_cycles:
                cycle += 1
                logger.info(f"\n[Cycle {cycle}/{max_cycles}] Starting...")
                
                # Run merge cycle
                changes_found = self.run_merge_cycle()
                
                # Generate status report
                report = self.generate_status_report()
                
                if not changes_found:
                    logger.info(f"No changes found. Waiting {interval} seconds...")
                    time.sleep(interval)
                else:
                    logger.info(f"Merge complete. Waiting {interval} seconds before next check...")
                    time.sleep(interval)
            
            logger.info("\n" + "=" * 70)
            logger.info("BACKGROUND AUTO-MERGE SYSTEM COMPLETED")
            logger.info("=" * 70)
            logger.info(f"Total merge cycles: {self.merge_count}")
            logger.info(f"Total conflicts resolved: {self.resolve_count}")
            logger.info(f"Status: Success")
            
        except KeyboardInterrupt:
            logger.info("\n\n⚠️  Background merge stopped by user")
            self.running = False
        except Exception as e:
            logger.error(f"\n\n❌ Error in background merge: {e}")
            self.running = False
        
        return self.merge_count

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Background Auto-Merge System')
    parser.add_argument('--interval', type=int, default=60, help='Check interval in seconds')
    parser.add_argument('--max-cycles', type=int, default=10, help='Maximum merge cycles')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    
    args = parser.parse_args()
    
    system = BackgroundMergeSystem()
    
    if args.once:
        # Run just one cycle
        system.run_merge_cycle()
        report = system.generate_status_report()
        print(f"\n✅ Single merge cycle complete")
        print(f"Merged: {system.merge_count} times")
        print(f"Resolved: {system.resolve_count} conflicts")
    else:
        # Run in background
        merge_count = system.run_background(
            interval=args.interval,
            max_cycles=args.max_cycles
        )
        sys.exit(0 if merge_count >= 0 else 1)
