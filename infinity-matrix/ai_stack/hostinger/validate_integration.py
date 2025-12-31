#!/usr/bin/env python3
"""
Hostinger Integration Validation Script
Tests all components without requiring actual API token
"""

import sys
import os
from pathlib import Path


class ValidationTest:
    """Validation tests for Hostinger integration"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent.parent
        self.passed = 0
        self.failed = 0
        self.warnings = 0
    
    def test(self, name, condition, critical=True):
        """Run a test"""
        if condition:
            print(f"✅ PASS: {name}")
            self.passed += 1
            return True
        else:
            if critical:
                print(f"❌ FAIL: {name}")
                self.failed += 1
            else:
                print(f"⚠️  WARN: {name}")
                self.warnings += 1
            return False
    
    def test_file_exists(self, filepath, name, critical=True):
        """Test if file exists"""
        full_path = self.base_dir / filepath
        return self.test(
            f"{name} exists at {filepath}",
            full_path.exists(),
            critical
        )
    
    def test_directory_structure(self):
        """Test directory structure"""
        print("\n📁 Testing Directory Structure...")
        
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/__init__.py",
            "Hostinger package init"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/hostinger_manager.py",
            "Hostinger Manager SDK"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/hostinger_cli.py",
            "Hostinger CLI"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/install_hostinger.py",
            "Hostinger Installer"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/requirements.txt",
            "Hostinger Requirements"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger/README.md",
            "Hostinger README"
        )
    
    def test_agent_files(self):
        """Test agent files"""
        print("\n🤖 Testing Agent Files...")
        
        self.test_file_exists(
            "infinity-matrix/ai_stack/hostinger_agent.py",
            "Hostinger Monitoring Agent"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/autonomous_controller.py",
            "Autonomous Controller"
        )
        self.test_file_exists(
            "infinity-matrix/ai_stack/launch_all_agents.py",
            "Agent Launcher"
        )
    
    def test_documentation(self):
        """Test documentation files"""
        print("\n📚 Testing Documentation...")
        
        self.test_file_exists(
            "AUTONOMOUS_OPERATIONS.md",
            "Autonomous Operations Guide"
        )
        self.test_file_exists(
            "QUICK_START.md",
            "Quick Start Guide"
        )
        self.test_file_exists(
            "IMPLEMENTATION_SUMMARY.md",
            "Implementation Summary"
        )
    
    def test_python_imports(self):
        """Test Python module imports"""
        print("\n🐍 Testing Python Imports...")
        
        sys.path.insert(0, str(self.base_dir / 'infinity-matrix' / 'ai_stack'))
        
        # Test hostinger package import
        try:
            import hostinger
            self.test("Hostinger package import", True)
        except ImportError as e:
            self.test(f"Hostinger package import (Error: {e})", False)
        
        # Test HostingerManager import
        try:
            from hostinger.hostinger_manager import HostingerManager
            self.test("HostingerManager class import", True)
        except ImportError as e:
            self.test(f"HostingerManager import (Error: {e})", False)
        
        # Test HostingerCLI import
        try:
            from hostinger.hostinger_cli import HostingerCLI
            self.test("HostingerCLI class import", True)
        except ImportError as e:
            self.test(f"HostingerCLI import (Error: {e})", False)
    
    def test_manager_methods(self):
        """Test HostingerManager methods exist"""
        print("\n🔧 Testing HostingerManager Methods...")
        
        try:
            from hostinger.hostinger_manager import HostingerManager
            
            methods = [
                'list_domains',
                'get_domain',
                'register_domain',
                'renew_domain',
                'list_dns_records',
                'create_dns_record',
                'update_dns_record',
                'delete_dns_record',
                'list_vps',
                'get_vps',
                'start_vps',
                'stop_vps',
                'restart_vps',
                'get_billing_info',
                'list_invoices',
                'list_services',
                'enable_auto_renewal',
                'disable_auto_renewal',
                'backup_all_data',
                'health_check'
            ]
            
            # Create a dummy instance (will fail on init without token, but that's ok)
            for method in methods:
                has_method = hasattr(HostingerManager, method)
                self.test(f"HostingerManager.{method} exists", has_method)
        
        except Exception as e:
            self.test(f"HostingerManager method check (Error: {e})", False)
    
    def test_integration_points(self):
        """Test integration with existing system"""
        print("\n🔗 Testing Integration Points...")
        
        # Check launch_all_agents.py includes Hostinger
        try:
            launch_file = self.base_dir / 'infinity-matrix' / 'ai_stack' / 'launch_all_agents.py'
            with open(launch_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                has_hostinger = 'hostinger' in content.lower()
                self.test("launch_all_agents.py includes Hostinger", has_hostinger)
        except Exception as e:
            self.test(f"Launch integration check (Error: {e})", False)
        
        # Check requirements updated
        try:
            req_file = self.base_dir / 'infinity-matrix' / 'ai_stack' / 'hostinger' / 'requirements.txt'
            with open(req_file, 'r', encoding='utf-8') as f:
                content = f.read()
                has_requests = 'requests' in content
                self.test("Requirements include requests library", has_requests)
        except Exception as e:
            self.test(f"Requirements check (Error: {e})", False)
    
    def test_credentials_directory(self):
        """Test credentials directory (non-critical)"""
        print("\n🔐 Testing Credentials Directory...")
        
        creds_dir = Path(r'C:\AI\credentials\hostinger')
        self.test(
            "Credentials directory exists",
            creds_dir.exists(),
            critical=False
        )
        
        if creds_dir.exists():
            token_file = creds_dir / 'api_token.json'
            self.test(
                "API token file exists",
                token_file.exists(),
                critical=False
            )
    
    def display_summary(self):
        """Display test summary"""
        print("\n" + "=" * 60)
        print("VALIDATION SUMMARY")
        print("=" * 60)
        print(f"✅ Passed:   {self.passed}")
        print(f"❌ Failed:   {self.failed}")
        print(f"⚠️  Warnings: {self.warnings}")
        print(f"📊 Total:    {self.passed + self.failed + self.warnings}")
        
        if self.failed == 0:
            print("\n🎉 All critical tests passed!")
            print("\nNext steps:")
            print("1. Run installer: python infinity-matrix/ai_stack/hostinger/install_hostinger.py")
            print("2. Configure API token")
            print("3. Launch system: python infinity-matrix/ai_stack/autonomous_controller.py")
        else:
            print(f"\n⚠️  {self.failed} critical test(s) failed!")
            print("Please review the failed tests above.")
        
        if self.warnings > 0:
            print(f"\nℹ️  {self.warnings} warning(s) - these are optional components")
        
        print("=" * 60)
    
    def run_all_tests(self):
        """Run all validation tests"""
        print("=" * 60)
        print("HOSTINGER INTEGRATION VALIDATION")
        print("=" * 60)
        
        self.test_directory_structure()
        self.test_agent_files()
        self.test_documentation()
        self.test_python_imports()
        self.test_manager_methods()
        self.test_integration_points()
        self.test_credentials_directory()
        
        self.display_summary()
        
        return self.failed == 0


if __name__ == "__main__":
    validator = ValidationTest()
    success = validator.run_all_tests()
    sys.exit(0 if success else 1)
