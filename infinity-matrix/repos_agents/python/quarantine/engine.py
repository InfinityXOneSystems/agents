from ledger.chain_ledger import append

def record(agent:str, amount:float, source:str):
    append({
        'type':'REVENUE',
        'agent': agent,
        'amount': amount,
        'source': source
    })
    return True
