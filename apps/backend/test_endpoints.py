import requests
import json
import base64
import os

BASE_URL = "http://localhost:8000"

def test_mentor():
    print("Testing Mentor Endpoint...")
    url = f"{BASE_URL}/api/mentor"
    payload = {
        "messages": [
            {"role": "user", "content": "Hi, who are you and what model are you using?"}
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(data, indent=2))
        print("Mentor endpoint OK!\n")
    except Exception as e:
        print(f"Mentor endpoint failed: {e}\n")

def test_scam_detector_text():
    print("Testing Scam Detector Endpoint (Text only)...")
    url = f"{BASE_URL}/api/scam-detect"
    payload = {
        "text": "URGENT: Your account has been compromised. Click here immediately to verify your identity: http://secure-update-paypal-login.com"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(data, indent=2))
        print("Scam detector text-only OK!\n")
    except Exception as e:
        print(f"Scam detector text-only failed: {e}\n")

if __name__ == "__main__":
    test_mentor()
    test_scam_detector_text()
