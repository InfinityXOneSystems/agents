class AIBrainRegistry:
    def __init__(self):
        self.brains = {}

    def register(self, name, brain):
        self.brains[name] = brain

    def get(self, name):
        return self.brains.get(name)
