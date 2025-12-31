from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/script.projects'
]

class GoogleWorkspaceClient:
    def __init__(self, creds_path='secrets/credentials.json'):
        self.creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )

    def gmail(self): return build('gmail','v1',credentials=self.creds)
    def calendar(self): return build('calendar','v3',credentials=self.creds)
    def tasks(self): return build('tasks','v1',credentials=self.creds)
    def drive(self): return build('drive','v3',credentials=self.creds)
    def docs(self): return build('docs','v1',credentials=self.creds)
    def sheets(self): return build('sheets','v4',credentials=self.creds)
    def script(self): return build('script','v1',credentials=self.creds)
