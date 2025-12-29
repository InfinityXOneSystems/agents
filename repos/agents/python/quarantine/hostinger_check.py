from integrations.hostinger.client import ping
from services.validation.reporter import report

def validate_hostinger():
    status, data = ping()
    healthy = status == 200
    report(
        subsystem="hostinger",
        healthy=healthy,
        details=data
    )
    return healthy
