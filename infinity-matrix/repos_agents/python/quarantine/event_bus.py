from collections import defaultdict
from typing import Callable, Dict, List

class EventBus:
    def __init__(self):
        self.subscribers: Dict[str, List[Callable]] = defaultdict(list)

    def subscribe(self, event_type: str, handler: Callable):
        self.subscribers[event_type].append(handler)

    def emit(self, event_type: str, payload: dict):
        for handler in self.subscribers.get(event_type, []):
            handler(payload)
