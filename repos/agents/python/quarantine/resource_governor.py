class ResourceGovernor:
    def __init__(self, max_jobs_per_hour=100):
        self.max_jobs = max_jobs_per_hour
        self.executed = 0

    def allow(self) -> bool:
        if self.executed >= self.max_jobs:
            return False
        self.executed += 1
        return True

    def reset(self):
        self.executed = 0
