#!/usr/bin/env python3
"""
Hostinger Integration Installer
Sets up Hostinger API SDK and autonomous operations
"""

import os
import sys
import json
import subprocess
from pathlib import Path


class HostingerInstaller:
    """Installer for Hostinger integration"""
    
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent
        self.credentials_dir = Path(r'C:\AI\credentials')
        self.hostinger_creds_dir = self.credentials_dir / 'hostinger'
        
    def create_directories(self):
        """Create required directories"""
        print("📁 Creating directories...")
        
        dirs = [
            self.credentials_dir,
            self.hostinger_creds_dir,
            self.hostinger_creds_dir / 'backups',
            Path(r'C:\AI\logs')
        ]
        
        for directory in dirs:
            directory.mkdir(parents=True, exist_ok=True)
            print(f"  ✓ {directory}")
    
    def install_dependencies(self):
        """Install Python dependencies"""
        print("\n📦 Installing dependencies...")
        
        requirements_file = self.base_dir / 'infinity-matrix' / 'ai_stack' / 'hostinger' / 'requirements.txt'
        
        if requirements_file.exists():
            try:
                subprocess.check_call([
                    sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
                ])
                print("  ✓ Dependencies installed")
            except subprocess.CalledProcessError as e:
                print(f"  ✗ Failed to install dependencies: {e}")
                return False
        else:
            print(f"  ✗ Requirements file not found: {requirements_file}")
            return False
        
        return True
    
    def setup_api_token(self):
        """Setup Hostinger API token"""
        print("\n🔑 Setting up Hostinger API token...")
        
        token_file = self.hostinger_creds_dir / 'api_token.json'
        
        if token_file.exists():
            print(f"  ℹ Token file already exists: {token_file}")
            response = input("  Do you want to update it? (y/n): ")
            if response.lower() != 'y':
                return True
        
        print("\n  Please obtain your Hostinger API token from:")
        print("  https://www.hostinger.com/cpanel-login")
        print("  Dashboard → API → Generate Token\n")
        
        api_token = input("  Enter your Hostinger API token: ").strip()
        
        if not api_token:
            print("  ✗ No token provided")
            return False
        
        token_data = {
            'api_token': api_token,
            'created_at': str(Path(__file__).stat().st_mtime)
        }
        
        with open(token_file, 'w') as f:
            json.dump(token_data, f, indent=2)
        
        print(f"  ✓ Token saved to {token_file}")
        return True
    
    def test_connection(self):
        """Test Hostinger API connection"""
        print("\n🔍 Testing Hostinger API connection...")
        
        try:
            sys.path.insert(0, str(self.base_dir / 'infinity-matrix' / 'ai_stack'))
            from hostinger.hostinger_manager import HostingerManager
            
            manager = HostingerManager()
            health = manager.health_check()
            
            if health['api_connected']:
                print("  ✓ API connection successful")
                print(f"  - Domains: {health['domains']}")
                print(f"  - VPS: {health['vps']}")
                print(f"  - Services: {health['services']}")
                
                if health['issues']:
                    print(f"  ⚠ Issues detected: {len(health['issues'])}")
                    for issue in health['issues']:
                        print(f"    - {issue}")
                
                return True
            else:
                print("  ✗ API connection failed")
                if health['issues']:
                    for issue in health['issues']:
                        print(f"    - {issue}")
                return False
        except Exception as e:
            print(f"  ✗ Connection test failed: {e}")
            return False
    
    def create_launcher_script(self):
        """Create launcher script"""
        print("\n📝 Creating launcher script...")
        
        launcher_script = self.credentials_dir / 'launch_hostinger.bat'
        
        script_content = f'''@echo off
echo Starting Hostinger Autonomous System...
python "{self.base_dir}\\infinity-matrix\\ai_stack\\autonomous_controller.py"
pause
'''
        
        with open(launcher_script, 'w') as f:
            f.write(script_content)
        
        print(f"  ✓ Launcher created: {launcher_script}")
        print(f"  Run this script to start the autonomous system")
    
    def display_next_steps(self):
        """Display next steps for user"""
        print("\n" + "=" * 60)
        print("🎉 Hostinger Integration Installation Complete!")
        print("=" * 60)
        print("\nNext Steps:")
        print("\n1. Launch the autonomous system:")
        print(f"   {self.credentials_dir}\\launch_hostinger.bat")
        print("\n   OR")
        print(f"\n   python {self.base_dir}\\infinity-matrix\\ai_stack\\autonomous_controller.py")
        print("\n2. Use the CLI for manual operations:")
        print("   python -m hostinger.hostinger_cli domains list")
        print("   python -m hostinger.hostinger_cli health")
        print("   python -m hostinger.hostinger_cli backup")
        print("\n3. Monitor logs:")
        print(f"   {Path(r'C:\\AI\\logs\\autonomous_controller.log')}")
        print("\n4. View backups:")
        print(f"   {self.hostinger_creds_dir}\\backups")
        print("\n" + "=" * 60)
    
    def run(self):
        """Run installation"""
        print("=" * 60)
        print("Hostinger Integration Installer")
        print("=" * 60)
        
        # Step 1: Create directories
        self.create_directories()
        
        # Step 2: Install dependencies
        if not self.install_dependencies():
            print("\n❌ Installation failed at dependency installation")
            return False
        
        # Step 3: Setup API token
        if not self.setup_api_token():
            print("\n❌ Installation failed at API token setup")
            return False
        
        # Step 4: Test connection
        if not self.test_connection():
            print("\n⚠ Installation completed but API test failed")
            print("Please check your API token and try again")
        
        # Step 5: Create launcher
        self.create_launcher_script()
        
        # Step 6: Display next steps
        self.display_next_steps()
        
        return True


if __name__ == "__main__":
    installer = HostingerInstaller()
    success = installer.run()
    sys.exit(0 if success else 1)
