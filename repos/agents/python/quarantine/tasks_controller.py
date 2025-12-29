from googleapiclient.discovery import build
from integrations.google.auth import get_credentials

class TaskController:
    def __init__(self):
        creds = get_credentials()
        self.service = build('tasks', 'v1', credentials=creds)

    def list_tasks(self):
        return self.service.tasks().list(tasklist='@default').execute().get('items', [])

    def complete_task(self, task_id):
        self.service.tasks().update(
            tasklist='@default',
            task=task_id,
            body={'status':'completed'}
        ).execute()
