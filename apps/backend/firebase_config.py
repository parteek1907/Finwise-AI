import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

def initialize_firebase():
    if not firebase_admin._apps:
        # In production, use the service account credentials path from an environment variable.
        # For local development, it will look for FIREBASE_CREDENTIALS path.
        cred_path = os.getenv("FIREBASE_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            # Fallback if no credentials provided (mock mode or application default credentials)
            print("Warning: Firebase credentials not found. Initializing without explicit certificate.")
            firebase_admin.initialize_app()
    
    db = firestore.client()
    return db, auth

db, firebase_auth = initialize_firebase()
