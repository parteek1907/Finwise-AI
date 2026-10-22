import os

project_id = os.getenv("FIREBASE_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT") or "finwise-f5bc5"
os.environ.setdefault("FIREBASE_PROJECT_ID", project_id)
os.environ.setdefault("GOOGLE_CLOUD_PROJECT", project_id)
os.environ.setdefault("GCLOUD_PROJECT", project_id)

import firebase_admin
from firebase_admin import credentials, firestore, auth

def initialize_firebase():
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, options={"projectId": project_id})
        else:
            firebase_admin.initialize_app(options={"projectId": project_id})
    
    try:
        db = firestore.client()
    except Exception as e:
        print(f"Warning: Failed to initialize firestore client. Firebase features will be disabled. Error: {e}")
        db = None
        
    return db, auth

db, firebase_auth = initialize_firebase()
