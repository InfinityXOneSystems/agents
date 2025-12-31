class Simulator:
    def simulate(self, plan: list) -> dict:
        # Simple risk scoring stub
        risk = len(plan) * 0.05
        return {'risk': min(risk, 1.0)}

class ShadowExecutor:
    def execute(self, plan: list):
        # No-op shadow run
        return {'shadow_result': 'ok'}
