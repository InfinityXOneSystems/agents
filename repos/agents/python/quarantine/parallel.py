import threading
import time

from cognition.vision.predictor import predict
from cognition.vision.strategist import strategize
from cognition.vision.validator import validate
from cognition.vision.documentor import document
from cognition.vision.debate import debate
from cognition.execution.executor import execute

def cognition_loop():
    prediction = predict({})
    strategy = strategize(prediction)
    validation = validate(strategy)
    consensus = debate([prediction, strategy, validation])
    result = execute(strategy)
    document(result)

def start():
    loops = []
    for _ in range(5):
        t = threading.Thread(target=cognition_loop, daemon=True)
        loops.append(t)
        t.start()

    while True:
        time.sleep(5)
