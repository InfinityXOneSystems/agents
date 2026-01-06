/**
 * PubSub Service for Infinity Matrix
 * Supports distributed eventing and real-time sync
 */
import { EventEmitter } from 'events';
import { PubSub } from '@google-cloud/pubsub';

export class PubSubService extends EventEmitter {
  private pubsub: PubSub;
  constructor() {
    super();
    this.pubsub = new PubSub();
  }

  async publish(topic: string, data: object) {
    const buffer = Buffer.from(JSON.stringify(data));
    await this.pubsub.topic(topic).publish(buffer);
  }

  subscribe(topic: string, handler: (data: object) => void) {
    const subscription = this.pubsub.subscription(topic);
    subscription.on('message', message => {
      handler(JSON.parse(message.data.toString()));
      message.ack();
    });
  }
}
