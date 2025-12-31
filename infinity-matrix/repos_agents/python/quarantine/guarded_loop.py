from services.orchestrator.consensus import consensus_execute

def guarded_cycle(run_fn):
    def wrapper(action):
        return consensus_execute(action, run_fn)
    return wrapper
