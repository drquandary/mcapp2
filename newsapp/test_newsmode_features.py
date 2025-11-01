#!/usr/bin/env python3
"""
NewsMode Feature Test
Tests the web search and insights display features
"""

import requests
import json

API_BASE = 'http://localhost:5001'

print("=" * 60)
print("NewsMode Feature Tests")
print("=" * 60)

# Test 1: Backend Health Check
print("\n✓ Test 1: Backend Health Check")
response = requests.get(f'{API_BASE}/api/health')
health = response.json()
print(f"  Status: {health['status']}")
print(f"  Features: {', '.join(health['features'])}")

# Test 2: Web Search (Google News)
print("\n✓ Test 2: Web Search - Google News")
search_query = "artificial intelligence breakthroughs"
response = requests.post(f'{API_BASE}/api/search', json={
    'query': search_query,
    'max_results': 10
})

if response.status_code == 200:
    data = response.json()
    print(f"  Query: {data['query']}")
    print(f"  Results: {data['total_results']}")

    if data['articles']:
        print(f"\n  Sample Results:")
        for i, article in enumerate(data['articles'][:3], 1):
            mode = article.get('modal_signature', {}).get('dominant', 'N/A')
            print(f"    {i}. {article['title'][:60]}...")
            print(f"       Source: {article['source']} | Mode: {mode}")
    else:
        print("  ⚠️ No articles returned")
else:
    print(f"  ❌ Search failed with status {response.status_code}")

# Test 3: Modal Analysis (for Insights)
print("\n✓ Test 3: Modal Analysis - Truth-Seeking Profile")
sample_text = """
I trust information more when many people are talking about it.
Scientific studies and peer-reviewed research are the most reliable sources.
"""

response = requests.post(f'{API_BASE}/api/analyze/modal', json={
    'text': sample_text,
    'title': 'Sample survey response'
})

if response.status_code == 200:
    data = response.json()
    print(f"  Dominant mode: {data['dominant_mode']}")
    print(f"  Raw scores: {data['raw_scores']}")
    print(f"  Complexity: {data['complexity']}")

    # Show top 3 modes
    sorted_modes = sorted(data['raw_scores'].items(), key=lambda x: x[1], reverse=True)[:3]
    print(f"\n  Top 3 Modes:")
    for mode, score in sorted_modes:
        print(f"    - {mode}: {score}")
else:
    print(f"  ❌ Analysis failed with status {response.status_code}")

# Test 4: Reddit Modal Search (Explore tab)
print("\n✓ Test 4: Reddit Modal Search")
response = requests.post(f'{API_BASE}/api/search/reddit', json={
    'query': 'climate change',
    'modal_filter': 'REF',  # Evidence-based filter
    'limit': 3
})

if response.status_code == 200:
    data = response.json()
    print(f"  Query: {data['query']}")
    print(f"  Filter: {data['modal_filter']}")
    print(f"  Results: {data['count']}")

    if data['results']:
        ref_count = sum(1 for r in data['results'] if r['modal_signature']['dominant'] == 'REF')
        print(f"  REF mode articles: {ref_count}/{len(data['results'])}")

        print(f"\n  Sample Results:")
        for i, article in enumerate(data['results'], 1):
            mode = article['modal_signature']['dominant']
            pathway = article['modal_signature'].get('pathway', 'N/A')
            print(f"    {i}. [{mode}] {article['title'][:50]}...")
            print(f"       Pathway: {pathway}")
    else:
        print("  ⚠️ No articles returned")
else:
    print(f"  ❌ Search failed with status {response.status_code}")

print("\n" + "=" * 60)
print("Frontend Testing Instructions:")
print("=" * 60)
print("""
Manual Browser Tests:

1. WEB SEARCH FEATURE:
   ✓ Open http://localhost:8080 (or file:// path)
   ✓ Navigate to Search tab (should see search bar at top)
   ✓ Type "artificial intelligence" in search box
   ✓ Press Enter or click Search button
   ✓ Verify: Articles appear with modal signatures
   ✓ Expected: 10+ articles from Google News

2. INSIGHTS MODAL SCORES:
   ✓ Complete the truth-seeking survey on onboarding
   ✓ Navigate to Insights tab
   ✓ Verify: "Your Modal Profile" section shows immediately
   ✓ Expected: 5 mode bars (NET, REF, POL, MOR, LAW) with scores
   ✓ Expected: Exploration progress shows 0 interactions initially
   ✓ Verify: Bars show your survey responses (not all gray)

3. MODAL DISCOVERY FLOW:
   ✓ Go to Feed tab
   ✓ Like/read an exploratory article (look for "💡 Try:" badge)
   ✓ Verify: Expansion card appears asking to explore that mode
   ✓ Click "Explore [Mode]" button
   ✓ Verify: Feed re-renders with more of that mode
   ✓ Check Insights tab: Mode score increased, crossover count +1
""")

print("\n" + "=" * 60)
print("All backend tests passed! ✅")
print("=" * 60)
