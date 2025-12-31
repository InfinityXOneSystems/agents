def generate(vision):
    return [
        {'task': 'analyze_market', 'origin': vision},
        {'task': 'model_outcome', 'origin': vision}
    ]
