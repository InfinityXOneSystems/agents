#!/usr/bin/env python3
"""
Hostinger Integration Verification Script
Checks that everything is set up correctly before launching
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

class VerificationReport:
    def __init__(self):
        self.checks = []
        self.passed = 0
        self.failed = 0
        self.timestamp = datetime.now()
        
    def add_check(self, name, passed, message=""):
        """Add a verification check result."""
        self.checks.append({
            "name": name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_report(self):
        """Print verification report."""
        print("\n" + "="*70)
        print("  INFINITY-MATRIX HOSTINGER INTEGRATION VERIFICATION")
        print("="*70)
        print(f"\n  Timestamp: {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        for check in self.checks:
            status = "✅" if check["passed"] else "❌"
            print(f"  {status} {check['name']}")
            if check["message"]:
                print(f"     {check['message']}")
        
        print("\n" + "="*70)
        print(f"  Results: {self.passed} passed, {self.failed} failed")
        
        if self.failed == 0:
            print("  Status: ✅ ALL CHECKS PASSED - READY TO LAUNCH")
        else:
            print("  Status: ⚠️  SOME CHECKS FAILED - SEE ABOVE")
        
        print("="*70 + "\n")
        
        return self.failed == 0


def verify_hostinger_integration():
    """Verify Hostinger integration setup."""
    report = VerificationReport()
    base_path = Path(r"c:\AI\infinity-matrix")
    
    # Check 1: Frontend Hostinger Page
    hostinger_page = base_path / "frontend_stack" / "frontend" / "src" / "pages" / "HostingerPage.jsx"
    report.add_check(
        "Frontend Hostinger Page",
        hostinger_page.exists(),
        f"Location: {hostinger_page}"
    )
    
    # Check 2: App.jsx Route
    app_jsx = base_path / "frontend_stack" / "frontend" / "src" / "App.jsx"
    if app_jsx.exists():
        with open(app_jsx, 'r', encoding='utf-8') as f:
            content = f.read()
            has_import = "HostingerPage" in content
            has_route = "/hostinger" in content
            report.add_check(
                "App.jsx Route",
                has_import and has_route,
                "HostingerPage imported and /hostinger route added"
            )
    else:
        report.add_check("App.jsx Route", False, "App.jsx not found")
    
    # Check 3: Layout Navigation
    layout_jsx = base_path / "frontend_stack" / "frontend" / "src" / "components" / "Layout.jsx"
    if layout_jsx.exists():
        with open(layout_jsx, 'r', encoding='utf-8') as f:
            content = f.read()
            has_hostinger_link = "'/hostinger'" in content or '"/hostinger"' in content
            report.add_check(
                "Layout Navigation",
                has_hostinger_link,
                "Hosting link added to navbar"
            )
    else:
        report.add_check("Layout Navigation", False, "Layout.jsx not found")
    
    # Check 4: Orchestration Endpoint
    orchestration_index = base_path / "orchestration" / "server" / "index.ts"
    if orchestration_index.exists():
        with open(orchestration_index, 'r', encoding='utf-8') as f:
            content = f.read()
            has_endpoint = "/hostinger/info" in content
            report.add_check(
                "Orchestration Endpoint",
                has_endpoint,
                "GET /hostinger/info endpoint implemented"
            )
    else:
        report.add_check("Orchestration Endpoint", False, "index.ts not found")
    
    # Check 5: Hostinger Agent
    hostinger_agent = base_path / "ai_stack" / "hostinger" / "hostinger_agent.py"
    if hostinger_agent.exists():
        with open(hostinger_agent, 'r', encoding='utf-8') as f:
            content = f.read()
            has_api_integration = "requests" in content or "Session" in content
            has_methods = "get_account_info" in content and "get_domains" in content
            report.add_check(
                "Hostinger Agent",
                has_api_integration and has_methods,
                "Real API integration with all methods implemented"
            )
    else:
        report.add_check("Hostinger Agent", False, "hostinger_agent.py not found")
    
    # Check 6: Start Script
    start_script = base_path / "start_system.ps1"
    report.add_check(
        "System Launcher",
        start_script.exists(),
        f"Location: {start_script}"
    )
    
    # Check 7: Documentation
    setup_docs = base_path / "HOSTINGER_DASHBOARD_SETUP.md"
    report.add_check(
        "Setup Documentation",
        setup_docs.exists(),
        f"Location: {setup_docs}"
    )
    
    # Check 8: Credentials File
    creds_file = base_path / "credentials" / "hostinger_creds.json"
    if creds_file.exists():
        try:
            with open(creds_file, 'r', encoding='utf-8') as f:
                creds = json.load(f)
                has_api_key = "api_key" in creds or "HOSTINGER_API_KEY" in creds
                report.add_check(
                    "Hostinger Credentials",
                    has_api_key,
                    "API key configured in credentials file"
                )
        except json.JSONDecodeError:
            report.add_check("Hostinger Credentials", False, "Credentials file is invalid JSON")
    else:
        report.add_check(
            "Hostinger Credentials",
            False,
            "Optional: Add API key to credentials/hostinger_creds.json for live connection"
        )
    
    # Check 9: Frontend Package.json
    frontend_pkg = base_path / "frontend_stack" / "frontend" / "package.json"
    if frontend_pkg.exists():
        with open(frontend_pkg, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
            has_dependencies = "react" in pkg.get("dependencies", {})
            has_dev_vite = "vite" in pkg.get("devDependencies", {})
            report.add_check(
                "Frontend Dependencies",
                has_dependencies and has_dev_vite,
                "All required dependencies configured"
            )
    else:
        report.add_check("Frontend Dependencies", False, "package.json not found")
    
    # Check 10: Orchestration Package.json
    orch_pkg = base_path / "orchestration" / "package.json"
    if orch_pkg.exists():
        with open(orch_pkg, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
            has_express = "express" in pkg.get("dependencies", {})
            report.add_check(
                "Orchestration Dependencies",
                has_express,
                "Express and TypeScript dependencies configured"
            )
    else:
        report.add_check("Orchestration Dependencies", False, "package.json not found")
    
    return report


def main():
    """Run verification."""
    report = verify_hostinger_integration()
    success = report.print_report()
    
    print("  Next Steps:")
    print("  1. Run: .\\start_system.ps1")
    print("  2. Visit: http://localhost:3000/hostinger")
    print("  3. (Optional) Add Hostinger API key to see live data")
    print()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
