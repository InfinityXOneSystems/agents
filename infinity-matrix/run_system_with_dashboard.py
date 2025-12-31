#!/usr/bin/env python3
"""
Run Infinity-Matrix System with Live Dashboard
Connects to Hostinger and displays real URL in dashboard
"""

import subprocess
import sys
import os
import json
import time
import requests
from datetime import datetime
from pathlib import Path

# Add ai_stack to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'ai_stack'))

from hostinger.hostinger_agent import HostingerAgent
from vision_cortex.vision_cortex import VisionCortex


class SystemDashboard:
    """Dashboard for system status and connection info."""
    
    def __init__(self):
        self.hostinger_agent = HostingerAgent()
        self.vision_cortex = VisionCortex()
        self.start_time = datetime.now()
        self.status = "initializing"
        
    def display_header(self):
        """Display dashboard header."""
        print("\n" + "="*80)
        print("  INFINITY-MATRIX SYSTEM DASHBOARD")
        print("  Live Hostinger Connection")
        print("="*80 + "\n")
        
    def display_hostinger_info(self):
        """Display Hostinger connection info."""
        print("[HOSTINGER CONNECTION]")
        print("-" * 80)
        
        try:
            # Get account info
            account = self.hostinger_agent.get_account_info()
            print(f"  ✅ Account Status: {account.get('account', 'unknown')}")
            print(f"  📊 Mode: {account.get('mode', 'live')}")
            
            # Get hosting URL
            url = self.hostinger_agent.get_hosting_url()
            if url:
                print(f"  🌐 Primary URL: {url}")
            
            # Get domains
            domains = self.hostinger_agent.get_domains()
            if "domains" in domains and domains["domains"]:
                print(f"  📍 Domains: {len(domains['domains'])} found")
                for domain in domains["domains"][:3]:
                    domain_name = domain.get('name', 'unknown')
                    domain_status = domain.get('status', 'unknown')
                    print(f"     • {domain_name} ({domain_status})")
            
            # Get websites
            websites = self.hostinger_agent.get_websites()
            if "websites" in websites and websites["websites"]:
                print(f"  🏠 Websites: {len(websites['websites'])} found")
                for website in websites["websites"][:3]:
                    website_name = website.get('name', 'unknown')
                    website_status = website.get('status', 'unknown')
                    print(f"     • {website_name} ({website_status})")
            
            print()
            
        except Exception as e:
            print(f"  ❌ Error connecting: {e}\n")
    
    def display_orchestration_info(self):
        """Display orchestration server info."""
        print("[ORCHESTRATION SERVER]")
        print("-" * 80)
        
        try:
            response = requests.get("http://localhost:3001/health", timeout=2)
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Server Status: {data.get('status', 'unknown')}")
                print(f"  📡 Service: {data.get('service', 'unknown')}")
                print(f"  ⏰ Timestamp: {data.get('timestamp', 'unknown')}")
                print(f"  🌐 URL: http://localhost:3001")
                print()
            else:
                print(f"  ⚠️ Server responding but unexpected status: {response.status_code}\n")
        except requests.exceptions.ConnectionError:
            print(f"  ⏳ Waiting for orchestration server to start (port 3001)...\n")
        except Exception as e:
            print(f"  ❌ Error checking server: {e}\n")
    
    def display_system_status(self):
        """Display system status."""
        print("[SYSTEM STATUS]")
        print("-" * 80)
        
        uptime = datetime.now() - self.start_time
        print(f"  🚀 Status: {self.status.upper()}")
        print(f"  ⏱️  Uptime: {str(uptime).split('.')[0]}")
        print(f"  📅 Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print()
    
    def display_quick_actions(self):
        """Display quick action commands."""
        print("[QUICK ACTIONS]")
        print("-" * 80)
        print("  TypeScript Orchestration:")
        print("    npm run build:orchestration     # Build TypeScript")
        print("    npm run start:orchestration     # Start server")
        print()
        print("  Python Agents:")
        print("    python run_system_with_dashboard.py   # This script")
        print("    npm run agents:test             # Run tests")
        print("    npm run health:check            # System health check")
        print()
    
    def update_display(self):
        """Update dashboard display."""
        os.system('cls' if os.name == 'nt' else 'clear')
        self.display_header()
        self.display_hostinger_info()
        self.display_orchestration_info()
        self.display_system_status()
        self.display_quick_actions()
        
        print("=" * 80)
        print("  Press Ctrl+C to stop | Dashboard updates every 5 seconds")
        print("=" * 80 + "\n")


def start_orchestration_server():
    """Start the TypeScript orchestration server in background."""
    try:
        # Check if npm is available
        subprocess.run(['npm', '--version'], capture_output=True, check=True)
        
        print("🚀 Starting Orchestration Server (TypeScript)...")
        
        # Build if needed
        build_result = subprocess.run(
            ['npm', 'run', 'build:orchestration'],
            cwd=r'c:\AI\infinity-matrix',
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if build_result.returncode != 0:
            print(f"⚠️  Build warning: {build_result.stderr[:200]}")
        
        # Start server in background
        subprocess.Popen(
            ['npm', 'run', 'start:orchestration'],
            cwd=r'c:\AI\infinity-matrix',
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
        print("✅ Orchestration server started (port 3001)")
        time.sleep(2)  # Give server time to start
        
    except FileNotFoundError:
        print("⚠️  npm not found, skipping orchestration server")
    except subprocess.TimeoutExpired:
        print("⚠️  Build timed out")
    except Exception as e:
        print(f"⚠️  Could not start orchestration server: {e}")


def main():
    """Run the system with dashboard."""
    
    # Start orchestration server
    start_orchestration_server()
    
    # Create and display dashboard
    dashboard = SystemDashboard()
    dashboard.status = "running"
    
    try:
        while True:
            dashboard.update_display()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n\n" + "="*80)
        print("  ✅ System stopped gracefully")
        print("="*80 + "\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
