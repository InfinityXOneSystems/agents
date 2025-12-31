#!/usr/bin/env python3
"""
Hostinger CLI - Command Line Interface for Hostinger API
Autonomous operations without GitHub dependency
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Optional
from .hostinger_manager import HostingerManager


class HostingerCLI:
    """Command-line interface for Hostinger operations"""
    
    def __init__(self):
        self.manager = None
    
    def _init_manager(self, api_token: Optional[str] = None):
        """Initialize Hostinger Manager"""
        if not self.manager:
            self.manager = HostingerManager(api_token=api_token)
    
    def domains_list(self, args):
        """List all domains"""
        self._init_manager(args.token)
        domains = self.manager.list_domains()
        print(json.dumps(domains, indent=2))
    
    def domains_get(self, args):
        """Get domain details"""
        self._init_manager(args.token)
        domain = self.manager.get_domain(args.domain)
        print(json.dumps(domain, indent=2))
    
    def domains_renew(self, args):
        """Renew domain"""
        self._init_manager(args.token)
        result = self.manager.renew_domain(args.domain, args.years)
        print(json.dumps(result, indent=2))
    
    def dns_list(self, args):
        """List DNS records"""
        self._init_manager(args.token)
        records = self.manager.list_dns_records(args.domain)
        print(json.dumps(records, indent=2))
    
    def dns_create(self, args):
        """Create DNS record"""
        self._init_manager(args.token)
        result = self.manager.create_dns_record(
            args.domain,
            args.type,
            args.name,
            args.content,
            ttl=args.ttl,
            priority=args.priority
        )
        print(json.dumps(result, indent=2))
    
    def dns_delete(self, args):
        """Delete DNS record"""
        self._init_manager(args.token)
        result = self.manager.delete_dns_record(args.domain, args.record_id)
        print(json.dumps(result, indent=2))
    
    def vps_list(self, args):
        """List all VPS instances"""
        self._init_manager(args.token)
        vps_list = self.manager.list_vps()
        print(json.dumps(vps_list, indent=2))
    
    def vps_get(self, args):
        """Get VPS details"""
        self._init_manager(args.token)
        vps = self.manager.get_vps(args.vps_id)
        print(json.dumps(vps, indent=2))
    
    def vps_start(self, args):
        """Start VPS instance"""
        self._init_manager(args.token)
        result = self.manager.start_vps(args.vps_id)
        print(json.dumps(result, indent=2))
    
    def vps_stop(self, args):
        """Stop VPS instance"""
        self._init_manager(args.token)
        result = self.manager.stop_vps(args.vps_id)
        print(json.dumps(result, indent=2))
    
    def vps_restart(self, args):
        """Restart VPS instance"""
        self._init_manager(args.token)
        result = self.manager.restart_vps(args.vps_id)
        print(json.dumps(result, indent=2))
    
    def billing_info(self, args):
        """Get billing information"""
        self._init_manager(args.token)
        info = self.manager.get_billing_info()
        print(json.dumps(info, indent=2))
    
    def billing_invoices(self, args):
        """List invoices"""
        self._init_manager(args.token)
        invoices = self.manager.list_invoices()
        print(json.dumps(invoices, indent=2))
    
    def services_list(self, args):
        """List all services"""
        self._init_manager(args.token)
        services = self.manager.list_services()
        print(json.dumps(services, indent=2))
    
    def health_check(self, args):
        """Perform health check"""
        self._init_manager(args.token)
        health = self.manager.health_check()
        print(json.dumps(health, indent=2))
    
    def backup(self, args):
        """Backup all Hostinger data"""
        self._init_manager(args.token)
        result = self.manager.backup_all_data()
        print(f"Backup completed: {result['backup_file']}")
    
    def run(self):
        """Run the CLI"""
        parser = argparse.ArgumentParser(
            description='Hostinger CLI - Autonomous Hostinger API management',
            formatter_class=argparse.RawDescriptionHelpFormatter
        )
        parser.add_argument('--token', help='Hostinger API token (optional, uses credentials if not provided)')
        
        subparsers = parser.add_subparsers(dest='command', help='Available commands')
        
        # Domains commands
        domains = subparsers.add_parser('domains', help='Domain management')
        domains_sub = domains.add_subparsers(dest='subcommand')
        
        domains_sub.add_parser('list', help='List all domains')
        
        domains_get = domains_sub.add_parser('get', help='Get domain details')
        domains_get.add_argument('domain', help='Domain name')
        
        domains_renew = domains_sub.add_parser('renew', help='Renew domain')
        domains_renew.add_argument('domain', help='Domain name')
        domains_renew.add_argument('--years', type=int, default=1, help='Number of years')
        
        # DNS commands
        dns = subparsers.add_parser('dns', help='DNS management')
        dns_sub = dns.add_subparsers(dest='subcommand')
        
        dns_list = dns_sub.add_parser('list', help='List DNS records')
        dns_list.add_argument('domain', help='Domain name')
        
        dns_create = dns_sub.add_parser('create', help='Create DNS record')
        dns_create.add_argument('domain', help='Domain name')
        dns_create.add_argument('type', help='Record type (A, AAAA, CNAME, MX, TXT)')
        dns_create.add_argument('name', help='Record name')
        dns_create.add_argument('content', help='Record content')
        dns_create.add_argument('--ttl', type=int, default=3600, help='TTL in seconds')
        dns_create.add_argument('--priority', type=int, help='Priority (for MX records)')
        
        dns_delete = dns_sub.add_parser('delete', help='Delete DNS record')
        dns_delete.add_argument('domain', help='Domain name')
        dns_delete.add_argument('record_id', help='Record ID')
        
        # VPS commands
        vps = subparsers.add_parser('vps', help='VPS management')
        vps_sub = vps.add_subparsers(dest='subcommand')
        
        vps_sub.add_parser('list', help='List all VPS instances')
        
        vps_get = vps_sub.add_parser('get', help='Get VPS details')
        vps_get.add_argument('vps_id', help='VPS ID')
        
        vps_start = vps_sub.add_parser('start', help='Start VPS')
        vps_start.add_argument('vps_id', help='VPS ID')
        
        vps_stop = vps_sub.add_parser('stop', help='Stop VPS')
        vps_stop.add_argument('vps_id', help='VPS ID')
        
        vps_restart = vps_sub.add_parser('restart', help='Restart VPS')
        vps_restart.add_argument('vps_id', help='VPS ID')
        
        # Billing commands
        billing = subparsers.add_parser('billing', help='Billing management')
        billing_sub = billing.add_subparsers(dest='subcommand')
        
        billing_sub.add_parser('info', help='Get billing information')
        billing_sub.add_parser('invoices', help='List invoices')
        
        # Services commands
        services = subparsers.add_parser('services', help='Service management')
        services_sub = services.add_subparsers(dest='subcommand')
        
        services_sub.add_parser('list', help='List all services')
        
        # Utility commands
        subparsers.add_parser('health', help='Perform health check')
        subparsers.add_parser('backup', help='Backup all Hostinger data')
        
        args = parser.parse_args()
        
        if not args.command:
            parser.print_help()
            return
        
        # Route commands
        try:
            if args.command == 'domains':
                if args.subcommand == 'list':
                    self.domains_list(args)
                elif args.subcommand == 'get':
                    self.domains_get(args)
                elif args.subcommand == 'renew':
                    self.domains_renew(args)
            elif args.command == 'dns':
                if args.subcommand == 'list':
                    self.dns_list(args)
                elif args.subcommand == 'create':
                    self.dns_create(args)
                elif args.subcommand == 'delete':
                    self.dns_delete(args)
            elif args.command == 'vps':
                if args.subcommand == 'list':
                    self.vps_list(args)
                elif args.subcommand == 'get':
                    self.vps_get(args)
                elif args.subcommand == 'start':
                    self.vps_start(args)
                elif args.subcommand == 'stop':
                    self.vps_stop(args)
                elif args.subcommand == 'restart':
                    self.vps_restart(args)
            elif args.command == 'billing':
                if args.subcommand == 'info':
                    self.billing_info(args)
                elif args.subcommand == 'invoices':
                    self.billing_invoices(args)
            elif args.command == 'services':
                if args.subcommand == 'list':
                    self.services_list(args)
            elif args.command == 'health':
                self.health_check(args)
            elif args.command == 'backup':
                self.backup(args)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)


def main():
    """Main entry point for CLI"""
    cli = HostingerCLI()
    cli.run()


if __name__ == "__main__":
    main()
