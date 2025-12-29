from vision_cortex.predictor import predict
from vision_cortex.strategist import strategize
from vision_cortex.validator import validate
from vision_cortex.documentor import document

def run_vision_cycle(context: dict) -> dict:
    prediction = predict(context)
    strategy = strategize(prediction)
    validation = validate(prediction, strategy)

    result = {
        'prediction': prediction,
        'strategy': strategy,
        'validation': validation
    }

    document('vision', result)
    return result
