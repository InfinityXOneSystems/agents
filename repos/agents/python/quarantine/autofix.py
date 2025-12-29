def autofix(event: dict):
    # rollback last image, restart service, notify admin
    return {'status':'rollback_triggered'}
