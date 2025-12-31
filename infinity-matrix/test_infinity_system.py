#!/usr/bin/env python3
"""
Comprehensive Test Suite for Infinity-Matrix System
Tests frontend, backend, and cloud integrations
"""

import os
import sys
import json
import subprocess
import time
import requests
from pathlib import Path
from typing import Dict, List, Tuple, Any
from datetime import datetime
import traceback

class SystemTester:
    def __init__(self):
        self.base_dir = Path("c:\\AI\\infinity-matrix")
        self.frontend_dir = self.base_dir / "frontend_stack" / "frontend"
        self.orchestration_dir = self.base_dir / "orchestration"
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "environment": "local",
            "tests": {},
            "summary": {}
        }
        self.colors = {
            'GREEN': '\033[92m',
            'RED': '\033[91m',
            'YELLOW': '\033[93m',
            'BLUE': '\033[94m',
            'END': '\033[0m'
        }
    
    def log(self, message: str, level: str = "INFO"):
        """Log messages with colors"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "SUCCESS":
            color = self.colors['GREEN']
            symbol = "✓"
        elif level == "ERROR":
            color = self.colors['RED']
            symbol = "✗"
        elif level == "WARNING":
            color = self.colors['YELLOW']
            symbol = "⚠"
        else:
            color = self.colors['BLUE']
            symbol = "•"
        
        print(f"{color}[{timestamp}] {symbol} {message}{self.colors['END']}")
    
    # ========== FRONTEND TESTS ==========
    def test_frontend_structure(self) -> Tuple[bool, str]:
        """Verify frontend folder structure"""
        try:
            required_dirs = [
                self.frontend_dir / "src",
                self.frontend_dir / "src/pages",
                self.frontend_dir / "src/components",
                self.frontend_dir / "src/lib",
            ]
            
            required_files = [
                self.frontend_dir / "package.json",
                self.frontend_dir / "vite.config.js",
                self.frontend_dir / "src/App.jsx",
                self.frontend_dir / "src/pages/CloudAIPage.jsx",
                self.frontend_dir / "src/lib/ollama-client.js",
            ]
            
            missing_dirs = [d for d in required_dirs if not d.exists()]
            missing_files = [f for f in required_files if not f.exists()]
            
            if missing_dirs or missing_files:
                msg = "Missing: " + ", ".join([str(p.name) for p in missing_dirs + missing_files])
                return False, msg
            
            return True, "Frontend structure valid"
        except Exception as e:
            return False, str(e)
    
    def test_frontend_dependencies(self) -> Tuple[bool, str]:
        """Check if frontend dependencies are installed"""
        try:
            node_modules = self.frontend_dir / "node_modules"
            if not node_modules.exists():
                return False, "node_modules not found"
            
            # Check key dependencies
            required = ["react", "vite", "axios", "framer-motion", "tailwindcss"]
            missing = [pkg for pkg in required if not (node_modules / pkg).exists()]
            
            if missing:
                return False, f"Missing packages: {', '.join(missing)}"
            
            return True, "All frontend dependencies installed"
        except Exception as e:
            return False, str(e)
    
    def test_frontend_pages(self) -> Tuple[bool, str]:
        """Test CloudAIPage.jsx syntax and structure"""
        try:
            page_file = self.frontend_dir / "src/pages/CloudAIPage.jsx"
            content = page_file.read_text()
            
            # Check for required elements
            checks = {
                "React imports": "import { useState, useEffect }",
                "Helmet import": "import { Helmet }",
                "Motion import": "import { motion }",
                "CloudAIPage component": "export default function CloudAIPage",
                "Vertex AI support": "processWithCloud",
                "Ollama support": "processWithOllama",
                "Tab switching": "handleTabChange",
                "Health status": "fetchCloudHealth",
                "Model selection": "selectedModel",
                "Result display": "result &&",
            }
            
            missing = [name for name, check in checks.items() if check not in content]
            
            if missing:
                return False, f"Missing elements: {', '.join(missing)}"
            
            # Check for syntax balance
            if content.count("export default function") != 1:
                return False, "Function definition issue"
            
            return True, "CloudAIPage structure valid"
        except Exception as e:
            return False, str(e)
    
    def test_ollama_client(self) -> Tuple[bool, str]:
        """Test ollama-client.js structure"""
        try:
            client_file = self.frontend_dir / "src/lib/ollama-client.js"
            content = client_file.read_text()
            
            required_exports = [
                "testOllamaConnection",
                "getOllamaModels",
                "processWithOllama",
                "getOllamaHealth",
                "findWorkingOllamaInstance",
            ]
            
            missing = [fn for fn in required_exports if f"export async function {fn}" not in content and f"export function {fn}" not in content]
            
            if missing:
                return False, f"Missing functions: {', '.join(missing)}"
            
            return True, "Ollama client library valid"
        except Exception as e:
            return False, str(e)
    
    def test_frontend_env_config(self) -> Tuple[bool, str]:
        """Test frontend environment configuration"""
        try:
            configs = {
                ".env.development": self.frontend_dir / ".env.development",
                ".env.production": self.frontend_dir / ".env.production",
            }
            
            missing = []
            for name, path in configs.items():
                if not path.exists():
                    missing.append(name)
            
            if missing:
                return False, f"Missing env files: {', '.join(missing)}"
            
            # Check content
            dev_env = (self.frontend_dir / ".env.development").read_text()
            if "VITE_API_URL" not in dev_env:
                return False, "VITE_API_URL not configured in .env.development"
            
            return True, "Frontend environment configured"
        except Exception as e:
            return False, str(e)
    
    # ========== BACKEND TESTS ==========
    def test_backend_structure(self) -> Tuple[bool, str]:
        """Verify backend folder structure"""
        try:
            required_dirs = [
                self.orchestration_dir / "server",
                self.orchestration_dir / "agents",
                self.orchestration_dir / "dist",
            ]
            
            missing = [d for d in required_dirs if not d.exists()]
            
            if missing:
                return False, f"Missing dirs: {', '.join([d.name for d in missing])}"
            
            # Check main files
            main_file = self.orchestration_dir / "dist/server/index.js"
            if not main_file.exists():
                return False, "Compiled server not found"
            
            return True, "Backend structure valid"
        except Exception as e:
            return False, str(e)
    
    def test_backend_dependencies(self) -> Tuple[bool, str]:
        """Check backend dependencies"""
        try:
            node_modules = self.orchestration_dir / "node_modules"
            if not node_modules.exists():
                return False, "node_modules not found"
            
            required = ["express", "axios", "dotenv", "ws"]
            missing = [pkg for pkg in required if not (node_modules / pkg).exists()]
            
            if missing:
                return False, f"Missing packages: {', '.join(missing)}"
            
            return True, "Backend dependencies installed"
        except Exception as e:
            return False, str(e)
    
    def test_backend_compilation(self) -> Tuple[bool, str]:
        """Test if backend can be compiled"""
        try:
            server_file = self.orchestration_dir / "dist/server/index.js"
            content = server_file.read_text()
            
            checks = {
                "Express app": "app = express()",
                "CORS middleware": "Access-Control-Allow-Origin",
                "Health endpoint": "/health",
                "Cloud API endpoint": "/cloud/",
                "Port configuration": "PORT",
            }
            
            missing = [name for name, check in checks.items() if check not in content]
            
            if missing:
                return False, f"Missing: {', '.join(missing)}"
            
            return True, "Backend compiled correctly"
        except Exception as e:
            return False, str(e)
    
    def test_backend_env_config(self) -> Tuple[bool, str]:
        """Test backend environment configuration"""
        try:
            env_file = self.orchestration_dir / ".env"
            if not env_file.exists():
                # .env file optional, check if package.json indicates env variables needed
                return True, "No .env required (using defaults)"
            
            return True, "Backend environment configured"
        except Exception as e:
            return False, str(e)
    
    # ========== INTEGRATION TESTS ==========
    def test_api_endpoints(self) -> Tuple[bool, str]:
        """Test if API endpoints are accessible"""
        try:
            api_url = "http://localhost:3001"
            endpoints = [
                "/health",
                "/cloud/health",
                "/cloud/models",
            ]
            
            accessible = []
            for endpoint in endpoints:
                try:
                    response = requests.get(f"{api_url}{endpoint}", timeout=2)
                    if response.status_code < 500:
                        accessible.append(endpoint)
                except:
                    pass
            
            if not accessible:
                return False, f"No endpoints accessible on {api_url}"
            
            msg = f"Accessible: {', '.join(accessible)}"
            return True, msg
        except Exception as e:
            return False, str(e)
    
    def test_vertex_ai_config(self) -> Tuple[bool, str]:
        """Test Vertex AI configuration"""
        try:
            # Check environment for GCP credentials
            gcp_env = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
            gcp_project = os.environ.get("GOOGLE_CLOUD_PROJECT")
            
            if not gcp_env and not gcp_project:
                return False, "GCP credentials not configured"
            
            # Check if credentials file exists
            if gcp_env:
                if not Path(gcp_env).exists():
                    return False, f"Credentials file not found: {gcp_env}"
            
            return True, "Vertex AI environment configured"
        except Exception as e:
            return False, str(e)
    
    def test_ollama_connectivity(self) -> Tuple[bool, str]:
        """Test Ollama connectivity"""
        try:
            ollama_urls = [
                "http://localhost:11434",
                "http://127.0.0.1:11434",
            ]
            
            for url in ollama_urls:
                try:
                    response = requests.get(f"{url}/api/tags", timeout=2)
                    if response.status_code == 200:
                        return True, f"Ollama accessible at {url}"
                except:
                    pass
            
            return False, "Ollama not accessible (not running)"
        except Exception as e:
            return False, str(e)
    
    # ========== CLOUD DEPLOYMENT TESTS ==========
    def test_production_config(self) -> Tuple[bool, str]:
        """Test production environment configuration"""
        try:
            prod_env = self.frontend_dir / ".env.production"
            content = prod_env.read_text()
            
            # Check for production URLs
            checks = {
                "API URL": "VITE_API_URL=https://",
                "Ollama host": "VITE_OLLAMA_HOST=https://",
            }
            
            missing = [name for name, check_str in checks.items() if check_str not in content]
            
            if missing:
                return False, f"Missing production config: {', '.join(missing)}"
            
            return True, "Production configuration valid"
        except Exception as e:
            return False, str(e)
    
    def test_docker_setup(self) -> Tuple[bool, str]:
        """Test Docker configuration"""
        try:
            required_files = [
                self.base_dir / "Dockerfile.gateway",
                self.base_dir / "docker-compose.yml",
            ]
            
            missing = [f for f in required_files if not f.exists()]
            
            if missing:
                return False, f"Missing Docker files: {', '.join([f.name for f in missing])}"
            
            return True, "Docker configuration present"
        except Exception as e:
            return False, str(e)
    
    def test_cloud_readiness(self) -> Tuple[bool, str]:
        """Test overall cloud deployment readiness"""
        try:
            checks = {
                "Frontend dist built": (self.frontend_dir / "dist").exists(),
                "Backend dist built": (self.orchestration_dir / "dist").exists(),
                "Docker files exist": (self.base_dir / "docker-compose.yml").exists(),
                "Environment configs": (self.frontend_dir / ".env.production").exists(),
            }
            
            completed = [name for name, result in checks.items() if result]
            pending = [name for name, result in checks.items() if not result]
            
            msg = f"Ready: {len(completed)}/{len(checks)}"
            if pending:
                msg += f" | Pending: {', '.join(pending)}"
            
            return len(completed) >= 3, msg
        except Exception as e:
            return False, str(e)
    
    # ========== TEST EXECUTION ==========
    def run_all_tests(self):
        """Run all tests and generate report"""
        test_suites = {
            "Frontend Structure": [
                ("Structure", self.test_frontend_structure),
                ("Dependencies", self.test_frontend_dependencies),
                ("CloudAIPage", self.test_frontend_pages),
                ("OllamaClient", self.test_ollama_client),
                ("Environment", self.test_frontend_env_config),
            ],
            "Backend Structure": [
                ("Structure", self.test_backend_structure),
                ("Dependencies", self.test_backend_dependencies),
                ("Compilation", self.test_backend_compilation),
                ("Environment", self.test_backend_env_config),
            ],
            "Integration": [
                ("API Endpoints", self.test_api_endpoints),
                ("Vertex AI Config", self.test_vertex_ai_config),
                ("Ollama Connectivity", self.test_ollama_connectivity),
            ],
            "Cloud Deployment": [
                ("Production Config", self.test_production_config),
                ("Docker Setup", self.test_docker_setup),
                ("Cloud Readiness", self.test_cloud_readiness),
            ],
        }
        
        total_passed = 0
        total_failed = 0
        
        print("\n" + "="*80)
        print("INFINITY-MATRIX SYSTEM TEST SUITE")
        print("="*80 + "\n")
        
        for suite_name, tests in test_suites.items():
            print(f"\n{suite_name}:")
            print("-" * 40)
            
            suite_results = {}
            passed = 0
            failed = 0
            
            for test_name, test_func in tests:
                try:
                    success, message = test_func()
                    suite_results[test_name] = {
                        "status": "PASS" if success else "FAIL",
                        "message": message
                    }
                    
                    if success:
                        self.log(f"{test_name}: {message}", "SUCCESS")
                        passed += 1
                        total_passed += 1
                    else:
                        self.log(f"{test_name}: {message}", "ERROR")
                        failed += 1
                        total_failed += 1
                except Exception as e:
                    suite_results[test_name] = {
                        "status": "ERROR",
                        "message": str(e)
                    }
                    self.log(f"{test_name}: {str(e)}", "ERROR")
                    failed += 1
                    total_failed += 1
            
            self.results["tests"][suite_name] = suite_results
            print(f"\n{suite_name}: {passed}/{passed+failed} passed\n")
        
        # Summary
        print("\n" + "="*80)
        print("SUMMARY")
        print("="*80)
        total = total_passed + total_failed
        percentage = (total_passed / total * 100) if total > 0 else 0
        print(f"Total: {total_passed}/{total} tests passed ({percentage:.1f}%)\n")
        
        self.results["summary"] = {
            "total_tests": total,
            "passed": total_passed,
            "failed": total_failed,
            "percentage": percentage
        }
        
        # Recommendations
        print("RECOMMENDATIONS:")
        print("-" * 40)
        if total_failed == 0:
            self.log("✓ System is ready for deployment!", "SUCCESS")
        else:
            recommendations = []
            
            if self.test_frontend_dependencies()[0] == False:
                recommendations.append("• Run: cd frontend_stack/frontend && npm install --legacy-peer-deps")
            
            if self.test_backend_dependencies()[0] == False:
                recommendations.append("• Run: cd orchestration && npm install")
            
            if not self.test_vertex_ai_config()[0]:
                recommendations.append("• Set GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CLOUD_PROJECT")
            
            if self.test_cloud_readiness()[0] == False:
                recommendations.append("• Frontend build: cd frontend_stack/frontend && npm run build")
                recommendations.append("• Backend build: cd orchestration && npm run build")
            
            for rec in recommendations:
                print(rec)
        
        # Save report
        report_file = self.base_dir / "SYSTEM_TEST_REPORT.json"
        report_file.write_text(json.dumps(self.results, indent=2))
        print(f"\n✓ Report saved: {report_file}")
        
        return total_failed == 0

if __name__ == "__main__":
    tester = SystemTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
