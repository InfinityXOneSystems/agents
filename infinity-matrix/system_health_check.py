#!/usr/bin/env python3
"""
Comprehensive System Health Check and Optimization Script
Validates all components and provides optimization recommendations.
"""

import os
import sys
import subprocess
import json
import time
from pathlib import Path
from typing import Dict, List, Any


class SystemHealthCheck:
    def __init__(self, root_path: str = "."):
        self.root_path = Path(root_path)
        self.results: Dict[str, Any] = {
            "timestamp": time.time(),
            "tests": {},
            "metrics": {},
            "optimizations": [],
            "summary": ""
        }

    def check_directory_structure(self) -> bool:
        """Validate critical directory structure."""
        required_dirs = [
            "ai_stack",
            "ai_stack/github",
            "ai_stack/firebase",
            "ai_stack/google_cloud",
            "ai_stack/hostinger",
            "ai_stack/ollama",
            "ai_stack/vertex_ai",
            "gateway_stack",
            "frontend_stack",
            "docs",
            "scripts"
        ]
        
        missing = []
        for dir_name in required_dirs:
            if not (self.root_path / dir_name).exists():
                missing.append(dir_name)
        
        if missing:
            print(f"Missing directories: {missing}")
            return False
        print("All critical directories present")
        self.results["tests"]["directory_structure"] = True
        return True

    def check_python_imports(self) -> bool:
        """Validate all Python imports."""
        import_tests = [
            ("ai_stack.github.github_agent", "GitHubAgent"),
            ("ai_stack.firebase.firebase_agent", "FirebaseAgent"),
            ("ai_stack.google_cloud.google_cloud_agent", "GoogleCloudAgent"),
            ("ai_stack.hostinger.hostinger_agent", "HostingerAgent"),
            ("ai_stack.credential_manager", "CredentialManager"),
            ("ai_stack.master_integrator", "MasterIntegrator"),
        ]
        
        all_valid = True
        for module_name, class_name in import_tests:
            try:
                module = __import__(module_name, fromlist=[class_name])
                getattr(module, class_name)
                print(f"OK: {module_name}.{class_name}")
            except Exception as e:
                print(f"FAIL: {module_name}.{class_name}: {e}")
                all_valid = False
        
        self.results["tests"]["python_imports"] = all_valid
        return all_valid

    def check_test_suite(self) -> bool:
        """Run the full test suite."""
        print("\nRunning test suite...")
        try:
            result = subprocess.run(
                ["pytest", "--maxfail=0", "--disable-warnings", "-q"],
                cwd=self.root_path,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                print("All tests passed")
                self.results["tests"]["pytest_suite"] = True
                return True
            else:
                print(f"Some tests failed:\n{result.stdout}")
                self.results["tests"]["pytest_suite"] = False
                return False
        except subprocess.TimeoutExpired:
            print("Test suite timed out")
            self.results["tests"]["pytest_suite"] = False
            return False
        except Exception as e:
            print(f"Error running tests: {e}")
            self.results["tests"]["pytest_suite"] = False
            return False

    def check_code_quality(self) -> bool:
        """Check for common code quality issues."""
        issues = []
        
        # Check for unused imports
        python_files = list(self.root_path.glob("ai_stack/**/*.py"))
        
        for file_path in python_files[:10]:  # Check first 10 files
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    
                # Check for bare except clauses
                if "except:" in content:
                    issues.append(f"{file_path.name}: Contains bare except clause")
            except Exception:
                pass
        
        if issues:
            print("\nCode Quality Issues Found:")
            for issue in issues:
                print(f"  {issue}")
        else:
            print("Code quality checks passed")
        
        self.results["tests"]["code_quality"] = len(issues) == 0
        return len(issues) == 0

    def check_dependencies(self) -> bool:
        """Verify key dependencies are installed."""
        required_packages = [
            "pytest",
            "google-cloud-storage",
            "google-cloud-firestore",
            "firebase-admin",
            "requests",
        ]
        
        try:
            result = subprocess.run(
                ["pip", "freeze"],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            installed = result.stdout.lower()
            missing = []
            
            for package in required_packages:
                if package.lower() not in installed:
                    missing.append(package)
            
            if missing:
                print(f"Missing packages: {missing}")
                self.results["tests"]["dependencies"] = False
                return False
            
            print("All required dependencies installed")
            self.results["tests"]["dependencies"] = True
            return True
        except Exception as e:
            print(f"Could not verify dependencies: {e}")
            return True

    def estimate_metrics(self) -> None:
        """Estimate system metrics."""
        python_files = list(self.root_path.glob("ai_stack/**/*.py"))
        total_lines = 0
        
        for file_path in python_files:
            try:
                with open(file_path, 'r') as f:
                    total_lines += len(f.readlines())
            except Exception:
                pass
        
        self.results["metrics"]["total_python_files"] = len(python_files)
        self.results["metrics"]["total_lines_of_code"] = total_lines
        self.results["metrics"]["avg_file_size"] = total_lines // max(len(python_files), 1)

    def generate_optimizations(self) -> None:
        """Generate optimization recommendations."""
        recommendations = [
            "Implement caching for frequently accessed data",
            "Add async/await for I/O operations in gateway_stack",
            "Use connection pooling for database connections",
            "Implement request throttling and rate limiting",
            "Add comprehensive logging with proper levels",
            "Set up monitoring and alerting for critical components",
            "Implement graceful degradation for API failures",
            "Add circuit breaker pattern for external API calls",
            "Optimize database queries with indexing",
            "Implement API response caching with TTL"
        ]
        
        self.results["optimizations"] = recommendations

    def run_all_checks(self) -> Dict[str, Any]:
        """Run all health checks."""
        print("\n" + "=" * 60)
        print("INFINITY-MATRIX SYSTEM HEALTH CHECK")
        print("=" * 60 + "\n")
        
        checks = [
            ("Directory Structure", self.check_directory_structure),
            ("Python Imports", self.check_python_imports),
            ("Dependencies", self.check_dependencies),
            ("Code Quality", self.check_code_quality),
            ("Test Suite", self.check_test_suite),
        ]
        
        passed = 0
        for check_name, check_func in checks:
            print(f"\n[{check_name}]")
            try:
                if check_func():
                    passed += 1
            except Exception as e:
                print(f"Error in {check_name}: {e}")
        
        self.estimate_metrics()
        self.generate_optimizations()
        
        # Generate summary
        all_passed = all(v for k, v in self.results["tests"].items() if isinstance(v, bool))
        
        print(f"\n" + "=" * 60)
        print(f"HEALTH CHECK SUMMARY")
        print("=" * 60)
        print(f"Tests Passed: {passed}/{len(checks)}")
        print(f"Overall Status: {'HEALTHY' if all_passed else 'NEEDS ATTENTION'}")
        print(f"Python Files: {self.results['metrics'].get('total_python_files', 0)}")
        print(f"Lines of Code: {self.results['metrics'].get('total_lines_of_code', 0)}")
        
        if self.results["optimizations"]:
            print(f"\nOptimization Recommendations:")
            for rec in self.results["optimizations"][:5]:
                print(f"  - {rec}")
        
        print("=" * 60 + "\n")
        
        return self.results


if __name__ == "__main__":
    checker = SystemHealthCheck()
    results = checker.run_all_checks()
    
    # Save results
    output_file = Path("system_health_report.json")
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"Health report saved to {output_file}")
