def write_memory(entry):
    firestore.collection('canonical_memory').add(entry)
