import os

SERVICE_NAME = "infinity-xos"

MEMORY_GATEWAY_URL = os.getenv(
    "MEMORY_GATEWAY_URL",
    "https://memory-gateway-896380409704.us-east1.run.app"
)

INTELLIGENCE_DATA_URL = os.getenv(
    "INTELLIGENCE_DATA_URL",
    "https://real-estate-intelligence-data-896380409704.us-east1.run.app"
)

AGENT_SLEEP_SECONDS = int(os.getenv("AGENT_SLEEP_SECONDS", "10"))
