#!/usr/bin/env python3
"""
Backend API Testing Suite for Hydrochemistry Research Group Website
Tests the three main features: RIS File Upload, Static Publications Management, 
User Management with Role Assignment, and Featured Publication with Graphical Abstract
"""

import requests
import json
import tempfile
import os
from datetime import datetime

# Configuration
BASE_URL = "https://hydrochem-portal.preview.emergentagent.com/api"
SUPER_ADMIN_EMAIL = "zaharin@upm.edu.my"
SUPER_ADMIN_PASSWORD = "admin123"

class TestResults:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def add_result(self, test_name, passed, message="", details=""):
        self.results.append({
            'test': test_name,
            'passed': passed,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.failed > 0:
            print(f"\n{'='*60}")
            print(f"FAILED TESTS:")
            print(f"{'='*60}")
            for result in self.results:
                if not result['passed']:
                    print(f"❌ {result['test']}")
                    print(f"   Message: {result['message']}")
                    if result['details']:
                        print(f"   Details: {result['details']}")
                    print()

# Global test results
test_results = TestResults()

def create_sample_ris_file():
    """Create a sample RIS file for testing"""
    ris_content = """TY  - JOUR
AU  - Smith, John A.
AU  - Johnson, Mary B.
TI  - Advanced Water Quality Assessment in Tropical Rivers
JO  - Environmental Science & Technology
PY  - 2024
VL  - 58
IS  - 12
SP  - 5234
EP  - 5245
DO  - 10.1021/acs.est.4c01234
AB  - This study presents novel approaches for assessing water quality in tropical river systems using advanced analytical techniques.
KW  - water quality
KW  - tropical rivers
KW  - environmental monitoring
ER  - 

TY  - JOUR
AU  - Brown, Sarah C.
AU  - Davis, Michael R.
TI  - Microplastic Detection in Freshwater Ecosystems
JO  - Water Research
PY  - 2024
VL  - 245
SP  - 120567
DO  - 10.1016/j.watres.2024.120567
AB  - Investigation of microplastic contamination in freshwater systems and its ecological implications.
KW  - microplastics
KW  - freshwater
KW  - contamination
ER  - 

TY  - JOUR
AU  - Wilson, Robert K.
AU  - Taylor, Lisa M.
TI  - Hydrochemical Analysis of Groundwater Systems
JO  - Journal of Hydrology
PY  - 2023
VL  - 612
SP  - 128145
DO  - 10.1016/j.jhydrol.2023.128145
AB  - Comprehensive hydrochemical characterization of regional groundwater systems.
KW  - hydrochemistry
KW  - groundwater
KW  - geochemistry
ER  - 
"""
    
    # Create temporary RIS file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.ris', delete=False) as f:
        f.write(ris_content)
        return f.name

def login_super_admin():
    """Login as super admin and return token"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            user = data.get('user', {})
            test_results.add_result(
                "Super Admin Login", 
                True, 
                f"Successfully logged in as {user.get('name', 'Super Admin')}"
            )
            return token
        else:
            test_results.add_result(
                "Super Admin Login", 
                False, 
                f"Login failed with status {response.status_code}",
                response.text
            )
            return None
    except Exception as e:
        test_results.add_result(
            "Super Admin Login", 
            False, 
            f"Login error: {str(e)}"
        )
        return None

def register_test_user():
    """Register a new test user for testing user management"""
    try:
        test_email = f"testuser_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
        response = requests.post(f"{BASE_URL}/auth/register", json={
            "email": test_email,
            "name": "Test User",
            "password": "testpassword123"
        })
        
        if response.status_code == 200:
            test_results.add_result(
                "Test User Registration", 
                True, 
                f"Successfully registered test user: {test_email}"
            )
            return test_email
        else:
            test_results.add_result(
                "Test User Registration", 
                False, 
                f"Registration failed with status {response.status_code}",
                response.text
            )
            return None
    except Exception as e:
        test_results.add_result(
            "Test User Registration", 
            False, 
            f"Registration error: {str(e)}"
        )
        return None

def test_ris_file_upload(token):
    """Test RIS file upload functionality"""
    print("\n🧪 Testing RIS File Upload Feature...")
    
    # Create sample RIS file
    ris_file_path = create_sample_ris_file()
    
    try:
        # Test valid RIS file upload
        with open(ris_file_path, 'rb') as f:
            files = {'file': ('test_publications.ris', f, 'application/x-research-info-systems')}
            headers = {'Authorization': f'Bearer {token}'}
            
            response = requests.post(f"{BASE_URL}/upload/ris", files=files, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', '')
                test_results.add_result(
                    "RIS File Upload - Valid File", 
                    True, 
                    f"Upload successful: {message}"
                )
            else:
                test_results.add_result(
                    "RIS File Upload - Valid File", 
                    False, 
                    f"Upload failed with status {response.status_code}",
                    response.text
                )
        
        # Test duplicate upload (should skip duplicates)
        with open(ris_file_path, 'rb') as f:
            files = {'file': ('test_publications.ris', f, 'application/x-research-info-systems')}
            headers = {'Authorization': f'Bearer {token}'}
            
            response = requests.post(f"{BASE_URL}/upload/ris", files=files, headers=headers)
            
            if response.status_code == 200:
                test_results.add_result(
                    "RIS File Upload - Duplicate Handling", 
                    True, 
                    "Duplicate upload handled correctly"
                )
            else:
                test_results.add_result(
                    "RIS File Upload - Duplicate Handling", 
                    False, 
                    f"Duplicate upload failed with status {response.status_code}",
                    response.text
                )
        
        # Test invalid file upload (non-RIS file)
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("This is not a RIS file")
            invalid_file_path = f.name
        
        try:
            with open(invalid_file_path, 'rb') as f:
                files = {'file': ('invalid.txt', f, 'text/plain')}
                headers = {'Authorization': f'Bearer {token}'}
                
                response = requests.post(f"{BASE_URL}/upload/ris", files=files, headers=headers)
                
                if response.status_code == 400:
                    test_results.add_result(
                        "RIS File Upload - Invalid File Rejection", 
                        True, 
                        "Invalid file correctly rejected with 400 error"
                    )
                else:
                    test_results.add_result(
                        "RIS File Upload - Invalid File Rejection", 
                        False, 
                        f"Invalid file not rejected properly, got status {response.status_code}",
                        response.text
                    )
        finally:
            os.unlink(invalid_file_path)
        
        # Test unauthorized access
        response = requests.post(f"{BASE_URL}/upload/ris", files={'file': ('test.ris', b'test', 'application/x-research-info-systems')})
        
        if response.status_code == 401:
            test_results.add_result(
                "RIS File Upload - Auth Required", 
                True, 
                "Unauthorized access correctly rejected with 401"
            )
        else:
            test_results.add_result(
                "RIS File Upload - Auth Required", 
                False, 
                f"Unauthorized access not rejected properly, got status {response.status_code}",
                response.text
            )
            
    except Exception as e:
        test_results.add_result(
            "RIS File Upload - Exception", 
            False, 
            f"Upload test error: {str(e)}"
        )
    finally:
        # Clean up
        if os.path.exists(ris_file_path):
            os.unlink(ris_file_path)

def test_static_publications_management(token):
    """Test static publications retrieval and deletion"""
    print("\n🧪 Testing Static Publications Management...")
    
    try:
        # Test GET static publications
        response = requests.get(f"{BASE_URL}/static-publications")
        
        if response.status_code == 200:
            publications = response.json()
            test_results.add_result(
                "Static Publications - GET (Public)", 
                True, 
                f"Retrieved {len(publications)} publications successfully"
            )
            
            # Check if publications are sorted by year (descending)
            if len(publications) > 1:
                years = [pub.get('year', 0) for pub in publications]
                is_sorted = all(years[i] >= years[i+1] for i in range(len(years)-1))
                test_results.add_result(
                    "Static Publications - Year Sorting", 
                    is_sorted, 
                    "Publications sorted by year (descending)" if is_sorted else "Publications not properly sorted by year"
                )
            
            # Test DELETE functionality if publications exist
            if publications:
                pub_to_delete = publications[0]
                pub_id = pub_to_delete.get('id')
                
                if pub_id:
                    # Test DELETE with auth
                    headers = {'Authorization': f'Bearer {token}'}
                    response = requests.delete(f"{BASE_URL}/admin/static-publications/{pub_id}", headers=headers)
                    
                    if response.status_code == 200:
                        test_results.add_result(
                            "Static Publications - DELETE (Authorized)", 
                            True, 
                            f"Successfully deleted publication: {pub_to_delete.get('title', 'Unknown')[:50]}..."
                        )
                        
                        # Verify publication was removed
                        response = requests.get(f"{BASE_URL}/static-publications")
                        if response.status_code == 200:
                            updated_publications = response.json()
                            deleted_ids = [p.get('id') for p in updated_publications]
                            if pub_id not in deleted_ids:
                                test_results.add_result(
                                    "Static Publications - DELETE Verification", 
                                    True, 
                                    "Publication successfully removed from list"
                                )
                            else:
                                test_results.add_result(
                                    "Static Publications - DELETE Verification", 
                                    False, 
                                    "Publication still appears in list after deletion"
                                )
                    else:
                        test_results.add_result(
                            "Static Publications - DELETE (Authorized)", 
                            False, 
                            f"Delete failed with status {response.status_code}",
                            response.text
                        )
                    
                    # Test DELETE without auth
                    response = requests.delete(f"{BASE_URL}/admin/static-publications/{pub_id}")
                    
                    if response.status_code == 401:
                        test_results.add_result(
                            "Static Publications - DELETE (Unauthorized)", 
                            True, 
                            "Unauthorized delete correctly rejected with 401"
                        )
                    else:
                        test_results.add_result(
                            "Static Publications - DELETE (Unauthorized)", 
                            False, 
                            f"Unauthorized delete not rejected properly, got status {response.status_code}",
                            response.text
                        )
                
                # Test DELETE non-existent publication
                fake_id = "non-existent-publication-id"
                headers = {'Authorization': f'Bearer {token}'}
                response = requests.delete(f"{BASE_URL}/admin/static-publications/{fake_id}", headers=headers)
                
                if response.status_code == 404:
                    test_results.add_result(
                        "Static Publications - DELETE Non-existent", 
                        True, 
                        "Non-existent publication correctly returns 404"
                    )
                else:
                    test_results.add_result(
                        "Static Publications - DELETE Non-existent", 
                        False, 
                        f"Non-existent publication delete returned status {response.status_code}",
                        response.text
                    )
            
        else:
            test_results.add_result(
                "Static Publications - GET (Public)", 
                False, 
                f"GET failed with status {response.status_code}",
                response.text
            )
            
    except Exception as e:
        test_results.add_result(
            "Static Publications - Exception", 
            False, 
            f"Static publications test error: {str(e)}"
        )

def test_user_management(token, test_user_email):
    """Test user management with role assignment"""
    print("\n🧪 Testing User Management with Role Assignment...")
    
    try:
        # Test GET all users (super admin only)
        headers = {'Authorization': f'Bearer {token}'}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
        
        if response.status_code == 200:
            users = response.json()
            test_results.add_result(
                "User Management - GET Users (Super Admin)", 
                True, 
                f"Retrieved {len(users)} users successfully"
            )
            
            # Find the test user
            test_user = None
            for user in users:
                if user.get('email') == test_user_email:
                    test_user = user
                    break
            
            if test_user:
                user_id = test_user.get('id')
                
                # Verify user is in pending state
                if not test_user.get('is_approved', True):
                    test_results.add_result(
                        "User Management - Pending State Verification", 
                        True, 
                        "New user correctly in pending state"
                    )
                else:
                    test_results.add_result(
                        "User Management - Pending State Verification", 
                        False, 
                        "New user should be in pending state but is already approved"
                    )
                
                # Test user approval
                response = requests.post(f"{BASE_URL}/admin/users/{user_id}/approve", headers=headers)
                
                if response.status_code == 200:
                    test_results.add_result(
                        "User Management - User Approval", 
                        True, 
                        "User approved successfully"
                    )
                    
                    # Test role change from 'user' to 'admin'
                    response = requests.post(f"{BASE_URL}/admin/users/{user_id}/role?role=admin", headers=headers)
                    
                    if response.status_code == 200:
                        test_results.add_result(
                            "User Management - Role Change to Admin", 
                            True, 
                            "User role changed to admin successfully"
                        )
                        
                        # Verify role change took effect
                        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
                        if response.status_code == 200:
                            updated_users = response.json()
                            updated_user = None
                            for user in updated_users:
                                if user.get('id') == user_id:
                                    updated_user = user
                                    break
                            
                            if updated_user and updated_user.get('role') == 'admin':
                                test_results.add_result(
                                    "User Management - Role Change Verification", 
                                    True, 
                                    "Role change verified successfully"
                                )
                            else:
                                test_results.add_result(
                                    "User Management - Role Change Verification", 
                                    False, 
                                    f"Role change not reflected, current role: {updated_user.get('role') if updated_user else 'user not found'}"
                                )
                    else:
                        test_results.add_result(
                            "User Management - Role Change to Admin", 
                            False, 
                            f"Role change failed with status {response.status_code}",
                            response.text
                        )
                    
                    # Test invalid role assignment
                    response = requests.post(f"{BASE_URL}/admin/users/{user_id}/role?role=invalid_role", headers=headers)
                    
                    if response.status_code == 400:
                        test_results.add_result(
                            "User Management - Invalid Role Rejection", 
                            True, 
                            "Invalid role correctly rejected with 400"
                        )
                    else:
                        test_results.add_result(
                            "User Management - Invalid Role Rejection", 
                            False, 
                            f"Invalid role not rejected properly, got status {response.status_code}",
                            response.text
                        )
                        
                else:
                    test_results.add_result(
                        "User Management - User Approval", 
                        False, 
                        f"User approval failed with status {response.status_code}",
                        response.text
                    )
                
                # Test non-existent user operations
                fake_user_id = "non-existent-user-id"
                response = requests.post(f"{BASE_URL}/admin/users/{fake_user_id}/approve", headers=headers)
                
                if response.status_code == 404:
                    test_results.add_result(
                        "User Management - Non-existent User Approval", 
                        True, 
                        "Non-existent user approval correctly returns 404"
                    )
                else:
                    test_results.add_result(
                        "User Management - Non-existent User Approval", 
                        False, 
                        f"Non-existent user approval returned status {response.status_code}",
                        response.text
                    )
            else:
                test_results.add_result(
                    "User Management - Test User Not Found", 
                    False, 
                    f"Test user {test_user_email} not found in users list"
                )
                
        else:
            test_results.add_result(
                "User Management - GET Users (Super Admin)", 
                False, 
                f"GET users failed with status {response.status_code}",
                response.text
            )
        
        # Test unauthorized access to user management endpoints
        response = requests.get(f"{BASE_URL}/admin/users")
        
        if response.status_code == 401:
            test_results.add_result(
                "User Management - Unauthorized Access", 
                True, 
                "Unauthorized access to user management correctly rejected with 401"
            )
        else:
            test_results.add_result(
                "User Management - Unauthorized Access", 
                False, 
                f"Unauthorized access not rejected properly, got status {response.status_code}",
                response.text
            )
            
    except Exception as e:
        test_results.add_result(
            "User Management - Exception", 
            False, 
            f"User management test error: {str(e)}"
        )

def test_featured_publication_with_graphical_abstract(token):
    """Test featured publication with graphical abstract functionality"""
    print("\n🧪 Testing Featured Publication with Graphical Abstract...")
    
    try:
        # Test GET current featured publication (public endpoint)
        response = requests.get(f"{BASE_URL}/featured-publication")
        
        if response.status_code == 200:
            current_featured = response.json()
            test_results.add_result(
                "Featured Publication - GET (Public)", 
                True, 
                f"Retrieved featured publication: {current_featured.get('title', 'Unknown')[:50]}..." if current_featured else "No featured publication set"
            )
        else:
            test_results.add_result(
                "Featured Publication - GET (Public)", 
                False, 
                f"GET featured publication failed with status {response.status_code}",
                response.text
            )
        
        # Test POST new featured publication with graphical abstract
        headers = {'Authorization': f'Bearer {token}'}
        new_featured_pub = {
            "publication_id": "test-pub-id-123",
            "title": "Test Featured Publication with Graphical Abstract",
            "authors": "Dr. Test Author, Prof. Example Researcher",
            "journal": "Test Journal of Environmental Science",
            "year": 2024,
            "doi": "10.1000/test.2024.123456",
            "citations": 15,
            "graphical_abstract": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A=",
            "is_active": True
        }
        
        response = requests.post(f"{BASE_URL}/admin/featured-publication", json=new_featured_pub, headers=headers)
        
        if response.status_code == 200:
            test_results.add_result(
                "Featured Publication - POST with Graphical Abstract", 
                True, 
                "Featured publication with graphical abstract created successfully"
            )
            
            # Verify old featured publication is deactivated and new one is active
            response = requests.get(f"{BASE_URL}/featured-publication")
            if response.status_code == 200:
                updated_featured = response.json()
                if updated_featured and updated_featured.get('title') == new_featured_pub['title']:
                    test_results.add_result(
                        "Featured Publication - Activation Verification", 
                        True, 
                        "New featured publication is now active"
                    )
                    
                    # Check if graphical abstract is included
                    if updated_featured.get('graphical_abstract'):
                        test_results.add_result(
                            "Featured Publication - Graphical Abstract Inclusion", 
                            True, 
                            "Graphical abstract included in response"
                        )
                    else:
                        test_results.add_result(
                            "Featured Publication - Graphical Abstract Inclusion", 
                            False, 
                            "Graphical abstract not included in response"
                        )
                else:
                    test_results.add_result(
                        "Featured Publication - Activation Verification", 
                        False, 
                        "New featured publication not activated properly"
                    )
        else:
            test_results.add_result(
                "Featured Publication - POST with Graphical Abstract", 
                False, 
                f"Featured publication creation failed with status {response.status_code}",
                response.text
            )
        
        # Test unauthorized access to admin endpoint
        response = requests.post(f"{BASE_URL}/admin/featured-publication", json=new_featured_pub)
        
        if response.status_code == 401:
            test_results.add_result(
                "Featured Publication - Admin Auth Required", 
                True, 
                "Unauthorized access to admin endpoint correctly rejected with 401"
            )
        else:
            test_results.add_result(
                "Featured Publication - Admin Auth Required", 
                False, 
                f"Unauthorized access not rejected properly, got status {response.status_code}",
                response.text
            )
            
    except Exception as e:
        test_results.add_result(
            "Featured Publication - Exception", 
            False, 
            f"Featured publication test error: {str(e)}"
        )

def test_scopus_api_integration():
    """Test Scopus API integration for publications endpoint"""
    print("\n🧪 Testing Scopus API Integration...")
    
    try:
        # Test GET publications endpoint (public endpoint)
        response = requests.get(f"{BASE_URL}/publications")
        
        if response.status_code == 200:
            publications = response.json()
            test_results.add_result(
                "Scopus API - GET Publications (Status)", 
                True, 
                f"Successfully retrieved {len(publications)} publications"
            )
            
            # Check if exactly 10 publications are returned by default
            if len(publications) == 10:
                test_results.add_result(
                    "Scopus API - Default Count (10)", 
                    True, 
                    "Exactly 10 publications returned by default"
                )
            else:
                test_results.add_result(
                    "Scopus API - Default Count (10)", 
                    False, 
                    f"Expected 10 publications, got {len(publications)}"
                )
            
            if publications:
                # Check data structure - verify required fields
                first_pub = publications[0]
                required_fields = ['title', 'authors', 'journal', 'year', 'doi', 'citations', 'scopus_id']
                missing_fields = []
                
                for field in required_fields:
                    if field not in first_pub:
                        missing_fields.append(field)
                
                if not missing_fields:
                    test_results.add_result(
                        "Scopus API - Data Structure Validation", 
                        True, 
                        "All required fields present in publication data"
                    )
                else:
                    test_results.add_result(
                        "Scopus API - Data Structure Validation", 
                        False, 
                        f"Missing required fields: {', '.join(missing_fields)}"
                    )
                
                # Check if publications are sorted by year (descending - most recent first)
                years = [pub.get('year', 0) for pub in publications if pub.get('year')]
                if len(years) > 1:
                    is_sorted_desc = all(years[i] >= years[i+1] for i in range(len(years)-1))
                    test_results.add_result(
                        "Scopus API - Year Sorting (Descending)", 
                        is_sorted_desc, 
                        f"Publications sorted by year: {years[:5]}..." if is_sorted_desc else f"Publications NOT properly sorted by year: {years[:5]}..."
                    )
                
                # Check if this is real Scopus data (not mock data)
                # Mock data has specific titles like "Novel approaches for microplastic quantification..."
                mock_indicators = [
                    "Novel approaches for microplastic quantification",
                    "Microplastics and emerging contaminants in Selangor River Basin",
                    "Hydrochemical characterization and water quality assessment"
                ]
                
                is_mock_data = False
                for pub in publications[:3]:  # Check first 3 publications
                    title = pub.get('title', '')
                    for mock_title in mock_indicators:
                        if mock_title in title:
                            is_mock_data = True
                            break
                    if is_mock_data:
                        break
                
                if not is_mock_data:
                    test_results.add_result(
                        "Scopus API - Real Data Verification", 
                        True, 
                        "Publications appear to be real Scopus data (not mock data)"
                    )
                else:
                    test_results.add_result(
                        "Scopus API - Real Data Verification", 
                        False, 
                        "Publications appear to be mock data, not real Scopus API data"
                    )
                
                # Check if Scopus API key is being used
                # We can infer this by checking if the data looks like real API responses
                has_scopus_ids = all(pub.get('scopus_id') for pub in publications[:3])
                has_realistic_citations = any(pub.get('citations', 0) > 0 for pub in publications[:3])
                has_dois = any(pub.get('doi') for pub in publications[:3])
                
                api_indicators = sum([has_scopus_ids, has_realistic_citations, has_dois])
                
                if api_indicators >= 2:
                    test_results.add_result(
                        "Scopus API - API Key Usage", 
                        True, 
                        "Data characteristics suggest real Scopus API is being used"
                    )
                else:
                    test_results.add_result(
                        "Scopus API - API Key Usage", 
                        False, 
                        "Data characteristics suggest mock data or API not working properly"
                    )
                
                # Test with custom limit parameter
                response_limit = requests.get(f"{BASE_URL}/publications?limit=5")
                if response_limit.status_code == 200:
                    limited_pubs = response_limit.json()
                    if len(limited_pubs) == 5:
                        test_results.add_result(
                            "Scopus API - Custom Limit Parameter", 
                            True, 
                            "Custom limit parameter works correctly"
                        )
                    else:
                        test_results.add_result(
                            "Scopus API - Custom Limit Parameter", 
                            False, 
                            f"Expected 5 publications with limit=5, got {len(limited_pubs)}"
                        )
                else:
                    test_results.add_result(
                        "Scopus API - Custom Limit Parameter", 
                        False, 
                        f"Custom limit request failed with status {response_limit.status_code}"
                    )
                
                # Display sample publication data for verification
                sample_pub = publications[0]
                sample_info = f"Title: {sample_pub.get('title', 'N/A')[:60]}..., Year: {sample_pub.get('year', 'N/A')}, Citations: {sample_pub.get('citations', 'N/A')}"
                test_results.add_result(
                    "Scopus API - Sample Publication Data", 
                    True, 
                    sample_info
                )
                
            else:
                test_results.add_result(
                    "Scopus API - Publications Data", 
                    False, 
                    "No publications returned from API"
                )
                
        else:
            test_results.add_result(
                "Scopus API - GET Publications (Status)", 
                False, 
                f"GET publications failed with status {response.status_code}",
                response.text
            )
            
    except Exception as e:
        test_results.add_result(
            "Scopus API - Exception", 
            False, 
            f"Scopus API test error: {str(e)}"
        )

def main():
    """Main test execution function"""
    print("🚀 Starting Backend API Testing Suite for Hydrochemistry Research Group")
    print(f"Testing against: {BASE_URL}")
    print("="*80)
    
    # Step 1: Test Scopus API Integration (NEW TEST)
    test_scopus_api_integration()
    
    # Step 2: Login as super admin
    token = login_super_admin()
    if not token:
        print("❌ Cannot proceed without super admin authentication")
        test_results.print_summary()
        return
    
    # Step 3: Register test user for user management testing
    test_user_email = register_test_user()
    
    # Step 4: Run all tests
    test_ris_file_upload(token)
    test_static_publications_management(token)
    
    if test_user_email:
        test_user_management(token, test_user_email)
    else:
        test_results.add_result(
            "User Management - Skipped", 
            False, 
            "Skipped user management tests due to registration failure"
        )
    
    test_featured_publication_with_graphical_abstract(token)
    
    # Step 5: Print comprehensive results
    test_results.print_summary()
    
    print(f"\n{'='*60}")
    print(f"DETAILED TEST RESULTS:")
    print(f"{'='*60}")
    for result in test_results.results:
        status = "✅ PASS" if result['passed'] else "❌ FAIL"
        print(f"{status} {result['test']}")
        if result['message']:
            print(f"    📝 {result['message']}")
        if result['details'] and not result['passed']:
            print(f"    🔍 {result['details'][:200]}...")
        print()

if __name__ == "__main__":
    main()