class SendGridAgent:
    def send_email(self, to: str, subject: str, body: str):
        print(f'[SENDGRID EMAIL] To={to} | Subject={subject}')
