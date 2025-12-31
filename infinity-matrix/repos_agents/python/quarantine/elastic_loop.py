from agent_market.spawner import spawn
from agent_market.market_simulator import simulate_market
from agent_market.blockchain_listener import detect_chain_activity
import time

def run_elastic_loop():
    while True:
        market = simulate_market({})
        chain = detect_chain_activity()

        if market['opportunity_score'] > 0.6:
            for role in market['recommended_agents']:
                spawn(role, 'exploit market signal')

        if chain['signal_strength'] > 0.6:
            spawn('blockchain-analyst', 'monitor chain activity')

        time.sleep(10)
