#!/usr/bin/env python3
"""
Test different authentication scenarios for the Users endpoint
"""

import requests
import json

BASE_URL = "https://hydrochem-research.preview.emergentagent.com/api"

def test_auth_scenarios():
    """Test various authentication scenarios"""
    print("🔍 TESTING AUTHENTICATION SCENARIOS FOR USERS ENDPOINT")
    print("="*70)
    
    # Test 1: No Authorization header
    print("\n📝 Test 1: No Authorization header")
    response = requests.get(f"{BASE_URL}/admin/users")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 2: Invalid token format
    print("\n📝 Test 2: Invalid token format")
    headers = {'Authorization': 'Bearer invalid-token'}
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 3: Empty Bearer token
    print("\n📝 Test 3: Empty Bearer token")
    headers = {'Authorization': 'Bearer '}
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 4: Malformed Authorization header
    print("\n📝 Test 4: Malformed Authorization header")
    headers = {'Authorization': 'InvalidFormat'}
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Test 5: Valid login but test with regular user (not super admin)
    print("\n📝 Test 5: Login with regular user credentials (if any exist)")
    # This would require creating a regular user first, but let's test the concept
    
    print("\n💡 DIAGNOSIS:")
    print("The 401 Unauthorized errors in the logs suggest that:")
    print("1. Frontend is not sending Authorization header")
    print("2. JWT token is invalid, expired, or malformed")
    print("3. User session has expired")
    print("4. Frontend authentication state is not properly maintained")

if __name__ == "__main__":
    test_auth_scenarios()