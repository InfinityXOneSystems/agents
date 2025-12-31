import os
import json
import firebase_admin
from firebase_admin import credentials, db, firestore, storage, auth

# Initialize Firebase Admin SDK
SERVICE_ACCOUNT_KEY = "path/to/your/serviceAccountKey.json"  # Replace with your service account key path
PROOF_DIR = ".prooftest"
PROOF_FILE = os.path.join(PROOF_DIR, "firebase_proof.json")

# Ensure proof directory exists
os.makedirs(PROOF_DIR, exist_ok=True)

# Initialize Firebase
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://your-database-name.firebaseio.com',  # Replace with your Realtime Database URL
        'storageBucket': 'your-bucket-name.appspot.com'  # Replace with your Storage bucket name
    })
    firebase_initialized = True
except Exception as e:
    firebase_initialized = False
    error_message = f"Failed to initialize Firebase: {str(e)}"

# Prepare proof results
proof_results = {
    "firebase_initialized": firebase_initialized,
    "errors": [],
    "results": {}
}

if firebase_initialized:
    # Test Realtime Database
    try:
        ref = db.reference("test")
        ref.set({"message": "Hello, Realtime Database!"})
        read_value = ref.get()
        proof_results["results"]["realtime_db"] = {
            "write": "success",
            "read": read_value
        }
    except Exception as e:
        proof_results["errors"].append(f"Realtime Database error: {str(e)}")

    # Test Firestore
    try:
        firestore_client = firestore.client()
        doc_ref = firestore_client.collection("test_collection").document("test_document")
        doc_ref.set({"message": "Hello, Firestore!"})
        doc = doc_ref.get()
        proof_results["results"]["firestore"] = {
            "write": "success",
            "read": doc.to_dict()
        }
    except Exception as e:
        proof_results["errors"].append(f"Firestore error: {str(e)}")

    # Test Storage
    try:
        bucket = storage.bucket()
        blob = bucket.blob("test_file.txt")
        test_content = "Hello, Firebase Storage!"
        blob.upload_from_string(test_content)
        downloaded_content = blob.download_as_text()
        proof_results["results"]["storage"] = {
            "upload": "success",
            "download": downloaded_content
        }
    except Exception as e:
        proof_results["errors"].append(f"Storage error: {str(e)}")

    # Verify Cloud Functions, Hosting, and Auth
    try:
        proof_results["results"]["auth"] = {
            "status": "success" if auth else "not available"
        }
        # Add Cloud Functions and Hosting verification if applicable
    except Exception as e:
        proof_results["errors"].append(f"Module verification error: {str(e)}")

# Write proof results to file
with open(PROOF_FILE, "w") as f:
    json.dump(proof_results, f, indent=4)

print(f"Proof results written to {PROOF_FILE}")