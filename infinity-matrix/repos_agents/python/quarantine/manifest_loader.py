import yaml

class Manifest:
    def __init__(self, path='system_manifest.yaml'):
        with open(path, 'r') as f:
            self.data = yaml.safe_load(f)

    def enabled(self, path: str) -> bool:
        keys = path.split('.')
        value = self.data
        for k in keys:
            value = value.get(k, {})
        return bool(value)

    def get(self, path: str, default=None):
        keys = path.split('.')
        value = self.data
        for k in keys:
            value = value.get(k, {})
        return value if value else default
