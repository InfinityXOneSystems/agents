class GPTAutonomy:
    def __init__(self, plugin):
        self.plugin = plugin

    def allowed(self, action: str) -> bool:
        return action in self.plugin.get('permissions', {}).get('gpt_can', [])

    def needs_approval(self, action: str) -> bool:
        return action in self.plugin.get('permissions', {}).get('requires_approval', [])
