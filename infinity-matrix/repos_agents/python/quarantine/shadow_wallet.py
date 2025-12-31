import secrets
import hashlib

def create_eth_wallet():
    priv = secrets.token_hex(32)
    addr = '0x' + hashlib.sha256(priv.encode()).hexdigest()[:40]
    return {'chain':'ethereum','address':addr,'private_key':priv}

def create_btc_wallet():
    priv = secrets.token_hex(32)
    addr = hashlib.sha256(priv.encode()).hexdigest()[:34]
    return {'chain':'bitcoin','address':addr,'private_key':priv}
