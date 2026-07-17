"""
Authentication System Tests

Manual test script to verify:
1. User Registration
2. User Login (JWT token generation)
3. Get Current User (protected route)
4. Invalid credentials handling
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"


def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    print(json.dumps(response.json(), indent=2))
    print(f"{'='*60}\n")


def test_authentication_flow():
    """Test complete authentication flow"""
    
    print("\n🚀 Starting Authentication System Tests\n")
    
    # Test data
    test_user = {
        "name": "Test User",
        "email": "test@bharatsathi.ai",
        "password": "Test@12345"
    }
    
    # Test 1: Health Check
    print("Test 1: Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    
    # Test 2: Register User
    print("Test 2: Register New User")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=test_user
    )
    print_response("User Registration", response)
    
    # Test 3: Register Duplicate User (should fail)
    print("Test 3: Register Duplicate User (Expected to Fail)")
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=test_user
    )
    print_response("Duplicate Registration", response)
    
    # Test 4: Login
    print("Test 4: Login with Valid Credentials")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": test_user["email"],
            "password": test_user["password"]
        }
    )
    print_response("User Login", response)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data["access_token"]
        
        # Test 5: Get Current User (Protected Route)
        print("Test 5: Get Current User Info (Protected Route)")
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        print_response("Current User Info", response)
        
        # Test 6: Access Protected Route Without Token (should fail)
        print("Test 6: Access Protected Route Without Token (Expected to Fail)")
        response = requests.get(f"{BASE_URL}/auth/me")
        print_response("No Token Access", response)
        
        # Test 7: Access Protected Route With Invalid Token (should fail)
        print("Test 7: Access Protected Route With Invalid Token (Expected to Fail)")
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        print_response("Invalid Token Access", response)
    
    # Test 8: Login with Wrong Password (should fail)
    print("Test 8: Login with Wrong Password (Expected to Fail)")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": test_user["email"],
            "password": "WrongPassword123"
        }
    )
    print_response("Wrong Password Login", response)
    
    # Test 9: Login with Non-existent Email (should fail)
    print("Test 9: Login with Non-existent Email (Expected to Fail)")
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    print_response("Non-existent User Login", response)
    
    print("\n✅ All Authentication Tests Completed!\n")


if __name__ == "__main__":
    try:
        test_authentication_flow()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the server.")
        print("Make sure the backend server is running on http://127.0.0.1:8000")
        print("\nStart the server with: uvicorn app.main:app --reload")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
