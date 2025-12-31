MAX_DEPTH = 3

def plan(goal, depth=0):
    if depth >= MAX_DEPTH:
        return [{'action': 'halt', 'reason': 'depth_limit'}]

    return [
        {'action': f'refine_{goal}', 'depth': depth},
        *plan(goal, depth + 1)
    ]
