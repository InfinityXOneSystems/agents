from blockchain.wallets.shadow_wallet import create_eth_wallet, create_btc_wallet

def replicate_wallets(n=1):
    wallets = []
    for _ in range(n):
        wallets.append(create_eth_wallet())
        wallets.append(create_btc_wallet())
    return wallets
