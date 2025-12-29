import threading
import time

def crawl_task(criteria, sink):
    time.sleep(1)
    return {'criteria':criteria,'stored_to':sink}

def run_parallel(criteria:list, sinks:list):
    results = []
    threads = []

    for c in criteria:
        for s in sinks:
            t = threading.Thread(
                target=lambda: results.append(crawl_task(c,s))
            )
            threads.append(t)
            t.start()

    for t in threads:
        t.join()

    return results
