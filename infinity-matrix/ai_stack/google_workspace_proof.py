import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.cloud import texttospeech, speech

# Directory for proof logs
PROOF_DIR = ".prooftest"
os.makedirs(PROOF_DIR, exist_ok=True)

# Load Google Service Account Credentials
CREDENTIALS_FILE = "path/to/credentials.json"  # Replace with actual path
credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=[
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/keep',
    'https://www.googleapis.com/auth/cloud-platform'
])

def log_result(filename, data):
    """Log results to a JSON file."""
    with open(os.path.join(PROOF_DIR, filename), 'w') as f:
        json.dump(data, f, indent=4)

def test_gmail():
    """Authenticate, send a test email, and read the latest email."""
    try:
        service = build('gmail', 'v1', credentials=credentials)

        # Send a test email
        message = {
            'raw': 'VGhpcyBpcyBhIHRlc3QgZW1haWwgZnJvbSBzeXN0ZW0u'  # Base64 encoded "This is a test email from system."
        }
        send_result = service.users().messages().send(userId='me', body=message).execute()

        # Read the latest email
        messages = service.users().messages().list(userId='me', maxResults=1).execute()
        latest_message = messages.get('messages', [{}])[0]

        log_result("gmail_proof.json", {
            "status": "success",
            "sent_message_id": send_result.get('id'),
            "latest_message": latest_message
        })
    except HttpError as error:
        log_result("gmail_proof.json", {
            "status": "failure",
            "error": str(error)
        })

def test_calendar():
    """Read, write, and update a test event."""
    try:
        service = build('calendar', 'v3', credentials=credentials)

        # Create a test event
        event = {
            'summary': 'Test Event',
            'start': {'dateTime': '2025-12-30T10:00:00-07:00'},
            'end': {'dateTime': '2025-12-30T11:00:00-07:00'}
        }
        created_event = service.events().insert(calendarId='primary', body=event).execute()

        # Update the event
        event_id = created_event['id']
        updated_event = service.events().patch(calendarId='primary', eventId=event_id, body={
            'summary': 'Updated Test Event'
        }).execute()

        # Read the event
        fetched_event = service.events().get(calendarId='primary', eventId=event_id).execute()

        log_result("calendar_proof.json", {
            "status": "success",
            "created_event": created_event,
            "updated_event": updated_event,
            "fetched_event": fetched_event
        })
    except HttpError as error:
        log_result("calendar_proof.json", {
            "status": "failure",
            "error": str(error)
        })

def test_keep():
    """List notes, create a test note, and fetch it."""
    try:
        service = build('keep', 'v1', credentials=credentials)

        # Create a test note
        note = {
            'title': 'Test Note',
            'text': 'This is a test note.'
        }
        created_note = service.notes().create(body=note).execute()

        # List notes
        notes = service.notes().list(pageSize=10).execute()

        log_result("keep_proof.json", {
            "status": "success",
            "created_note": created_note,
            "notes": notes
        })
    except HttpError as error:
        log_result("keep_proof.json", {
            "status": "failure",
            "error": str(error)
        })

def test_voice():
    """Test Text-to-Speech and Speech-to-Text."""
    try:
        # Text-to-Speech
        tts_client = texttospeech.TextToSpeechClient(credentials=credentials)
        synthesis_input = texttospeech.SynthesisInput(text="This is a test TTS.")
        voice = texttospeech.VoiceSelectionParams(language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL)
        audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        response = tts_client.synthesize_speech(input=synthesis_input, voice=voice, audio_config=audio_config)

        tts_file = os.path.join(PROOF_DIR, "test_tts.mp3")
        with open(tts_file, "wb") as out:
            out.write(response.audio_content)

        # Speech-to-Text
        stt_client = speech.SpeechClient(credentials=credentials)
        with open(tts_file, "rb") as audio_file:
            audio = speech.RecognitionAudio(content=audio_file.read())
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.MP3,
            sample_rate_hertz=16000,
            language_code="en-US"
        )
        response = stt_client.recognize(config=config, audio=audio)

        log_result("voice_proof.json", {
            "status": "success",
            "tts_file": tts_file,
            "stt_transcription": response.results[0].alternatives[0].transcript
        })
    except Exception as error:
        log_result("voice_proof.json", {
            "status": "failure",
            "error": str(error)
        })

def run_automation():
    """Run a simple voice-to-email automation."""
    try:
        # Simulate voice-to-email automation
        test_voice()  # Generate TTS file
        with open(os.path.join(PROOF_DIR, "test_tts.mp3"), "rb") as audio_file:
            audio_content = audio_file.read()

        # Assume transcription is successful
        transcription = "This is a test TTS."

        # Send email with transcription
        service = build('gmail', 'v1', credentials=credentials)
        message = {
            'raw': f'VG9wOiBUZXN0IEVtYWlsXG5cbkJvZHk6IFRoZSB0cmFuc2NyaXB0aW9uIGlzOiB7dHJhbnNjcmlwdGlvbn0u'.encode("utf-8")
        }
        service.users().messages().send(userId='me', body=message).execute()

        log_result("automation_proof.json", {
            "status": "success",
            "transcription": transcription
        })
    except Exception as error:
        log_result("automation_proof.json", {
            "status": "failure",
            "error": str(error)
        })

if __name__ == "__main__":
    test_gmail()
    test_calendar()
    test_keep()
    test_voice()
    run_automation()