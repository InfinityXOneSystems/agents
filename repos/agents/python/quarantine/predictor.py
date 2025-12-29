def predict(context: dict) -> dict:
    signals = context.get('signals', [])
    direction = 'neutral'

    if len(signals) >= 3:
        direction = 'positive'
    if 'risk' in signals:
        direction = 'negative'

    return {
        'type': 'prediction',
        'direction': direction,
        'confidence': 0.7
    }
