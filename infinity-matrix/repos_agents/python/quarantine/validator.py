def validate(prediction: dict, strategy: dict) -> dict:
    valid = True

    if prediction['confidence'] < 0.5:
        valid = False

    return {
        'type': 'validation',
        'approved': valid,
        'notes': 'Confidence threshold met' if valid else 'Low confidence'
    }
