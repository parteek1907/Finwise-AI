import os
import requests
from firebase_admin import auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    FastAPI Dependency to verify Firebase JWT tokens in the Authorization header.
    Returns the decoded token (user info).
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def login_with_email_password(email: str, password: str, api_key: str):
    """
    Uses the Firebase Identity Toolkit REST API to authenticate a user with email/password.
    Returns the idToken and other user data if successful.
    """
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
    payload = {
        "email": email,
        "password": password,
        "returnSecureToken": True
    }
    response = requests.post(url, json=payload)
    data = response.json()
    
    if "error" in data:
        error_message = data["error"].get("message", "Authentication failed")
        raise HTTPException(status_code=401, detail=error_message)
        
    return data
