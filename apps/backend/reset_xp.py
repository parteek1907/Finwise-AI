import os
import sys

# Add current directory to path so we can import firebase_config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv(".env.local")

from firebase_config import db
from firebase_admin import auth

def reset_all_users():
    try:
        print("Fetching all users from Firebase Auth...")
        # Get all users (handling pagination automatically via list_users)
        users = []
        page = auth.list_users()
        while page:
            users.extend(page.users)
            page = page.get_next_page()
            
        print(f"Found {len(users)} users. Resetting XP and Level to 0...")
        
        batch = db.batch()
        batch_count = 0
        total_updated = 0
        
        for user in users:
            uid = user.uid
            email = user.email
            
            doc_ref = db.collection("users").document(uid)
            
            # Using merge=True so we don't overwrite other fields if they exist
            batch.set(doc_ref, {
                "email": email,
                "xp": 0,
                "level": 0
            }, merge=True)
            
            batch_count += 1
            
            # Firestore batches support up to 500 operations
            if batch_count == 500:
                batch.commit()
                total_updated += batch_count
                print(f"Committed {total_updated} users...")
                batch = db.batch()
                batch_count = 0
                
        # Commit any remaining in the batch
        if batch_count > 0:
            batch.commit()
            total_updated += batch_count
            
        print(f"Successfully reset XP and Level to 0 for {total_updated} users!")
        
    except Exception as e:
        print(f"Error resetting users: {e}")

if __name__ == "__main__":
    reset_all_users()
