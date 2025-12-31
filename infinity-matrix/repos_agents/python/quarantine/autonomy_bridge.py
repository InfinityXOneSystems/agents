from integrations.google.workspace_client import GoogleWorkspaceClient
from integrations.github.executor import GitHubExecutor

class AutonomyBridge:
    def __init__(self, github_token):
        self.google = GoogleWorkspaceClient()
        self.github = GitHubExecutor(github_token)

    def log(self, message):
        cal = self.google.calendar()
        event = {
            'summary': message,
            'start': {'dateTime': '2025-01-01T00:00:00Z'},
            'end': {'dateTime': '2025-01-01T00:15:00Z'}
        }
        cal.events().insert(calendarId='primary', body=event).execute()
