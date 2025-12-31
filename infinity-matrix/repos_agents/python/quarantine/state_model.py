from enum import Enum

class SystemState(str, Enum):
    IDLE = 'idle'
    CRAWLING = 'crawling'
    ANALYZING = 'analyzing'
    EXECUTING = 'executing'
    DEGRADED = 'degraded'
    PAUSED = 'paused'
    EMERGENCY_STOP = 'emergency_stop'
