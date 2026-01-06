/**
 * PubSub + Firestore Integration Service
 * For distributed eventing and memory sync
 */
import { EventEmitter } from 'events';
import { PubSub } from '@google-cloud/pubsub';
import { Firestore } from '@google-cloud/firestore';

export class PubSubFirestoreService extends EventEmitter {
  private pubsub: PubSub;
  private firestore: Firestore;
  constructor() {
    super();
    this.pubsub = new PubSub();
    this.firestore = new Firestore();
  }

  async publishMemoryUpdate(topic: string, memory: object) {
    await this.firestore.collection('shared_memories').add(memory);
    const buffer = Buffer.from(JSON.stringify(memory));
    await this.pubsub.topic(topic).publish(buffer);
  }

  subscribeToMemoryUpdates(topic: string, handler: (memory: object) => void) {
    const subscription = this.pubsub.subscription(topic);
    subscription.on('message', message => {
      handler(JSON.parse(message.data.toString()));
      message.ack();
    });
  }
}
