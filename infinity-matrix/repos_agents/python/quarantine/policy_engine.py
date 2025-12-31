def allow(intent, analysis):
    if analysis.get('decision') == 'block':
        return False
    return True
