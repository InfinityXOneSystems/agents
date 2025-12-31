import time
from control.gpt_control import GPTControlModule
from integrations.workspace.system_roadmap import SystemRoadmap

class AutonomousDaemon:
    def __init__(self):
        self.gpt = GPTControlModule()
        self.roadmap = SystemRoadmap()

    def cycle(self):
        result = self.gpt.execute(
            'system.health.check',
            {}
        )
        self.roadmap.log_completion(
            'Health Check',
            str(result)
        )

    def start(self):
        while True:
            try:
                self.cycle()
            except Exception as e:
                print('[DAEMON ERROR]', e)
            time.sleep(300)
