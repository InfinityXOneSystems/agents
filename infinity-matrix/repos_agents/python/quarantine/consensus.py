from services.orchestrator.gates.guardian_gate import guardian_gate

def consensus_execute(action: dict, executor_fn):
    '''
    Anti-hierarchical consensus:
    - Guardian validates
    - Executor runs only after approval
    '''
    guardian_gate(action)
    return executor_fn(action)
