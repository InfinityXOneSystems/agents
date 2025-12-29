from mcp.github import GitHubBridge
from mcp.vscode import VSCodeBridge
from mcp.google import GoogleBridge

class WorkspaceSyncEngine:
    def __init__(self):
        self.github = GitHubBridge()
        self.vscode = VSCodeBridge()
        self.google = GoogleBridge()

    def sync(self):
        self.github.sync()
        self.vscode.sync()
        self.google.sync()
