class PlannerCore:
    def plan(self, forecast: dict):
        return [{'action': 'execute_strategy', 'payload': forecast}]
