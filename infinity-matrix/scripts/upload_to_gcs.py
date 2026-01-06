from google.cloud import storage
import os

def upload_to_gcs(bucket_name, source_folder):
    client = storage.Client()
    bucket = client.bucket(bucket_name)

    for root, _, files in os.walk(source_folder):
        for file in files:
            source_file = os.path.join(root, file)
            destination_blob = os.path.relpath(source_file, source_folder)
            blob = bucket.blob(destination_blob)
            blob.upload_from_filename(source_file)
            print(f"Uploaded {source_file} to {destination_blob}")

if __name__ == "__main__":
    BUCKET_NAME = "your-gcs-bucket-name"
    SOURCE_FOLDER = "./dist"
    upload_to_gcs(BUCKET_NAME, SOURCE_FOLDER)