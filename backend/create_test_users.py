#!/usr/bin/env python3
"""
Script to create test users in the database via API.
Run this after starting the backend server.

Usage:
    python create_test_users.py
"""

import requests
import json
import sys

API_BASE_URL = "http://localhost:8000/api"

# Test users matching mock data
TEST_USERS = [
    {
        "email": "owner@firm.com",
        "password": "password",
        "full_name": "John Owner",
        "role": "owner"
    },
    {
        "email": "lawyer@firm.com",
        "password": "password",
        "full_name": "Sarah Lawyer",
        "role": "lawyer"
    },
    {
        "email": "assistant@firm.com",
        "password": "password",
        "full_name": "Mike Assistant",
        "role": "assistant"
    }
]

def create_user(user_data):
    """Create a user via the API"""
    url = f"{API_BASE_URL}/auth/register"
    
    try:
        response = requests.post(url, json=user_data)
        
        if response.status_code == 200:
            user = response.json()
            print(f"✅ Created: {user['full_name']} ({user['email']}) - Role: {user['role']}")
            return True
        elif response.status_code == 400:
            error = response.json().get('detail', 'Unknown error')
            if 'already registered' in error.lower():
                print(f"⚠️  Already exists: {user_data['email']} - Skipping")
                return True
            else:
                print(f"❌ Error creating {user_data['email']}: {error}")
                return False
        else:
            print(f"❌ Failed to create {user_data['email']}: {response.status_code} - {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to backend at {API_BASE_URL}")
        print("   Make sure the backend server is running: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("Creating test users...")
    print("=" * 50)
    
    # Check if backend is running
    try:
        health_check = requests.get(f"{API_BASE_URL.replace('/api', '')}/api/health", timeout=2)
        if health_check.status_code != 200:
            print("❌ Backend server is not responding correctly")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server")
        print("\nPlease start the backend first:")
        print("  cd backend")
        print("  source venv/bin/activate")
        print("  uvicorn app.main:app --reload")
        sys.exit(1)
    
    print(f"✅ Backend is running at {API_BASE_URL}\n")
    
    success_count = 0
    for user_data in TEST_USERS:
        if create_user(user_data):
            success_count += 1
    
    print("\n" + "=" * 50)
    print(f"✅ Created {success_count}/{len(TEST_USERS)} users")
    print("\nYou can now login with:")
    print("  - Owner: owner@firm.com / password")
    print("  - Lawyer: lawyer@firm.com / password")
    print("  - Assistant: assistant@firm.com / password")

if __name__ == "__main__":
    main()

