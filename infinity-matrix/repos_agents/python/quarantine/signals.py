def score_risk(payload: dict) -> int:
    score = 0
    if payload.get('importance', 0) >= 8:
        score += 2
    if payload.get('confidence', 1.0) < 0.5:
        score += 2
    if payload.get('scope') == 'system':
        score += 3
    return score


def classify(payload: dict) -> str:
    if payload.get('scope') == 'system':
        return 'critical'
    if payload.get('importance', 0) >= 7:
        return 'high'
    return 'normal'
