from services.validation.reporter import report

def heal_hostinger(issue):
    actions = [
        "invalidate_frontend_cache",
        "restart_frontend_pipeline",
        "fallback_to_static"
    ]
    report(
        subsystem="hostinger",
        healthy=False,
        remediation_attempted=actions,
        issue=issue
    )
    return actions
