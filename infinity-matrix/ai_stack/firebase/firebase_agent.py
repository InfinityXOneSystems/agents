class FirebaseAgent:
    def __init__(self):
        pass

    def load_creds(self):
        return {'type': 'service_account', 'project_id': 'mock'}

    def add_document(self, document):
        return 'document_added'