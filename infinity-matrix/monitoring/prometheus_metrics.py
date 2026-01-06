from prometheus_client import start_http_server, Summary
import time

REQUEST_TIME = Summary('request_processing_seconds', 'Time spent processing request')

def start_metrics_server(port=8001):
    start_http_server(port)
    while True:
        time.sleep(10)
