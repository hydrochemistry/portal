#!/usr/bin/env python3
"""
Focused test for Scopus API publications year sorting verification
Tests specifically that publications are returned in descending order by year (most recent first)
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://hydrochem-research.preview.emergentagent.com/api"

def test_scopus_publications_year_sorting():
    """Test that Scopus API publications are correctly sorted by year in descending order"""
    print("🧪 Testing Scopus API Publications Year Sorting...")
    print(f"Testing endpoint: {BASE_URL}/publications")
    print("="*60)
    
    try:
        # Test GET publications endpoint
        response = requests.get(f"{BASE_URL}/publications")
        
        if response.status_code != 200:
            print(f"❌ FAILED: GET /api/publications returned status {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        publications = response.json()
        
        if not publications:
            print("❌ FAILED: No publications returned from API")
            return False
        
        print(f"✅ SUCCESS: Retrieved {len(publications)} publications")
        
        # Extract years from all publications
        years = []
        for i, pub in enumerate(publications):
            year = pub.get('year', 0)
            years.append(year)
            title = pub.get('title', 'Unknown')[:50]
            print(f"  {i+1:2d}. Year: {year} - {title}...")
        
        print(f"\n📊 Years extracted: {years}")
        
        # Verify they are in descending order (most recent first)
        is_sorted_desc = True
        for i in range(len(years) - 1):
            if years[i] < years[i + 1]:
                is_sorted_desc = False
                print(f"❌ SORTING ERROR: Year {years[i]} at position {i+1} is less than year {years[i+1]} at position {i+2}")
                break
        
        if is_sorted_desc:
            print(f"✅ SUCCESS: Publications are correctly sorted by year in descending order")
            print(f"   Most recent year: {max(years) if years else 'N/A'}")
            print(f"   Oldest year: {min(years) if years else 'N/A'}")
            return True
        else:
            print(f"❌ FAILED: Publications are NOT sorted by year in descending order")
            print(f"   Expected: Years should be in descending order (most recent first)")
            print(f"   Actual: {years}")
            return False
            
    except Exception as e:
        print(f"❌ EXCEPTION: Error testing Scopus API: {str(e)}")
        return False

def main():
    """Main test execution"""
    print("🚀 Scopus API Year Sorting Verification Test")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    success = test_scopus_publications_year_sorting()
    
    print("\n" + "="*60)
    if success:
        print("🎉 TEST RESULT: PASSED - Publications are correctly sorted by year")
    else:
        print("💥 TEST RESULT: FAILED - Publications sorting issue detected")
    print("="*60)
    
    return success

if __name__ == "__main__":
    main()