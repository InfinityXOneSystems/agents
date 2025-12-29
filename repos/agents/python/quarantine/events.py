from control.event_bus import EventBus

event_bus = EventBus()

def emit(event_type: str, payload: dict):
    event_bus.emit(event_type, payload)

def subscribe(event_type: str, handler):
    event_bus.subscribe(event_type, handler)
