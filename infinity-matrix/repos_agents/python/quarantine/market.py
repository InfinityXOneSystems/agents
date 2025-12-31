from predictor.signal_agent import run as signals
from predictor.trend_agent import run as trends
from predictor.anomaly_agent import run as anomalies
from predictor.scenario_agent import run as scenarios
from predictor.skeptic_agent import run as skeptic
from memory.client import write_memory

def predict(context):
    results = {
        'signals': signals(context),
        'trends': trends(context),
        'anomalies': anomalies(context),
        'scenarios': scenarios(context)
    }
    doubt = skeptic(results)
    consensus = {
        'results': results,
        'risk': doubt['risk'],
        'confidence': max(0.0, 1.0 - doubt['risk'])
    }
    write_memory({
        'scope': 'market_prediction',
        'importance': 8,
        'confidence': consensus['confidence'],
        'content': consensus,
        'tags': ['predictor','parallel','market']
    })
    return consensus

