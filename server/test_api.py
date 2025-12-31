import requests
import json

def test_analyze():
    url = 'http://localhost:5001/api/analyze'
    headers = {'Content-Type': 'application/json'}
    data = {
        'prescriptions': ['Panadol', 'Advil'],
        'allergies': ['Caffeine']
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        response.raise_for_status()
        result = response.json()
        
        print("Status Code:", response.status_code)
        print("Response JSON:", json.dumps(result, indent=2))
        
        if 'disclaimer' in result:
            print("\n✅ Disclaimer found.")
        else:
            print("\n❌ Disclaimer MISSING.")

        if 'results' in result and len(result['results']) > 0:
            print("\n✅ Results found.")
            first_res = result['results'][0]
            if 'generics' in first_res:
                 print("✅ Generic alternatives found.")
                 if len(first_res['generics']) > 0:
                     print(f"   Found {len(first_res['generics'])} generics.")
            else:
                 print("❌ Generic alternatives MISSING.")
            
            if 'warnings' in first_res:
                print("✅ Warnings field present.")
            else:
                print("❌ Warnings field MISSING.")
        else:
            print("\n❌ No results found.")

    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_analyze()
