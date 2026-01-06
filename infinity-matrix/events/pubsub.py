from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient()
subscriber = pubsub_v1.SubscriberClient()

def publish_event(topic, data):
    publisher.publish(topic, data.encode("utf-8"))

def subscribe_event(subscription, callback):
    def wrapper(message):
        callback(message.data)
        message.ack()
    subscriber.subscribe(subscription, callback=wrapper)
