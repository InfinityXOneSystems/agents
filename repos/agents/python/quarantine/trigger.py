from autobuilder.builder import AutoBuilder

class AutoBuilderTrigger:
    def __init__(self):
        self.builder = AutoBuilder()

    def evaluate(self, forecast: dict):
        if forecast.get('vertex_confidence', 0) > 0.75:
            self.builder.build_from_signal(forecast)
