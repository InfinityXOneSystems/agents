def run(runbook:dict):
    steps = runbook.get('steps',[])
    results = []
    for step in steps:
        results.append({'step': step.get('name'), 'status':'ok'})
    return results
