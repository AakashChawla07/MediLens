import requests
import json

def test_search():
    url = 'http://localhost:5001/api/medicines/search?q=amox'
    try:
        response = requests.get(url)
        response.raise_for_status()
        results = response.json()
        
        print(f"Search for 'amox': Found {len(results)} results.")
        if len(results) > 0:
            print("First result:", results[0]['name'])
            if 'Augmentin' in [r['name'] for r in results]:
                print("✅ Found Augmentin")
            else:
                print("❌ Augmentin NOT found")
        else:
            print("❌ No results found for 'amox'")

    except Exception as e:
        print(f"Error: {e}")

def test_analyze_new_data():
    url = 'http://localhost:5001/api/analyze'
    data = {
        'prescriptions': ['Augmentin', 'Lipitor'],
        'allergies': ['Amoxicillin']
    }
    
    try:
        response = requests.post(url, json=data)
        results = response.json()['results']
        
        print("\nAnalyze Augmentin & Lipitor:")
        for res in results:
            print(f"- {res['original']}: Found={res['found']}")
            if res['warnings']:
                print(f"  ⚠️ Warnings: {res['warnings']}")
            if res['generics']:
                print(f"  💰 Savings: ${res['savings']}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_search()
    test_analyze_new_data()
