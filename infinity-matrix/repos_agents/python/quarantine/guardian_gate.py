from governance.guardian.guardian_agent import GuardianAgent
from governance.guardian.audit.audit_logger import audit_log
from control.manifest_loader import Manifest
import yaml

def load_yaml(path):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

# Load authoritative sources
_manifest = Manifest().data
_manifesto = load_yaml('governance/guardian/manifesto/company_manifesto.yaml')
_sop = load_yaml('governance/guardian/sop/sop.yaml')
_taxonomy = load_yaml('governance/guardian/taxonomy/taxonomy.yaml')

GUARDIAN = GuardianAgent(
    manifesto=_manifesto,
    sop=_sop,
    taxonomy=_taxonomy,
    manifest=_manifest
)

def guardian_gate(action: dict):
    try:
        GUARDIAN.validate(action)
        audit_log(action, status='APPROVED')
        return True
    except Exception as e:
        audit_log(action, status='REJECTED', reason=str(e))
        raise
