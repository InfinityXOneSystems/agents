subscribers = {}

def publish(topic:str, event:dict):
    for fn in subscribers.get(topic,[]):
        fn(event)

def subscribe(topic:str, handler):
    subscribers.setdefault(topic,[]).append(handler)
