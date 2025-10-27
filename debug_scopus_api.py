#!/usr/bin/env python3
"""
Debug Scopus API Response
This script will make a direct call to the Scopus API to see the raw response structure
"""

import requests
import json
import os

# Configuration
SCOPUS_API_KEY = "243a5aec8e28e6526d575ac45ca369ea"
AUTHOR_ID = "22133247800"

def debug_scopus_api():
    """Debug the raw Scopus API response"""
    print("🔍 Debugging Scopus API Response")
    print("=" * 60)
    print(f"API Key: {SCOPUS_API_KEY}")
    print(f"Author ID: {AUTHOR_ID}")
    print("=" * 60)
    
    try:
        # Scopus API endpoint
        url = "https://api.elsevier.com/content/search/scopus"
        headers = {
            'X-ELS-APIKey': SCOPUS_API_KEY,
            'Accept': 'application/json'
        }
        params = {
            'query': f'AU-ID({AUTHOR_ID})',
            'sort': 'coverDate desc',  # Sort by cover date descending
            'count': 3,  # Just get 3 for debugging
            'field': 'dc:title,author,prism:publicationName,prism:coverDate,prism:doi,citedby-count,dc:identifier,prism:pageRange'
        }
        
        print("Making API request...")
        response = requests.get(url, headers=headers, params=params, timeout=10)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n📋 RAW API RESPONSE STRUCTURE:")
            print("=" * 60)
            print(json.dumps(data, indent=2))
            
            print("\n🔍 ANALYZING AUTHOR FIELDS:")
            print("=" * 60)
            
            if 'search-results' in data and 'entry' in data['search-results']:
                entries = data['search-results']['entry']
                print(f"Found {len(entries)} entries")
                
                for i, entry in enumerate(entries, 1):
                    print(f"\nENTRY {i}:")
                    print(f"  Title: {entry.get('dc:title', 'N/A')}")
                    print(f"  Year: {entry.get('prism:coverDate', 'N/A')}")
                    
                    # Check different author fields
                    print(f"  Author field exists: {'author' in entry}")
                    if 'author' in entry:
                        author_data = entry['author']
                        print(f"  Author field type: {type(author_data)}")
                        print(f"  Author field content: {author_data}")
                        
                        if isinstance(author_data, list):
                            print(f"  Number of authors: {len(author_data)}")
                            for j, author in enumerate(author_data):
                                print(f"    Author {j+1}: {author}")
                                if isinstance(author, dict):
                                    print(f"      authname: {author.get('authname', 'N/A')}")
                                    print(f"      authid: {author.get('authid', 'N/A')}")
                    
                    print(f"  dc:creator field: {entry.get('dc:creator', 'N/A')}")
                    print("-" * 40)
            else:
                print("No search results found in response")
                
        else:
            print(f"API Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    debug_scopus_api()