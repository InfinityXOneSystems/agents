#!/usr/bin/env python3
"""
Infinity Hub Monitor & Integration
Monitors critical .infinity/ folder and integrates with system health checks
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional

class InfinityHubMonitor:
    """Monitor and integrate with the .infinity orchestration hub"""
    
    def __init__(self, infinity_path: str = ".infinity"):
        self.infinity_path = Path(infinity_path)
        self.logs_path = self.infinity_path / "logs"
        self.memory_path = self.infinity_path / "memory"
        self.reports_path = self.infinity_path / "reports"
        
    def check_hub_exists(self) -> bool:
        """Verify .infinity hub exists"""
        return self.infinity_path.exists()
    
    def get_autonomy_status(self) -> Dict[str, Any]:
        """Check autonomy enforcement status from autonomy.log"""
        log_file = self.logs_path / "autonomy.log"
        
        if not log_file.exists():
            return {"status": "missing", "reason": "autonomy.log not found"}
        
        try:
            with open(log_file, 'r') as f:
                content = f.read()
            
            lines = content.strip().split('\n')
            last_line = lines[-1] if lines else ""
            
            # Check for expected markers
            checks = {
                "autonomy_enabled": "AUTONOMY SUPER-SCRIPT" in content,
                "calendar_gate": "Calendar gate enforced" in content,
                "guardian_policy": "Guardian policy enforced" in content,
                "cloud_parity": "Cloud parity hook installed" in content,
                "python_fleet": "Python fleet validation OK" in content,
                "snapshot_retention": "Snapshot retention enforced" in content,
                "last_operation": last_line.strip()
            }
            
            return {"status": "active", "checks": checks}
        except Exception as e:
            return {"status": "error", "reason": str(e)}
    
    def get_bootstrap_registry(self) -> Dict[str, Any]:
        """Parse bootstrap.log to extract registered services"""
        bootstrap_log = self.infinity_path / "infinity-bootstrap.log"
        
        if not bootstrap_log.exists():
            return {"status": "missing", "services": []}
        
        services = []
        try:
            with open(bootstrap_log, 'r') as f:
                for line in f:
                    if "Bootstrapped" in line:
                        # Extract service name from "Bootstrapped xxx"
                        parts = line.split("Bootstrapped ")
                        if len(parts) > 1:
                            service = parts[1].strip()
                            services.append(service)
            
            return {
                "status": "active",
                "total_services": len(services),
                "services": services,
                "last_update": datetime.fromtimestamp(
                    bootstrap_log.stat().st_mtime
                ).isoformat()
            }
        except Exception as e:
            return {"status": "error", "reason": str(e), "services": services}
    
    def get_memory_snapshots(self) -> Dict[str, Any]:
        """Check memory snapshot state"""
        snapshots_dir = self.memory_path / "snapshots"
        
        if not snapshots_dir.exists():
            return {"status": "missing", "snapshots": [], "count": 0}
        
        try:
            snapshots = list(snapshots_dir.glob("*"))
            return {
                "status": "active",
                "count": len(snapshots),
                "snapshots": [s.name for s in snapshots],
                "retention_policy": "max 50 snapshots",
                "current_usage": f"{len(snapshots)}/50"
            }
        except Exception as e:
            return {"status": "error", "reason": str(e)}
    
    def get_authority_config(self) -> Dict[str, Any]:
        """Get GCP authority configuration"""
        auth_file = self.infinity_path / "authority.json"
        
        if not auth_file.exists():
            return {"status": "missing"}
        
        try:
            with open(auth_file, 'r') as f:
                config = json.load(f)
            return {"status": "active", "authority": config.get("authority"), 
                   "required": config.get("required", False)}
        except Exception as e:
            return {"status": "error", "reason": str(e)}
    
    def get_sync_config(self) -> Dict[str, Any]:
        """Get cross-system sync configuration"""
        sync_file = self.infinity_path / "sync.json"
        
        if not sync_file.exists():
            return {"status": "missing"}
        
        try:
            with open(sync_file, 'r') as f:
                config = json.load(f)
            return {"status": "active", "config": config}
        except Exception as e:
            return {"status": "error", "reason": str(e)}
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get complete system health from .infinity perspective"""
        return {
            "timestamp": datetime.now().isoformat(),
            "hub_exists": self.check_hub_exists(),
            "autonomy": self.get_autonomy_status(),
            "bootstrap_registry": self.get_bootstrap_registry(),
            "memory_snapshots": self.get_memory_snapshots(),
            "authority": self.get_authority_config(),
            "sync": self.get_sync_config(),
            "hub_path": str(self.infinity_path.absolute())
        }
    
    def generate_report(self) -> str:
        """Generate formatted health report"""
        health = self.get_system_health()
        
        hub_status = 'ACTIVE' if health['hub_exists'] else 'MISSING'
        
        report = f"""
╔════════════════════════════════════════════════════════════════════════════╗
║                    INFINITY HUB HEALTH REPORT                              ║
╚════════════════════════════════════════════════════════════════════════════╝

📍 Hub Location: {health['hub_path']}
✓ Hub Status: {hub_status}
⏰ Report Time: {health['timestamp']}

┌─ AUTONOMY ENFORCEMENT ────────────────────────────────────────────────────┐
│ Status: {health['autonomy'].get('status', 'unknown').upper()}
│ • Calendar Gate: {'✓' if health['autonomy'].get('checks', {}).get('calendar_gate') else '✗'}
│ • Guardian Policy: {'✓' if health['autonomy'].get('checks', {}).get('guardian_policy') else '✗'}
│ • Cloud Parity: {'✓' if health['autonomy'].get('checks', {}).get('cloud_parity') else '✗'}
│ • Python Fleet: {'✓' if health['autonomy'].get('checks', {}).get('python_fleet') else '✗'}
│ • Last Op: {health['autonomy'].get('checks', {}).get('last_operation', 'N/A')[:60]}
└───────────────────────────────────────────────────────────────────────────┘

┌─ BOOTSTRAP REGISTRY ──────────────────────────────────────────────────────┐
│ Total Services: {health['bootstrap_registry'].get('total_services', 0)}
│ Status: {health['bootstrap_registry'].get('status', 'unknown').upper()}
│ Last Update: {health['bootstrap_registry'].get('last_update', 'Unknown')}
│ 
│ Registered Services ({health['bootstrap_registry'].get('total_services', 0)}):
{self._format_services(health['bootstrap_registry'].get('services', []))}
└───────────────────────────────────────────────────────────────────────────┘

┌─ MEMORY MANAGEMENT ───────────────────────────────────────────────────────┐
│ Snapshots: {health['memory_snapshots'].get('count', 0)} (max 50)
│ Status: {'HEALTHY' if int(health['memory_snapshots'].get('count', 0)) < 50 else 'WARNING'}
│ Policy: {health['memory_snapshots'].get('retention_policy', 'N/A')}
└───────────────────────────────────────────────────────────────────────────┘

┌─ CONFIGURATION ───────────────────────────────────────────────────────────┐
│ GCP Authority: {health['authority'].get('authority', 'N/A')}
│ Sync Status: {health['sync'].get('status', 'unknown').upper()}
│ Cross-System Sync: {'ENABLED' if health['sync']['status'] == 'active' else 'DISABLED'}
└───────────────────────────────────────────────────────────────────────────┘

OVERALL STATUS: {'✅ HEALTHY' if health['hub_exists'] else '❌ CRITICAL'}
        """
        
        return report
    
    @staticmethod
    def _format_services(services: List[str]) -> str:
        """Format services list for display"""
        if not services:
            return "│ (No services registered)"
        
        # Group services by category
        lines = []
        for service in sorted(services)[:20]:  # Show first 20
            lines.append(f"│   • {service}")
        
        if len(services) > 20:
            lines.append(f"│   ... and {len(services) - 20} more services")
        
        return "\n".join(lines)


def main():
    """Run infinity hub monitor"""
    monitor = InfinityHubMonitor()
    
    # Generate and display report
    report = monitor.generate_report()
    print(report)
    
    # Save report with UTF-8 encoding
    report_file = Path(".infinity/reports/health_check_latest.txt")
    report_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    # Return health status for CI/CD
    health = monitor.get_system_health()
    return 0 if health['hub_exists'] and health['autonomy']['status'] == 'active' else 1


if __name__ == "__main__":
    exit(main())
