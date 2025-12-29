from integrations.workspace.client import WorkspaceClient

class SystemRoadmap:
    def __init__(self):
        self.ws = WorkspaceClient()

    def log_completion(self, title, notes):
        self.ws.create_calendar_event(
            calendar='InfinityX System Log',
            title=title,
            description=notes
        )

    def create_task(self, title, notes):
        self.ws.create_task(
            tasklist='InfinityX Roadmap',
            title=title,
            notes=notes
        )
