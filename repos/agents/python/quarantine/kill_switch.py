KILL = False
def is_killed(): return KILL
def kill(): 
    global KILL
    KILL = True
