#!/usr/bin/env python3
"""
Hostinger API Manager
Autonomous operations for domain, VPS, DNS, and billing management
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from pathlib import Path
from datetime import datetime


class HostingerManager:
    """Hostinger API Manager for autonomous operations"""
    
    BASE_URL = "https://api.hostinger.com/v1"
    
    def __init__(self, api_token: Optional[str] = None, credentials_dir: Optional[str] = None):
        """
        Initialize Hostinger Manager
        
        Args:
            api_token: Hostinger API token (optional, loads from credentials if not provided)
            credentials_dir: Path to credentials directory
        """
        self.credentials_dir = Path(credentials_dir or os.getenv('CREDENTIALS_DIR', r'C:\AI\credentials'))
        self.api_token = api_token or self._load_api_token()
        self.headers = {
            'Authorization': f'Bearer {self.api_token}',
            'Content-Type': 'application/json'
        }
    
    def _load_api_token(self) -> str:
        """Load Hostinger API token from credentials"""
        token_file = self.credentials_dir / 'hostinger' / 'api_token.json'
        if not token_file.exists():
            raise FileNotFoundError(f"Hostinger API token not found at {token_file}")
        
        with open(token_file, 'r') as f:
            data = json.load(f)
            return data.get('api_token') or data.get('token')
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make API request to Hostinger"""
        url = f"{self.BASE_URL}/{endpoint}"
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers)
            elif method == 'POST':
                response = requests.post(url, headers=self.headers, json=data)
            elif method == 'PUT':
                response = requests.put(url, headers=self.headers, json=data)
            elif method == 'DELETE':
                response = requests.delete(url, headers=self.headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            raise
    
    # Domain Management
    def list_domains(self) -> List[Dict]:
        """List all domains"""
        return self._make_request('GET', 'domains')
    
    def get_domain(self, domain_name: str) -> Dict:
        """Get domain details"""
        return self._make_request('GET', f'domains/{domain_name}')
    
    def register_domain(self, domain_name: str, contact_info: Dict) -> Dict:
        """Register a new domain"""
        data = {
            'domain': domain_name,
            'contact': contact_info
        }
        return self._make_request('POST', 'domains', data)
    
    def renew_domain(self, domain_name: str, years: int = 1) -> Dict:
        """Renew domain registration"""
        data = {'years': years}
        return self._make_request('POST', f'domains/{domain_name}/renew', data)
    
    # DNS Management
    def list_dns_records(self, domain_name: str) -> List[Dict]:
        """List all DNS records for a domain"""
        return self._make_request('GET', f'domains/{domain_name}/dns')
    
    def create_dns_record(self, domain_name: str, record_type: str, name: str, content: str, **kwargs) -> Dict:
        """Create a DNS record"""
        data = {
            'type': record_type,
            'name': name,
            'content': content,
            **kwargs
        }
        return self._make_request('POST', f'domains/{domain_name}/dns', data)
    
    def update_dns_record(self, domain_name: str, record_id: str, data: Dict) -> Dict:
        """Update a DNS record"""
        return self._make_request('PUT', f'domains/{domain_name}/dns/{record_id}', data)
    
    def delete_dns_record(self, domain_name: str, record_id: str) -> Dict:
        """Delete a DNS record"""
        return self._make_request('DELETE', f'domains/{domain_name}/dns/{record_id}')
    
    # VPS Management
    def list_vps(self) -> List[Dict]:
        """List all VPS instances"""
        return self._make_request('GET', 'vps')
    
    def get_vps(self, vps_id: str) -> Dict:
        """Get VPS details"""
        return self._make_request('GET', f'vps/{vps_id}')
    
    def start_vps(self, vps_id: str) -> Dict:
        """Start a VPS instance"""
        return self._make_request('POST', f'vps/{vps_id}/start')
    
    def stop_vps(self, vps_id: str) -> Dict:
        """Stop a VPS instance"""
        return self._make_request('POST', f'vps/{vps_id}/stop')
    
    def restart_vps(self, vps_id: str) -> Dict:
        """Restart a VPS instance"""
        return self._make_request('POST', f'vps/{vps_id}/restart')
    
    # Billing Management
    def get_billing_info(self) -> Dict:
        """Get billing information"""
        return self._make_request('GET', 'billing')
    
    def list_invoices(self) -> List[Dict]:
        """List all invoices"""
        return self._make_request('GET', 'billing/invoices')
    
    def get_invoice(self, invoice_id: str) -> Dict:
        """Get invoice details"""
        return self._make_request('GET', f'billing/invoices/{invoice_id}')
    
    # Service Management
    def list_services(self) -> List[Dict]:
        """List all services"""
        return self._make_request('GET', 'services')
    
    def get_service(self, service_id: str) -> Dict:
        """Get service details"""
        return self._make_request('GET', f'services/{service_id}')
    
    # Auto-Renewal Management
    def enable_auto_renewal(self, service_id: str) -> Dict:
        """Enable auto-renewal for a service"""
        return self._make_request('POST', f'services/{service_id}/auto-renewal/enable')
    
    def disable_auto_renewal(self, service_id: str) -> Dict:
        """Disable auto-renewal for a service"""
        return self._make_request('POST', f'services/{service_id}/auto-renewal/disable')
    
    # Backup Operations
    def backup_all_data(self, backup_dir: Optional[Path] = None) -> Dict:
        """Backup all Hostinger data for autonomous operations"""
        backup_dir = backup_dir or self.credentials_dir / 'hostinger' / 'backups'
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        backup_data = {
            'domains': self.list_domains(),
            'vps': self.list_vps(),
            'services': self.list_services(),
            'billing': self.get_billing_info(),
            'invoices': self.list_invoices()
        }
        
        # Backup DNS records for each domain
        for domain in backup_data['domains']:
            domain_name = domain.get('domain') or domain.get('name')
            try:
                backup_data[f'dns_{domain_name}'] = self.list_dns_records(domain_name)
            except Exception as e:
                print(f"Failed to backup DNS for {domain_name}: {e}")
        
        # Save backup
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f'hostinger_backup_{timestamp}.json'
        with open(backup_file, 'w') as f:
            json.dump(backup_data, f, indent=2)
        
        return {
            'status': 'success',
            'backup_file': str(backup_file),
            'data': backup_data
        }
    
    def health_check(self) -> Dict:
        """Perform health check on Hostinger services"""
        results = {
            'api_connected': False,
            'domains': 0,
            'vps': 0,
            'services': 0,
            'issues': []
        }
        
        try:
            domains = self.list_domains()
            results['domains'] = len(domains)
            results['api_connected'] = True
        except Exception as e:
            results['issues'].append(f"Domain API error: {e}")
        
        try:
            vps = self.list_vps()
            results['vps'] = len(vps)
        except Exception as e:
            results['issues'].append(f"VPS API error: {e}")
        
        try:
            services = self.list_services()
            results['services'] = len(services)
        except Exception as e:
            results['issues'].append(f"Services API error: {e}")
        
        return results


if __name__ == "__main__":
    # Example autonomous operations
    manager = HostingerManager()
    
    print("=== Hostinger Health Check ===")
    health = manager.health_check()
    print(json.dumps(health, indent=2))
    
    print("\n=== Backing up Hostinger data ===")
    backup_result = manager.backup_all_data()
    print(f"Backup saved to: {backup_result['backup_file']}")
