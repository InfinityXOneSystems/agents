"""Live frontend watcher and sync module."""
import os
import time
import threading
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import websocket

FRONTEND_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend'))
WS_URL = 'ws://localhost:8765'  # Backend WebSocket endpoint

class FrontendChangeHandler(FileSystemEventHandler):
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
            print(f"[Watcher] WebSocket error: {e}")

def start_watcher():
    observer = Observer()
    event_handler = FrontendChangeHandler()
    observer.schedule(event_handler, FRONTEND_PATH, recursive=True)
    observer.start()
    print(f"[Watcher] Watching {FRONTEND_PATH} for changes...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    start_watcher()
