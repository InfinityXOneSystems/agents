from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar"]

creds = service_account.Credentials.from_service_account_file(
    r"C:\Users\JARVIS\AppData\Local\InfinityXOne\CredentialManager\service-account.json",
    scopes=SCOPES,
    subject="info@infinityxonesystems.com"
)

service = build("calendar", "v3", credentials=creds)
events = service.events().list(calendarId="primary", maxResults=1).execute()

print("✅ Calendar access OK")
