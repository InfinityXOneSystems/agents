from googleapiclient.discovery import build
from integrations.google.auth import get_credentials

class CalendarController:
    def __init__(self):
        creds = get_credentials()
        self.service = build('calendar', 'v3', credentials=creds)

    def get_today_events(self):
        return self.service.events().list(
            calendarId='primary',
            singleEvents=True,
            orderBy='startTime'
        ).execute().get('items', [])

    def log_execution(self, summary):
        event = {
            'summary': summary,
            'start': {'dateTime': '2025-01-01T00:00:00Z'},
            'end': {'dateTime': '2025-01-01T00:15:00Z'}
        }
        self.service.events().insert(calendarId='primary', body=event).execute()
