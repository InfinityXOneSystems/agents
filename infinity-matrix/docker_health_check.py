#!/usr/bin/env python3
"""
Docker Health Check Script for Infinity-Matrix
Verifies all services are running and accessible
"""

import subprocess
import time
import sys
import json
from typing import Dict, List, Tuple

class ServiceChecker:
    def __init__(self):
        self.services = {
            'frontend': {
                'port': 3000,
                'url': 'http://localhost:3000',
                'expected': 200
            },
            'orchestration': {
                'port': 3001,
                'url': 'http://localhost:3001/health',
                'expected': 200
            },
            'api-gateway': {
                'port': 8000,
                'url': 'http://localhost:8000',
                'expected': 200
            },
            'ollama': {
                'port': 11434,
                'url': 'http://localhost:11434/api/tags',
                'expected': 200
            }
        }
        
        self.results = {}
        self.errors = []
    
    def check_docker_compose(self) -> bool:
        """Check if docker-compose is available"""
        try:
            result = subprocess.run(
                ['docker-compose', 'ps'],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            self.errors.append(f"Docker Compose check failed: {e}")
            return False
    
    def get_container_status(self) -> Dict[str, str]:
        """Get status of all containers"""
        try:
            result = subprocess.run(
                ['docker-compose', 'ps', '--format', 'json'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                containers = json.loads(result.stdout)
                return {c['Service']: c['State'] for c in containers}
            return {}
        except Exception as e:
            self.errors.append(f"Failed to get container status: {e}")
            return {}
    
    def check_service_port(self, service: str, port: int) -> bool:
        """Check if service port is responding"""
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result == 0
        except Exception as e:
            self.errors.append(f"Port check failed for {service}: {e}")
            return False
    
    def check_service_http(self, service: str, url: str) -> Tuple[bool, int]:
        """Check if service is responding to HTTP requests"""
        try:
            import urllib.request
            request = urllib.request.urlopen(url, timeout=5)
            status = request.status
            request.close()
            return True, status
        except Exception as e:
            return False, 0
    
    def check_all_services(self) -> bool:
        """Check all services"""
        print("\n" + "="*50)
        print("DOCKER SERVICE HEALTH CHECK")
        print("="*50 + "\n")
        
        # Check Docker Compose
        print("1. Checking Docker Compose...")
        if not self.check_docker_compose():
            print("   ✗ Docker Compose not available")
            return False
        print("   ✓ Docker Compose is available")
        
        # Get container status
        print("\n2. Checking Container Status...")
        containers = self.get_container_status()
        
        if not containers:
            print("   ✗ No containers found")
            return False
        
        for service, state in containers.items():
            status = '✓' if 'running' in state.lower() else '✗'
            print(f"   {status} {service}: {state}")
            self.results[service] = state
        
        # Check service connectivity
        print("\n3. Checking Service Connectivity...")
        all_ok = True
        
        for service, config in self.services.items():
            port = config['port']
            url = config['url']
            
            # Port check
            port_ok = self.check_service_port(service, port)
            port_status = '✓' if port_ok else '✗'
            print(f"   {port_status} {service} (port {port}): ", end='')
            
            if not port_ok:
                print("Not responding")
                all_ok = False
                continue
            
            # HTTP check
            http_ok, status = self.check_service_http(service, url)
            http_status = '✓' if http_ok else '✗'
            print(f"{http_status} (HTTP {status})")
            
            if not http_ok:
                all_ok = False
        
        return all_ok
    
    def check_hostinger_dashboard(self) -> bool:
        """Check Hostinger dashboard specifically"""
        print("\n4. Checking Hostinger Dashboard...")
        
        try:
            import urllib.request
            url = 'http://localhost:3000/hostinger'
            request = urllib.request.urlopen(url, timeout=5)
            status = request.status
            request.close()
            
            if status == 200:
                print(f"   ✓ Hostinger dashboard available at {url}")
                return True
            else:
                print(f"   ✗ Hostinger dashboard returned {status}")
                return False
        except Exception as e:
            print(f"   ✗ Hostinger dashboard check failed: {e}")
            return False
    
    def check_logs(self) -> None:
        """Display recent logs"""
        print("\n5. Recent Service Logs...")
        
        try:
            result = subprocess.run(
                ['docker-compose', 'logs', '--tail=10'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.stdout:
                print("\n   Last 10 log lines:")
                for line in result.stdout.split('\n')[-10:]:
                    if line.strip():
                        print(f"   {line}")
        except Exception as e:
            print(f"   ✗ Failed to get logs: {e}")
    
    def print_summary(self) -> None:
        """Print health check summary"""
        print("\n" + "="*50)
        print("SUMMARY")
        print("="*50)
        
        if self.errors:
            print("\nErrors encountered:")
            for error in self.errors:
                print(f"  • {error}")
        
        print("\nNext steps:")
        print("  • If services are not running: docker-compose up -d")
        print("  • To view full logs: docker-compose logs -f")
        print("  • To restart services: docker-compose restart")
        print("  • To rebuild: docker-compose build && docker-compose up -d")
        
        print("\nService URLs:")
        print("  • Frontend: http://localhost:3000")
        print("  • Hostinger Dashboard: http://localhost:3000/hostinger")
        print("  • API Health: http://localhost:3001/health")
        print("  • API Gateway: http://localhost:8000")
        print("  • Ollama: http://localhost:11434")
    
    def wait_for_services(self, timeout: int = 120) -> bool:
        """Wait for all services to be ready"""
        print("\nWaiting for services to be ready...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            all_ready = True
            
            for service, config in self.services.items():
                if not self.check_service_port(service, config['port']):
                    all_ready = False
                    remaining = timeout - (time.time() - start_time)
                    print(f"  Waiting for {service}... ({remaining:.0f}s remaining)")
                    break
            
            if all_ready:
                print("  ✓ All services are ready!")
                return True
            
            time.sleep(5)
        
        print(f"  ✗ Services not ready after {timeout}s")
        return False
    
    def run(self, wait: bool = False) -> int:
        """Run all checks"""
        if wait:
            if not self.wait_for_services():
                self.print_summary()
                return 1
        
        if not self.check_all_services():
            print("\n⚠ Some services are not responding")
        
        self.check_hostinger_dashboard()
        self.check_logs()
        self.print_summary()
        
        return 0 if not self.errors else 1

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Health check for Infinity-Matrix Docker services'
    )
    parser.add_argument(
        '--wait',
        action='store_true',
        help='Wait for services to be ready (useful during startup)'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=120,
        help='Timeout in seconds when using --wait (default: 120)'
    )
    
    args = parser.parse_args()
    
    checker = ServiceChecker()
    return checker.run(wait=args.wait)

if __name__ == '__main__':
    sys.exit(main())
