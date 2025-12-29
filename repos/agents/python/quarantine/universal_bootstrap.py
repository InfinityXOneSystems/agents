import os
import time
import traceback
import importlib.util
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = Path(__file__).parent.resolve()

AGENT_ROOTS = [
    "agent","agent_market","analysis","api_agents","autobuilder",
    "blockchain","cognition","crawler","crypto","debate",
    "decomposer","executor","finance_agents","llm","planner",
    "predictor","reflection","scheduler","spawner","tasks",
    "thoughts","vision","vision_cortex","runbooks","seeds"
]

IGNORE = {"__init__.py","__pycache__"}
REGISTRY = {}

def discover():
    files = []
    for root in AGENT_ROOTS:
        p = BASE_DIR / root
        if not p.exists():
            continue
        for f in p.rglob("*.py"):
            if f.name not in IGNORE:
                files.append(f)
    return files

def load(path):
    name = str(path.relative_to(BASE_DIR)).replace("\\",".").replace("/",".").replace(".py","")
    try:
        spec = importlib.util.spec_from_file_location(name, path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return name, mod
    except Exception:
        print("[LOAD ERROR]", name)
        traceback.print_exc()
        return None, None

def register():
    for p in discover():
        name, mod = load(p)
        if not mod:
            continue
        for attr in dir(mod):
            if attr in ("run","start","loop"):
                fn = getattr(mod, attr)
                if callable(fn):
                    REGISTRY[f"{name}.{attr}"] = fn
    print("[REGISTRY]", len(REGISTRY), "agents registered")

def run_agent(name, fn):
    print("[AGENT START]", name)
    try:
        fn()
    except Exception:
        print("[AGENT CRASH]", name)
        traceback.print_exc()

def launch():
    workers = max(8, os.cpu_count() * 4)
    with ThreadPoolExecutor(workers) as pool:
        futures = {pool.submit(run_agent, n, f): n for n,f in REGISTRY.items()}
        for f in as_completed(futures):
            pass

def supervisor():
    while True:
        try:
            register()
            launch()
        except Exception:
            print("[SUPERVISOR ERROR]")
            traceback.print_exc()
        time.sleep(10)

if __name__ == "__main__":
    print("INFINITY XOS — UNIVERSAL PARALLEL AGENT BOOTSTRAP")
    print("BASE:", BASE_DIR)
    supervisor()
