import json, time

LEDGER_FILE = 'ledger/chain_ledger.jsonl'

def append(event:dict):
    event['ts'] = time.time()
    with open(LEDGER_FILE,'a') as f:
        f.write(json.dumps(event) + '\n')
