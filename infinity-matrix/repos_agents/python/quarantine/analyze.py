def analyze(payload):
    risk = 0
    if payload.get('confidence',1) < 0.5:
        risk += 2
    return {
        'risk': risk,
        'decision': 'allow' if risk < 3 else 'review'
    }
