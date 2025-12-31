def strategize(prediction: dict) -> dict:
    if prediction['direction'] == 'positive':
        plan = 'expand'
    elif prediction['direction'] == 'negative':
        plan = 'defend'
    else:
        plan = 'observe'

    return {
        'type': 'strategy',
        'plan': plan,
        'rationale': f"Strategy based on {prediction['direction']} outlook"
    }
