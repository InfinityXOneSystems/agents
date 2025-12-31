class TwilioVoiceAgent:
    def call(self, number: str, message: str):
        print(f'[TWILIO CALL] {number}: {message}')

class TwilioSMSAgent:
    def send(self, number: str, message: str):
        print(f'[TWILIO SMS] {number}: {message}')
