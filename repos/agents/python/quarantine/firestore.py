from google.cloud import firestore
db = firestore.Client()

def write_telemetry(doc):
    db.collection('telemetry').add(doc)
