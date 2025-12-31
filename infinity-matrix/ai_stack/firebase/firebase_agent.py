class FirebaseAgent:
    def __init__(self):
        """Initialize Firebase agent - placeholder implementation."""
        pass

    def load_creds(self):
        return {'type': 'service_account', 'project_id': 'mock'}

    def add_document(self, collection: str, data: dict) -> str:
        """Add a document to a collection and return the document ID."""
        return 'doc123'

    def get_documents(self, collection: str) -> list:
        """Retrieve all documents from a collection."""
        return []