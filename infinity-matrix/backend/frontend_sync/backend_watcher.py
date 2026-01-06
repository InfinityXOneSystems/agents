"""Backend watcher: notifies frontend of backend changes."""
import os
import time
import threading
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import websocket

BACKEND_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
WS_URL = 'ws://localhost:8766'  # Frontend WebSocket endpoint

class BackendChangeHandler(FileSystemEventHandler):
    def on_any_event(self, event):
        if event.is_directory:
            return
        payload = {
            'event': event.event_type,
            'path': event.src_path,
            'timestamp': time.time()
        }
        try:
            ws = websocket.create_connection(WS_URL)
            ws.send(json.dumps(payload))
            ws.close()
        except Exception as e:
            print(f"[BackendWatcher] WebSocket error: {e}")

def start_backend_watcher():
    observer = Observer()
    event_handler = BackendChangeHandler()
    observer.schedule(event_handler, BACKEND_PATH, recursive=True)
    observer.start()
    print(f"[BackendWatcher] Watching {BACKEND_PATH} for changes...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    start_backend_watcher()
