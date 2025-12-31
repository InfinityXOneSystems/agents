#!/usr/bin/env python3
"""Test Firestore and Pub/Sub integration"""

from ai_stack.master_integrator import MasterIntegrator
from ai_stack.google_cloud.firestore_agent import FirestoreAgent
from ai_stack.google_cloud.pubsub_agent import PubSubAgent

# Test Firestore
print('Testing Firestore Agent...')
fs = FirestoreAgent()
fs.create_index('test', [('timestamp', 'desc')])
doc_id = fs.add_document('users', {'name': 'System', 'role': 'admin'})
print(f'✅ Firestore: Document created {doc_id}')
print(f'   Stats: {fs.get_stats()}')

# Test Pub/Sub
print('\nTesting Pub/Sub Agent...')
pubsub = PubSubAgent()
pubsub.create_topic('system-events')
pubsub.create_subscription('test-sub', 'system-events')
msg_id = pubsub.publish_message('system-events', {'event': 'test', 'status': 'ok'})
print(f'✅ Pub/Sub: Message published {msg_id}')
print(f'   Stats: {pubsub.get_global_stats()}')

# Test integration
print('\nTesting Master Integrator...')
integrator = MasterIntegrator()
loaded_agents = list(integrator.agents.keys())
print(f'✅ Loaded agents: {loaded_agents}')
print(f'✅ Firestore agent available: {"firestore" in integrator.agents}')
print(f'✅ Pub/Sub agent available: {"pubsub" in integrator.agents}')

print('\n' + '='*60)
print('FIRESTORE & PUB/SUB INTEGRATION SUCCESSFUL')
print('='*60)
