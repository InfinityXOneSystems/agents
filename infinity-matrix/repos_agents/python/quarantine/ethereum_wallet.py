from eth_account import Account
import secrets
from memory.client import write_memory

Account.enable_unaudited_hdwallet_features()

def create_eth_wallet(label: str):
    acct = Account.create(secrets.token_hex(32))
    write_memory({
        "scope": "crypto_wallet",
        "importance": 9,
        "confidence": 0.95,
        "content": {
            "chain": "ethereum",
            "label": label,
            "address": acct.address,
            "public_key": acct._key_obj.public_key.to_hex()
        },
        "tags": ["crypto","ethereum","wallet"]
    })
    return {"address": acct.address, "private_key": acct.key.hex()}
