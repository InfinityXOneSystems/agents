from fastapi import HTTPException
from datetime import datetime
from googleapiclient.discovery import build
from google.oauth2 import service_account
import os

def calendar_gate(tag: str):
    creds = service_account.Credentials.from_service_account_file(
        os.getenv("GOOGLE_APPLICATION_CREDENTIALS"),
        scopes=["https://www.googleapis.com/auth/calendar.readonly"]
    )
    service = build("calendar", "v3", credentials=creds)
    now = datetime.utcnow().isoformat() + "Z"

    events = service.events().list(
        calendarId="primary",
        timeMin=now,
        q=tag,
        maxResults=1,
        singleEvents=True
    ).execute()

    if not events.get("items"):
        raise HTTPException(status_code=403, detail="Calendar Gate Closed")
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    return {"ready": True}
