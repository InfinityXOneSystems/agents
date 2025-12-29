STATE = 'IDLE'

def transition(new_state):
    global STATE
    allowed = {
        'IDLE': ['THINKING'],
        'THINKING': ['EXECUTING','IDLE'],
        'EXECUTING': ['IDLE','ERROR'],
        'ERROR': ['IDLE']
    }
    if new_state in allowed.get(STATE, []):
        STATE = new_state
    return STATE
