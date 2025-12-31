class GoogleCloudAgent:
    def __init__(self):
        """Initialize Google Cloud agent - placeholder implementation."""
        pass

    def load_creds(self):
        return {'type': 'service_account', 'project_id': 'mock'}

    def upload_to_bucket(self, bucket_name: str, source_file: str, dest_file: str) -> str:
        """Upload a file to a GCS bucket."""
        url = f'https://storage.googleapis.com/{bucket_name}/{dest_file}'
        print(f"Uploaded {source_file} to {bucket_name}/{dest_file}")
        return url