@app.post('/heartbeat')
def heartbeat():
    reconcile_calendar()
    reconcile_tasks()
    process_backlog()
    sync_firestore_memory()
    return {'status': 'alive'}
