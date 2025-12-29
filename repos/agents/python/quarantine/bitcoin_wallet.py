from bitcoinlib.wallets import Wallet
from memory.client import write_memory

def create_btc_wallet(label: str):
    wallet = Wallet.create(label)
    address = wallet.get_key().address
    write_memory({
        "scope": "crypto_wallet",
        "importance": 9,
        "confidence": 0.95,
        "content": {
            "chain": "bitcoin",
            "label": label,
            "address": address
        },
        "tags": ["crypto","bitcoin","wallet"]
    })
    return {"address": address}
