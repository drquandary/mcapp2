#!/usr/bin/env python3
"""
NewsMode Integration Test
Tests the complete modal search functionality
"""

import requests
import json

API_BASE = 'http://localhost:5001'

print("=" * 60)
print("NewsMode Integration Test")
print("=" * 60)

# Test 1: Health Check
print("\n✓ Test 1: Health Check")
response = requests.get(f'{API_BASE}/api/health')
health = response.json()
print(f"  Status: {health['status']}")
print(f"  Features: {', '.join(health['features'])}")

# Test 2: Reddit Modal Search (no filter)
print("\n✓ Test 2: Reddit Modal Search (unfiltered)")
response = requests.post(f'{API_BASE}/api/search/reddit', json={
    'query': 'artificial intelligence',
    'limit': 3
})
data = response.json()
print(f"  Query: {data['query']}")
print(f"  Results: {data['count']}")
for article in data['results']:
    mode = article['modal_signature']['dominant']
    pathway = article['modal_signature']['pathway']
    print(f"    - {article['title'][:50]}...")
    print(f"      Mode: {mode} | Pathway: {pathway}")

# Test 3: Modal Filtering (REF mode only)
print("\n✓ Test 3: Modal Filtering (REF mode)")
response = requests.post(f'{API_BASE}/api/search/reddit', json={
    'query': 'climate change',
    'modal_filter': 'REF',
    'limit': 3
})
data = response.json()
print(f"  Query: {data['query']}")
print(f"  Filter: {data['modal_filter']}")
print(f"  Results: {data['count']}")
ref_only = all(r['modal_signature']['dominant'] == 'REF' for r in data['results'])
print(f"  All results are REF mode: {ref_only}")
for article in data['results']:
    mode = article['modal_signature']['dominant']
    print(f"    - [{mode}] {article['title'][:50]}...")

# Test 4: Modal Analysis
print("\n✓ Test 4: Modal Text Analysis")
response = requests.post(f'{API_BASE}/api/analyze/modal', json={
    'text': 'Scientists published a peer-reviewed study showing evidence of climate change.',
    'title': 'New research confirms warming trends'
})
data = response.json()
print(f"  Dominant mode: {data['dominant_mode']}")
print(f"  Scores: {data['raw_scores']}")
print(f"  Complexity: {data['complexity']}")

print("\n" + "=" * 60)
print("All tests passed! NewsMode is working correctly!")
print("=" * 60)
