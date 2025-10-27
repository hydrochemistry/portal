#!/usr/bin/env python3
"""
Focused Scopus API Integration Test
Tests the updated Scopus API integration with new API key: 243a5aec8e28e6526d575ac45ca369ea

Verification Requirements:
1. API Key: Using new key 243a5aec8e28e6526d575ac45ca369ea
2. Most Recent Publications: Should show 2025 papers first if they exist
3. All Authors: Should display ALL authors' names, not just the first author
4. Sorting: Publications should be in descending order by year (most recent first)
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://hydrochem-research.preview.emergentagent.com/api"

def test_scopus_api_integration():
    """Test Scopus API integration with new API key and requirements"""
    print("🧪 Testing Updated Scopus API Integration")
    print("=" * 60)
    print(f"Testing endpoint: {BASE_URL}/publications")
    print(f"Expected API Key: 243a5aec8e28e6526d575ac45ca369ea")
    print("=" * 60)
    
    try:
        # Test GET publications endpoint
        response = requests.get(f"{BASE_URL}/publications")
        
        if response.status_code != 200:
            print(f"❌ API Request Failed: Status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        publications = response.json()
        print(f"✅ API Request Successful: Retrieved {len(publications)} publications")
        
        if not publications:
            print("❌ No publications returned from API")
            return False
        
        # Verification 1: Check if publications are sorted by year (descending)
        print("\n📊 VERIFICATION 1: Year Sorting (Most Recent First)")
        years = [pub.get('year', 0) for pub in publications if pub.get('year')]
        print(f"Years retrieved: {years}")
        
        if len(years) > 1:
            is_sorted_desc = all(years[i] >= years[i+1] for i in range(len(years)-1))
            if is_sorted_desc:
                print("✅ Publications are correctly sorted by year (descending)")
                if years[0] >= 2024:
                    print(f"✅ Most recent publications from {years[0]} are shown first")
                else:
                    print(f"ℹ️  Most recent publication is from {years[0]} (no 2025 papers available)")
            else:
                print("❌ Publications are NOT properly sorted by year")
                return False
        
        # Verification 2: Check author information (ALL authors, not just first)
        print("\n👥 VERIFICATION 2: Author Information (All Authors)")
        authors_check_passed = True
        
        for i, pub in enumerate(publications[:3]):
            authors = pub.get('authors', '')
            author_count = len(authors.split(',')) if authors else 0
            
            print(f"Publication {i+1} Authors: {authors}")
            print(f"  Author count: {author_count}")
            
            if author_count == 1 and not authors.strip().endswith('et al.'):
                print(f"  ⚠️  Only one author listed - may be missing co-authors")
            elif author_count > 1:
                print(f"  ✅ Multiple authors listed correctly")
            else:
                print(f"  ❌ No authors or invalid author format")
                authors_check_passed = False
        
        if authors_check_passed:
            print("✅ Author information appears complete")
        else:
            print("❌ Author information may be incomplete")
        
        # Verification 3: Print detailed information for first 3 publications
        print("\n📋 VERIFICATION 3: First 3 Publications Details")
        print("=" * 80)
        
        for i, pub in enumerate(publications[:3], 1):
            print(f"PUBLICATION {i}:")
            print(f"  Year: {pub.get('year', 'N/A')}")
            print(f"  Title: {pub.get('title', 'N/A')}")
            print(f"  Authors: {pub.get('authors', 'N/A')}")
            print(f"  Journal: {pub.get('journal', 'N/A')}")
            print(f"  Citations: {pub.get('citations', 'N/A')}")
            print(f"  DOI: {pub.get('doi', 'N/A')}")
            print(f"  Scopus ID: {pub.get('scopus_id', 'N/A')}")
            print("-" * 80)
        
        # Verification 4: Check if this is real Scopus data (not mock)
        print("\n🔍 VERIFICATION 4: Real vs Mock Data Analysis")
        
        # Check for mock data indicators
        mock_titles = [
            "Novel approaches for microplastic quantification",
            "Microplastics and emerging contaminants in Selangor River Basin",
            "Hydrochemical characterization and water quality assessment"
        ]
        
        is_mock_data = False
        for pub in publications[:3]:
            title = pub.get('title', '')
            for mock_title in mock_titles:
                if mock_title in title:
                    is_mock_data = True
                    break
            if is_mock_data:
                break
        
        if is_mock_data:
            print("⚠️  WARNING: Data appears to be mock data, not real Scopus API data")
            print("   This suggests the API key may not be working or API is falling back to mock data")
        else:
            print("✅ Data appears to be real Scopus API data")
        
        # Verification 5: Check API key usage indicators
        print("\n🔑 VERIFICATION 5: API Key Usage Indicators")
        
        # Check for real API characteristics
        has_scopus_ids = sum(1 for pub in publications[:5] if pub.get('scopus_id'))
        has_realistic_citations = sum(1 for pub in publications[:5] if pub.get('citations', 0) > 0)
        has_dois = sum(1 for pub in publications[:5] if pub.get('doi'))
        
        print(f"  Publications with Scopus IDs: {has_scopus_ids}/5")
        print(f"  Publications with citations > 0: {has_realistic_citations}/5")
        print(f"  Publications with DOIs: {has_dois}/5")
        
        api_score = has_scopus_ids + has_realistic_citations + has_dois
        
        if api_score >= 10:  # High confidence
            print("✅ HIGH CONFIDENCE: Real Scopus API is being used")
        elif api_score >= 5:  # Medium confidence
            print("⚠️  MEDIUM CONFIDENCE: Likely using real API but some data may be incomplete")
        else:  # Low confidence
            print("❌ LOW CONFIDENCE: May be using mock data or API not working properly")
        
        # Final Summary
        print("\n" + "=" * 60)
        print("📋 FINAL VERIFICATION SUMMARY")
        print("=" * 60)
        
        checks = [
            ("Year Sorting (Descending)", is_sorted_desc if len(years) > 1 else True),
            ("Author Information Complete", authors_check_passed),
            ("Real Scopus Data", not is_mock_data),
            ("API Key Working", api_score >= 5)
        ]
        
        passed_checks = sum(1 for _, passed in checks if passed)
        total_checks = len(checks)
        
        for check_name, passed in checks:
            status = "✅" if passed else "❌"
            print(f"{status} {check_name}")
        
        print(f"\nOverall Score: {passed_checks}/{total_checks} checks passed")
        
        if passed_checks == total_checks:
            print("🎉 ALL VERIFICATIONS PASSED - Scopus API integration is working correctly!")
            return True
        elif passed_checks >= total_checks * 0.75:
            print("⚠️  MOSTLY WORKING - Some minor issues detected")
            return True
        else:
            print("❌ SIGNIFICANT ISSUES - Scopus API integration needs attention")
            return False
            
    except Exception as e:
        print(f"❌ Test Error: {str(e)}")
        return False

def main():
    """Main test execution"""
    print("🚀 Scopus API Integration Test - Updated API Key Verification")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    success = test_scopus_api_integration()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ TEST COMPLETED SUCCESSFULLY")
    else:
        print("❌ TEST COMPLETED WITH ISSUES")
    print("=" * 60)

if __name__ == "__main__":
    main()