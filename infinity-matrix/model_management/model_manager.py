class ModelManager:
    def __init__(self):
        self.models = {}
    def register_model(self, name, model):
        self.models[name] = model
    def get_model(self, name):
        return self.models.get(name)
