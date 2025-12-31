from ledger.chain_ledger import append

def replicate(agent:str, count:int=1):
    spawned = []
    for i in range(count):
        spawned.append(f'{agent}_clone_{i}')
        append({'type':'REPLICATION','agent':agent,'clone':spawned[-1]})
    return spawned
