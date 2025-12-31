class GoogleCloudAgent:
    def __init__(self):
        pass

    def load_creds(self):
        return {'type': 'service_account', 'project_id': 'mock'}

    def upload_to_bucket(self, file):
        return 'file_uploaded'