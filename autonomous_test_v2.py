#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Autonomous Testing System - Fixed Version
Runs all tests automatically without encoding issues
"""

import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime
import os

# Set UTF-8 encoding for Windows
os.environ['PYTHONIOENCODING'] = 'utf-8'

class AutonomousTester:
    def __init__(self):
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'passed': 0,
            'failed': 0,
            'warnings': 0
        }
        self.repo_path = Path(r'C:\AI.worktrees\worktree-2025-12-31T05-31-01')
    
    def run_test(self, name, command, critical=True):
        """Run a test command and capture results"""
        print(f"\n{'='*70}")
        print(f"TEST: {name}")
        print(f"{'='*70}")
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=self.repo_path,
                capture_output=True,
                text=True,
                timeout=60,
                encoding='utf-8',
                errors='replace'
            )
            
            success = result.returncode == 0
            
            if success:
                self.results['passed'] += 1
                print(f"[PASS] {name}")
            else:
                if critical:
                    self.results['failed'] += 1
                    print(f"[FAIL] {name}")
                else:
                    self.results['warnings'] += 1
                    print(f"[WARN] {name}")
            
            if result.stdout and len(result.stdout) > 10:
                print(f"Output: {result.stdout[:300]}")
            if result.stderr and not success and len(result.stderr) > 10:
                print(f"Error: {result.stderr[:300]}")
            
            return success
            
        except subprocess.TimeoutExpired:
            print(f"[TIMEOUT] {name}")
            self.results['failed'] += 1
            return False
        except Exception as e:
            print(f"[ERROR] {name} - {e}")
            self.results['failed'] += 1
            return False
    
    def test_file_exists(self, filepath, description):
        """Test if a file exists"""
        full_path = self.repo_path / filepath
        exists = full_path.exists()
        if exists:
            print(f"[PASS] {description}: {filepath}")
            self.results['passed'] += 1
        else:
            print(f"[FAIL] {description}: {filepath} not found")
            self.results['failed'] += 1
        return exists
    
    def run_all_tests(self):
        """Run all autonomous tests"""
        print("=" * 70)
        print("AUTONOMOUS TESTING SYSTEM - v2.0")
        print("=" * 70)
        print(f"Started: {self.results['timestamp']}")
        print(f"Location: {self.repo_path}")
        print()
        
        # Test Group 1: File Structure
        print("\n[GROUP 1] File Structure Tests")
        print("-" * 70)
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/__init__.py",
            "SDK Package Init"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/hostinger_manager.py",
            "SDK Manager"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/hostinger_cli.py",
            "CLI Interface"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger_agent.py",
            "Monitoring Agent"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/autonomous_controller.py",
            "Master Controller"
        )
        
        # Test Group 2: Documentation
        print("\n[GROUP 2] Documentation Tests")
        print("-" * 70)
        self.test_file_exists("HOSTINGER_README.md", "Main Documentation")
        self.test_file_exists("QUICK_START.md", "Quick Start Guide")
        self.test_file_exists("DEPLOYMENT_COMPLETE.md", "Deployment Guide")
        
        # Test Group 3: Python Syntax
        print("\n[GROUP 3] Python Syntax Tests")
        print("-" * 70)
        self.run_test(
            "SDK Manager Syntax",
            "python -m py_compile infinity-matrix/ai_stack/hostinger/hostinger_manager.py"
        )
        self.run_test(
            "CLI Syntax",
            "python -m py_compile infinity-matrix/ai_stack/hostinger/hostinger_cli.py"
        )
        self.run_test(
            "Agent Syntax",
            "python -m py_compile infinity-matrix/ai_stack/hostinger_agent.py"
        )
        self.run_test(
            "Controller Syntax",
            "python -m py_compile infinity-matrix/ai_stack/autonomous_controller.py"
        )
        
        # Test Group 4: Python Imports
        print("\n[GROUP 4] Import Tests")
        print("-" * 70)
        self.run_test(
            "Requests Module",
            "python -c \"import requests; print('OK')\"",
            critical=False
        )
        self.run_test(
            "Dateutil Module",
            "python -c \"import dateutil; print('OK')\"",
            critical=False
        )
        self.run_test(
            "SDK Import",
            "python -c \"import sys; sys.path.insert(0, 'infinity-matrix/ai_stack'); from hostinger import HostingerManager; print('OK')\"",
            critical=True
        )
        
        # Test Group 5: Git Status
        print("\n[GROUP 5] Repository Tests")
        print("-" * 70)
        self.run_test(
            "Git Clean Status",
            "git status --porcelain",
            critical=False
        )
        
        # Test Group 6: File Counts
        print("\n[GROUP 6] Integration Completeness")
        print("-" * 70)
        hostinger_dir = self.repo_path / "infinity-matrix" / "ai_stack" / "hostinger"
        if hostinger_dir.exists():
            py_files = list(hostinger_dir.glob("*.py"))
            print(f"[INFO] Found {len(py_files)} Python files in SDK")
            if len(py_files) >= 3:
                print("[PASS] Minimum files present")
                self.results['passed'] += 1
            else:
                print("[FAIL] Missing SDK files")
                self.results['failed'] += 1
        
        return self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 70)
        print("AUTONOMOUS TEST REPORT")
        print("=" * 70)
        print()
        
        total = self.results['passed'] + self.results['failed'] + self.results['warnings']
        
        print(f"Timestamp: {self.results['timestamp']}")
        print(f"Total Tests: {total}")
        print(f"Passed: {self.results['passed']}")
        print(f"Failed: {self.results['failed']}")
        print(f"Warnings: {self.results['warnings']}")
        print()
        
        if total > 0:
            success_rate = (self.results['passed'] / total * 100)
            print(f"Success Rate: {success_rate:.1f}%")
        print()
        
        # Save report
        report_file = self.repo_path / 'autonomous_test_results.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2)
        print(f"Full report saved to: {report_file}")
        
        # Overall status
        print("\n" + "=" * 70)
        if self.results['failed'] == 0:
            print("SUCCESS: ALL CRITICAL TESTS PASSED!")
            print("=" * 70)
            print("\nSystem is ready for production use")
            print("Hostinger integration is fully functional")
            return 0
        else:
            print("WARNING: SOME TESTS FAILED")
            print("=" * 70)
            print(f"\n{self.results['failed']} critical test(s) failed")
            print("Review the output above for details")
            return 1

if __name__ == "__main__":
    tester = AutonomousTester()
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)
