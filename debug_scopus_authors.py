#!/usr/bin/env python3
"""
Debug Scopus API Author Fields
Try different field parameters to get author information
"""

import requests
import json

# Configuration
SCOPUS_API_KEY = "243a5aec8e28e6526d575ac45ca369ea"
AUTHOR_ID = "22133247800"

def test_different_fields():
    """Test different field parameters to get author information"""
    print("🔍 Testing Different Field Parameters for Author Information")
    print("=" * 80)
    
    # Different field combinations to try
    field_tests = [
        {
            'name': 'Default Fields',
            'fields': 'dc:title,author,prism:publicationName,prism:coverDate,prism:doi,citedby-count,dc:identifier'
        },
        {
            'name': 'All Author Fields',
            'fields': 'dc:title,author,dc:creator,prism:publicationName,prism:coverDate,prism:doi,citedby-count,dc:identifier'
        },
        {
            'name': 'No Field Restriction (All Fields)',
            'fields': None
        }
    ]
    
    for test in field_tests:
        print(f"\n🧪 TEST: {test['name']}")
        print("-" * 60)
        
        try:
            url = "https://api.elsevier.com/content/search/scopus"
            headers = {
                'X-ELS-APIKey': SCOPUS_API_KEY,
                'Accept': 'application/json'
            }
            params = {
                'query': f'AU-ID({AUTHOR_ID})',
                'sort': 'coverDate desc',
                'count': 1  # Just get 1 for testing
            }
            
            if test['fields']:
                params['field'] = test['fields']
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'search-results' in data and 'entry' in data['search-results']:
                    entry = data['search-results']['entry'][0]
                    
                    print(f"Title: {entry.get('dc:title', 'N/A')}")
                    print(f"Year: {entry.get('prism:coverDate', 'N/A')}")
                    
                    # Check all possible author-related fields
                    author_fields = ['author', 'dc:creator', 'authors']
                    found_authors = False
                    
                    for field in author_fields:
                        if field in entry:
                            print(f"✅ Found {field}: {entry[field]}")
                            found_authors = True
                    
                    if not found_authors:
                        print("❌ No author fields found")
                        
                        # Show all available fields
                        print("Available fields:")
                        for key in sorted(entry.keys()):
                            print(f"  - {key}: {str(entry[key])[:100]}...")
                else:
                    print("❌ No entries found")
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")

def test_specific_publication():
    """Test getting author info for a specific publication using its Scopus ID"""
    print("\n\n🔍 Testing Specific Publication Author Retrieval")
    print("=" * 80)
    
    # Use a specific Scopus ID from our previous results
    scopus_id = "85029588047"
    
    try:
        # Try the abstract retrieval API for more detailed info
        url = f"https://api.elsevier.com/content/abstract/scopus_id/{scopus_id}"
        headers = {
            'X-ELS-APIKey': SCOPUS_API_KEY,
            'Accept': 'application/json'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Abstract API Response:")
            print(json.dumps(data, indent=2)[:2000] + "...")
        else:
            print(f"❌ Abstract API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_different_fields()
    test_specific_publication()