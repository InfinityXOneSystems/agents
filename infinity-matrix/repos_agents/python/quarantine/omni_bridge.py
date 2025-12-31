class OmniBridge:
    def route(self, source, target, payload):
        print(f'[OMNI ROUTER] {source} -> {target}')
        return payload
