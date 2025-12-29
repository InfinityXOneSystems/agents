from integrations.workspace.client import WorkspaceClient

class DriveAgent:
    def create_folder(self, name):
        WorkspaceClient().log('Drive', 'create_folder', name)

class DocsAgent:
    def write_doc(self, title, content):
        WorkspaceClient().log('Docs', 'write', title)

class SheetsAgent:
    def write_sheet(self, name, data):
        WorkspaceClient().log('Sheets', 'write', name)
