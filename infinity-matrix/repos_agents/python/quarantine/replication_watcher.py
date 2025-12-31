from web3 import Web3
from ledger.chain_ledger import append

RPC_URL = 'https://YOUR_TESTNET_RPC'
CONTRACT_ADDRESS = '0xYOUR_CONTRACT'
ABI = []  # insert compiled ABI

w3 = Web3(Web3.HTTPProvider(RPC_URL))
contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

def watch():
    event_filter = contract.events.AIReplicated.createFilter(fromBlock='latest')
    while True:
        for e in event_filter.get_new_entries():
            append({
                'type': 'AI_REPLICATED',
                'creator': e['args']['creator'],
                'imageHash': e['args']['imageHash'],
                'purpose': e['args']['purpose']
            })
