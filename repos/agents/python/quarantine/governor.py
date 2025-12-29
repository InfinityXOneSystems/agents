def govern(payload):
    if payload.get('risk', 0) > 6:
        return 'block'
    return 'allow'
