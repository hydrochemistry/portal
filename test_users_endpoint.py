#!/usr/bin/env python3
"""
Focused test for the Users endpoint issue in admin panel
Testing the specific "Error fetching users" issue reported by user
"""

import requests
import json

# Configuration
BASE_URL = "https://hydrochem-portal.preview.emergentagent.com/api"
SUPER_ADMIN_EMAIL = "zaharin@upm.edu.my"
SUPER_ADMIN_PASSWORD = "admin123"

def test_users_endpoint_issue():
    """Test the specific Users endpoint issue reported by user"""
    print("🔍 TESTING USERS ENDPOINT ISSUE")
    print("="*60)
    print("Issue: User gets 'Error fetching users' when clicking Users tab in admin panel")
    print("Expected: Should return list of users successfully")
    print("="*60)
    
    # Step 1: Login as super admin
    print("\n📝 Step 1: Login as super admin")
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        
        print(f"Login Status Code: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_data = login_response.json()
            token = login_data.get('access_token')
            user = login_data.get('user', {})
            
            print(f"✅ Login successful")
            print(f"User ID: {user.get('id')}")
            print(f"User Name: {user.get('name')}")
            print(f"User Email: {user.get('email')}")
            print(f"User Role: {user.get('role')}")
            print(f"User Approved: {user.get('is_approved')}")
            print(f"User Active: {user.get('is_active')}")
            
            # Step 4: Verify the super admin has the correct role
            print(f"\n🔍 Step 4: Verify super admin role")
            expected_role = "super_admin"
            actual_role = user.get('role')
            
            if actual_role == expected_role:
                print(f"✅ User has correct super_admin role: {actual_role}")
            else:
                print(f"❌ ISSUE FOUND: User role is '{actual_role}', expected '{expected_role}'")
                print(f"   This could be the cause of the 'Error fetching users' issue!")
                return
            
            # Step 2: Try to GET /api/admin/users with the super admin token
            print(f"\n📝 Step 2: Test GET /api/admin/users endpoint")
            headers = {'Authorization': f'Bearer {token}'}
            
            try:
                users_response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
                
                print(f"Users Endpoint Status Code: {users_response.status_code}")
                print(f"Users Endpoint Headers: {dict(users_response.headers)}")
                
                # Step 3: Check the response status code and any error messages
                print(f"\n📝 Step 3: Analyze response")
                
                if users_response.status_code == 200:
                    users_data = users_response.json()
                    print(f"✅ SUCCESS: Users endpoint returned successfully")
                    print(f"Number of users returned: {len(users_data)}")
                    
                    # Show first few users (without sensitive data)
                    print(f"\nFirst few users:")
                    for i, user in enumerate(users_data[:3]):
                        print(f"  {i+1}. {user.get('name')} ({user.get('email')}) - Role: {user.get('role')} - Approved: {user.get('is_approved')}")
                    
                    print(f"\n🎉 CONCLUSION: The Users endpoint is working correctly!")
                    print(f"   - Super admin login: ✅ Working")
                    print(f"   - Super admin role: ✅ Correct ({actual_role})")
                    print(f"   - Users endpoint: ✅ Working (returned {len(users_data)} users)")
                    print(f"\n💡 The 'Error fetching users' issue may be:")
                    print(f"   1. A frontend issue (JavaScript error)")
                    print(f"   2. A network connectivity issue")
                    print(f"   3. A temporary issue that has been resolved")
                    print(f"   4. An issue with a different user account")
                    
                elif users_response.status_code == 403:
                    print(f"❌ ISSUE FOUND: 403 Forbidden - Super admin access denied")
                    print(f"Response: {users_response.text}")
                    print(f"\n🔍 DIAGNOSIS:")
                    print(f"   - The user has super_admin role but is still getting 403")
                    print(f"   - This suggests an issue with the get_super_admin_user dependency")
                    print(f"   - Check if the JWT token is being processed correctly")
                    
                elif users_response.status_code == 401:
                    print(f"❌ ISSUE FOUND: 401 Unauthorized - Authentication failed")
                    print(f"Response: {users_response.text}")
                    print(f"\n🔍 DIAGNOSIS:")
                    print(f"   - The JWT token is invalid or expired")
                    print(f"   - Check token generation and validation logic")
                    
                else:
                    print(f"❌ ISSUE FOUND: Unexpected status code {users_response.status_code}")
                    print(f"Response: {users_response.text}")
                    print(f"\n🔍 DIAGNOSIS:")
                    print(f"   - Server error or unexpected response")
                    print(f"   - Check backend logs for more details")
                
            except Exception as e:
                print(f"❌ NETWORK ERROR: Failed to connect to users endpoint")
                print(f"Error: {str(e)}")
                print(f"\n🔍 DIAGNOSIS:")
                print(f"   - Network connectivity issue")
                print(f"   - Backend server may be down")
                print(f"   - Check if backend is running on correct URL")
                
        else:
            print(f"❌ LOGIN FAILED: Status code {login_response.status_code}")
            print(f"Response: {login_response.text}")
            print(f"\n🔍 DIAGNOSIS:")
            print(f"   - Super admin credentials may be incorrect")
            print(f"   - Authentication system may be down")
            print(f"   - Check if super admin user exists in database")
            
    except Exception as e:
        print(f"❌ LOGIN ERROR: Failed to connect to login endpoint")
        print(f"Error: {str(e)}")
        print(f"\n🔍 DIAGNOSIS:")
        print(f"   - Network connectivity issue")
        print(f"   - Backend server may be down")
        print(f"   - Check if backend is running on correct URL: {BASE_URL}")

if __name__ == "__main__":
    test_users_endpoint_issue()