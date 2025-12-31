from integrations.workspace.client import WorkspaceClient

class KeepAgent:
    def write(self, note):
        WorkspaceClient().log('Keep', 'write', note)
