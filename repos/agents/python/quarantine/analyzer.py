def analyze(intent, payload):
    risk = 0
    if payload.get('importance',0) >= 8: risk += 3
    if payload.get('confidence',1) < 0.5: risk += 3
    decision = 'allow'
    if risk >= 4: decision = 'review'
    if risk >= 6: decision = 'block'
    return {
        'intent': intent,
        'risk': risk,
        'decision': decision
    }
