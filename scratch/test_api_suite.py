import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import urllib.request
import json
import time

queries = [
    'What are the rules for unauthorized vertical storeys under Section 187?',
    'Explain Jamabandi RoR presumption of truth under Punjab Land Revenue Act Sec 31.',
    'What is the status of parcel PB020011014121?',
    'How does ISO 19152 3D Cadastre assign Sub-ULPINs to each floor?',
    'What utilities are located at -30ft depth under my building?',
    'How to schedule autonomous drone LiDAR survey for my property?',
    'How many square feet in 1 Marla in Punjab?',
    'What is Section 172 regarding road setbacks?',
    'Who owns parcel BCN506EZ850B0B?'
]

for q in queries:
    t0 = time.time()
    payload = json.dumps({'query': q, 'state': 'Punjab', 'district': 'Amritsar'}).encode('utf-8')
    req = urllib.request.Request('http://localhost:3000/api/ai/query', data=payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    dt = int((time.time() - t0) * 1000)
    print(f"[PASS] ({dt}ms) Q: {q}")
    print(f"       Model: {data.get('model')} | Citations: {len(data.get('citations', []))}")
    ans_clean = data.get('answer', '').replace('\n', ' ')[:110]
    print(f"       Answer: {ans_clean}...")
    print()
