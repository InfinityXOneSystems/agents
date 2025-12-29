def run(results):
    risk = 0.0
    for v in results.values():
        if isinstance(v, dict) and v.get('confidence',1) < 0.6:
            risk += 0.2
    return {'risk': min(1.0, risk)}
