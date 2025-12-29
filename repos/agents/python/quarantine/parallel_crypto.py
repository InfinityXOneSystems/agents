import threading
from predictor.market import predict

def start_parallel_crypto():
    def run():
        predict({'domain':'crypto'})
    threading.Thread(target=run, daemon=True).start()
