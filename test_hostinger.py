#!/usr/bin/env python3
"""Quick test of Hostinger API connection"""
import sys
from pathlib import Path

# Add to path
sys.path.insert(0, str(Path(__file__).parent / 'infinity-matrix' / 'ai_stack'))

from hostinger.hostinger_manager import HostingerManager

print("=" * 60)
print("Testing Hostinger API Connection")
print("=" * 60)

try:
    manager = HostingerManager()
    print("✅ Hostinger Manager initialized")
    print(f"✅ API Token loaded from credentials")
    
    print("\nRunning health check...")
    health = manager.health_check()
    
    print(f"\n{'API Connected:':<20} {'✅ YES' if health['api_connected'] else '❌ NO'}")
    print(f"{'Domains:':<20} {health['domains']}")
    print(f"{'VPS Instances:':<20} {health['vps']}")
    print(f"{'Services:':<20} {health['services']}")
    
    if health['issues']:
        print(f"\n⚠️  Issues detected:")
        for issue in health['issues']:
            print(f"   - {issue}")
    else:
        print("\n✅ No issues detected")
    
    print("\n" + "=" * 60)
    print("✅ Hostinger API is working correctly!")
    print("=" * 60)
    
except FileNotFoundError as e:
    print(f"\n❌ Error: {e}")
    print("\nMake sure your API token is in:")
    print("C:\\AI\\credentials\\hostinger\\api_token.json")
    sys.exit(1)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nThis might be an API connection issue.")
    print("Check your token and network connection.")
    sys.exit(1)
