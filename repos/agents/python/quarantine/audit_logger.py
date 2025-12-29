from datetime import datetime

def audit_log(action, status, reason=None):
    record = {
        'timestamp': datetime.utcnow().isoformat(),
        'action': action,
        'status': status,
        'reason': reason
    }
    print('[AUDIT]', record)
