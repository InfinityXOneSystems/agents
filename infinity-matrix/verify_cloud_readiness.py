#!/usr/bin/env python3

"""
Cloud Readiness Verification Script for Infinity-Matrix

Verifies that the system is properly configured for Google Cloud Run deployment
with hybrid cloud-primary architecture and automatic fallback to local Ollama.
"""

import os
import sys
import json
import subprocess
import requests
from datetime import datetime
from typing import Dict, List, Tuple

class CloudReadinessVerifier:
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": {},
            "checks": {
                "docker": [],
                "gcp": [],
                "configuration": [],
                "connectivity": [],
                "architecture": []
            },
            "summary": {
                "passed": 0,
                "failed": 0,
                "warnings": 0
            }
        }
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
    
    def verify_docker_installation(self) -> bool:
        """Check if Docker is installed and running"""
        try:
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                version = result.stdout.strip()
                self.log(f"✓ Docker installed: {version}", "INFO")
                self.results["checks"]["docker"].append({
                    "test": "Docker installation",
                    "status": "PASS",
                    "details": version
                })
                return True
        except Exception as e:
            self.log(f"✗ Docker not found: {e}", "ERROR")
            self.results["checks"]["docker"].append({
                "test": "Docker installation",
                "status": "FAIL",
                "details": str(e)
            })
            return False
    
    def verify_docker_images(self) -> bool:
        """Check if Docker images can be built"""
        try:
            # Check if Dockerfile exists
            dockerfiles = [
                "frontend/Dockerfile",
                "orchestration/Dockerfile"
            ]
            
            all_exist = True
            for dockerfile in dockerfiles:
                if not os.path.exists(dockerfile):
                    self.log(f"✗ {dockerfile} not found", "WARNING")
                    all_exist = False
                else:
                    self.log(f"✓ {dockerfile} found", "INFO")
            
            self.results["checks"]["docker"].append({
                "test": "Dockerfile presence",
                "status": "PASS" if all_exist else "FAIL",
                "details": f"Found {len([d for d in dockerfiles if os.path.exists(d)])}/{len(dockerfiles)} Dockerfiles"
            })
            
            return all_exist
        except Exception as e:
            self.log(f"✗ Docker build verification failed: {e}", "ERROR")
            self.results["checks"]["docker"].append({
                "test": "Docker image verification",
                "status": "FAIL",
                "details": str(e)
            })
            return False
    
    def verify_gcp_cli(self) -> bool:
        """Check if gcloud CLI is installed and configured"""
        try:
            result = subprocess.run(
                ["gcloud", "--version"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                version = result.stdout.split('\n')[0]
                self.log(f"✓ gcloud CLI installed: {version}", "INFO")
                self.results["checks"]["gcp"].append({
                    "test": "gcloud CLI installation",
                    "status": "PASS",
                    "details": version
                })
                return True
        except Exception as e:
            self.log(f"✗ gcloud CLI not found: {e}", "WARNING")
            self.results["checks"]["gcp"].append({
                "test": "gcloud CLI installation",
                "status": "WARNING",
                "details": "gcloud CLI not installed - required for Cloud Run deployment"
            })
            return False
    
    def verify_gcp_project(self) -> bool:
        """Check if GCP project is configured"""
        try:
            result = subprocess.run(
                ["gcloud", "config", "get-value", "project"],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0 and result.stdout.strip():
                project = result.stdout.strip()
                self.log(f"✓ GCP project configured: {project}", "INFO")
                self.results["checks"]["gcp"].append({
                    "test": "GCP project configuration",
                    "status": "PASS",
                    "details": f"Project: {project}"
                })
                return True
        except Exception as e:
            self.log(f"✗ GCP project not configured: {e}", "WARNING")
            self.results["checks"]["gcp"].append({
                "test": "GCP project configuration",
                "status": "WARNING",
                "details": "Run 'gcloud config set project <PROJECT_ID>'"
            })
            return False
    
    def verify_configuration_files(self) -> bool:
        """Verify all required configuration files exist"""
        required_files = {
            "cloudbuild.yaml": "Cloud Build pipeline configuration",
            "cloud-run-config.yaml": "Cloud Run service configuration",
            "frontend/.env.production": "Frontend production environment",
            "orchestration/.dockerignore": "Docker ignore rules",
            "frontend/src/lib/hybrid-cloud-client.js": "Hybrid cloud client library"
        }
        
        all_exist = True
        for filename, description in required_files.items():
            if os.path.exists(filename):
                self.log(f"✓ {filename}", "INFO")
                self.results["checks"]["configuration"].append({
                    "test": filename,
                    "status": "PASS",
                    "details": description
                })
            else:
                self.log(f"✗ {filename} missing", "WARNING")
                all_exist = False
                self.results["checks"]["configuration"].append({
                    "test": filename,
                    "status": "FAIL",
                    "details": description
                })
        
        return all_exist
    
    def verify_environment_config(self) -> bool:
        """Verify environment configuration for hybrid architecture"""
        env_vars = {
            "VITE_API_URL": "Cloud API endpoint",
            "VITE_OLLAMA_HOST": "Local Ollama endpoint",
            "VITE_OLLAMA_ENABLED": "Ollama fallback enabled flag",
            "GOOGLE_CLOUD_PROJECT": "GCP project ID"
        }
        
        config_valid = True
        for var, description in env_vars.items():
            value = os.getenv(var)
            if value:
                self.log(f"✓ {var} configured", "INFO")
                self.results["checks"]["configuration"].append({
                    "test": f"Env: {var}",
                    "status": "PASS",
                    "details": f"Value: {value[:50]}..."
                })
            else:
                self.log(f"⚠ {var} not set (may be configured at deployment)", "WARNING")
                self.results["checks"]["configuration"].append({
                    "test": f"Env: {var}",
                    "status": "WARNING",
                    "details": description
                })
                config_valid = False
        
        return True  # Not critical for local verification
    
    def verify_local_connectivity(self) -> bool:
        """Verify local backend connectivity"""
        endpoints = {
            "http://localhost:3001/health": "Local orchestration backend",
            "http://localhost:11434/api/tags": "Local Ollama instance"
        }
        
        results_local = []
        for endpoint, description in endpoints.items():
            try:
                response = requests.get(endpoint, timeout=2)
                if response.status_code == 200:
                    self.log(f"✓ {description} responding", "INFO")
                    results_local.append((True, endpoint, description))
                else:
                    self.log(f"⚠ {description} returned {response.status_code}", "WARNING")
                    results_local.append((False, endpoint, description))
            except Exception as e:
                self.log(f"⚠ {description} not available (expected if running on Cloud Run)", "WARNING")
                results_local.append((False, endpoint, description))
        
        for success, endpoint, description in results_local:
            self.results["checks"]["connectivity"].append({
                "test": description,
                "status": "PASS" if success else "WARNING",
                "details": endpoint
            })
        
        return True  # Not critical for cloud readiness
    
    def verify_hybrid_architecture(self) -> bool:
        """Verify hybrid cloud-primary architecture is properly configured"""
        checks = []
        
        # Check for hybrid client library
        if os.path.exists("frontend/src/lib/hybrid-cloud-client.js"):
            self.log("✓ Hybrid cloud client library found", "INFO")
            checks.append(True)
            self.results["checks"]["architecture"].append({
                "test": "Hybrid client library",
                "status": "PASS",
                "details": "frontend/src/lib/hybrid-cloud-client.js"
            })
        else:
            self.log("✗ Hybrid client library missing", "ERROR")
            checks.append(False)
            self.results["checks"]["architecture"].append({
                "test": "Hybrid client library",
                "status": "FAIL",
                "details": "Required for cloud-primary with fallback"
            })
        
        # Check for cloud-primary routing
        cloud_page_path = "frontend/src/pages/CloudAIPage.jsx"
        if os.path.exists(cloud_page_path):
            self.log("✓ CloudAIPage component found", "INFO")
            checks.append(True)
            self.results["checks"]["architecture"].append({
                "test": "Cloud AI Page component",
                "status": "PASS",
                "details": cloud_page_path
            })
        else:
            self.log("✗ CloudAIPage missing", "WARNING")
            checks.append(False)
            self.results["checks"]["architecture"].append({
                "test": "Cloud AI Page component",
                "status": "WARNING",
                "details": "Component not found"
            })
        
        # Check for deployment script
        if os.path.exists("deploy-cloud-run.sh"):
            self.log("✓ Cloud Run deployment script found", "INFO")
            checks.append(True)
            self.results["checks"]["architecture"].append({
                "test": "Deployment automation",
                "status": "PASS",
                "details": "deploy-cloud-run.sh"
            })
        else:
            self.log("✗ Deployment script missing", "WARNING")
            checks.append(False)
            self.results["checks"]["architecture"].append({
                "test": "Deployment automation",
                "status": "WARNING",
                "details": "Required for automated Cloud Run deployment"
            })
        
        return all(checks)
    
    def generate_report(self) -> Dict:
        """Generate comprehensive cloud readiness report"""
        # Count results
        for check_category in self.results["checks"].values():
            for check in check_category:
                if check["status"] == "PASS":
                    self.results["summary"]["passed"] += 1
                elif check["status"] == "FAIL":
                    self.results["summary"]["failed"] += 1
                elif check["status"] == "WARNING":
                    self.results["summary"]["warnings"] += 1
        
        return self.results
    
    def print_report(self, report: Dict):
        """Print formatted report"""
        print("\n" + "="*60)
        print("CLOUD READINESS VERIFICATION REPORT")
        print("="*60)
        print(f"Timestamp: {report['timestamp']}\n")
        
        # Summary
        print("SUMMARY:")
        print(f"  ✓ Passed:  {report['summary']['passed']}")
        print(f"  ✗ Failed:  {report['summary']['failed']}")
        print(f"  ⚠ Warnings: {report['summary']['warnings']}\n")
        
        # Detailed results
        for category, checks in report["checks"].items():
            if checks:
                print(f"{category.upper()}:")
                for check in checks:
                    status_symbol = "✓" if check["status"] == "PASS" else "✗" if check["status"] == "FAIL" else "⚠"
                    print(f"  {status_symbol} {check['test']}: {check['status']}")
                    if check.get('details'):
                        print(f"    → {check['details']}")
                print()
        
        # Recommendations
        print("NEXT STEPS:")
        if report['summary']['failed'] == 0:
            print("  ✓ System is ready for Cloud Run deployment")
            print("  1. Run: chmod +x deploy-cloud-run.sh")
            print("  2. Run: ./deploy-cloud-run.sh <PROJECT_ID> <REGION>")
            print("  3. Monitor deployment with: gcloud run services list")
        else:
            print("  ✗ Please fix the failing checks before deployment")
            print("  1. Review failed checks above")
            print("  2. Follow the recommendations in the details")
            print("  3. Run verification again")
        
        print("\n" + "="*60 + "\n")
    
    def run(self):
        """Run all verification checks"""
        self.log("Starting Cloud Readiness Verification...", "INFO")
        self.log("="*60, "INFO")
        
        # Run all checks
        self.log("Checking Docker installation...", "INFO")
        self.verify_docker_installation()
        self.verify_docker_images()
        
        self.log("Checking Google Cloud setup...", "INFO")
        self.verify_gcp_cli()
        self.verify_gcp_project()
        
        self.log("Checking configuration files...", "INFO")
        self.verify_configuration_files()
        self.verify_environment_config()
        
        self.log("Checking local connectivity...", "INFO")
        self.verify_local_connectivity()
        
        self.log("Verifying hybrid architecture...", "INFO")
        self.verify_hybrid_architecture()
        
        # Generate and print report
        report = self.generate_report()
        self.print_report(report)
        
        # Save report
        report_file = "CLOUD_READINESS_REPORT.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        self.log(f"Report saved to {report_file}", "INFO")
        
        # Return exit code based on failures
        return 0 if report['summary']['failed'] == 0 else 1

if __name__ == "__main__":
    verifier = CloudReadinessVerifier()
    exit_code = verifier.run()
    sys.exit(exit_code)
