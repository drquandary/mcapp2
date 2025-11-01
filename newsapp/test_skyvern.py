#!/usr/bin/env python3
"""
Skyvern Browser Automation Test for NewsMode
Tests web search and insights display features
"""

import requests
import json
import time
from pathlib import Path

SKYVERN_API = "http://localhost:8000"
APP_URL = f"file://{Path.cwd().absolute()}/index.html"

print("=" * 60)
print("NewsMode Skyvern Automation Test")
print("=" * 60)
print(f"App URL: {APP_URL}")
print()

def create_skyvern_task(task_url, navigation_goal, data_extraction_goal=None):
    """Create and run a Skyvern task"""
    payload = {
        "url": task_url,
        "navigation_goal": navigation_goal,
        "data_extraction_goal": data_extraction_goal or "Extract page state",
        "navigation_payload": {},
        "webhook_callback_url": None
    }

    response = requests.post(f"{SKYVERN_API}/api/v1/tasks", json=payload)

    if response.status_code == 200:
        task_data = response.json()
        task_id = task_data.get("task_id")
        print(f"✓ Task created: {task_id}")
        return task_id
    else:
        print(f"❌ Failed to create task: {response.status_code}")
        print(response.text)
        return None

def wait_for_task(task_id, timeout=60):
    """Wait for Skyvern task to complete"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        response = requests.get(f"{SKYVERN_API}/api/v1/tasks/{task_id}")
        if response.status_code == 200:
            task_status = response.json()
            status = task_status.get("status")
            print(f"  Status: {status}")

            if status in ["completed", "failed", "terminated"]:
                return task_status

        time.sleep(2)

    print(f"❌ Task timed out after {timeout}s")
    return None

# Test 1: Complete Survey and Check Insights
print("\n" + "=" * 60)
print("Test 1: Survey Completion → Insights Display")
print("=" * 60)

task_id = create_skyvern_task(
    task_url=APP_URL,
    navigation_goal="""
    1. Answer all 5 survey questions by selecting option 4 for each question
    2. Click the "Start Reading" button to complete the survey
    3. Navigate to the Insights tab by clicking on it
    4. Verify that the "Your Modal Profile" section displays 5 mode bars (NET, REF, POL, MOR, LAW) with scores
    5. Confirm that scores are visible (not just showing the empty state)
    """,
    data_extraction_goal="Extract the modal profile scores from the Insights tab"
)

if task_id:
    result = wait_for_task(task_id)
    if result and result.get("status") == "completed":
        print("✅ Test 1 PASSED: Survey → Insights flow works")
    else:
        print("❌ Test 1 FAILED")

# Test 2: Web Search Feature
print("\n" + "=" * 60)
print("Test 2: Web Search Functionality")
print("=" * 60)

# First need to complete survey to access tabs
task_id = create_skyvern_task(
    task_url=APP_URL,
    navigation_goal="""
    1. Complete the survey by selecting option 3 for all questions and clicking "Start Reading"
    2. Navigate to the Search tab
    3. Type "artificial intelligence" into the search input field
    4. Press Enter or click the Search button
    5. Wait for results to load
    6. Verify that article cards appear with titles and sources
    """,
    data_extraction_goal="Extract article titles from search results"
)

if task_id:
    result = wait_for_task(task_id)
    if result and result.get("status") == "completed":
        extracted_data = result.get("extracted_information", {})
        if extracted_data:
            print(f"✅ Test 2 PASSED: Web search returned results")
            print(f"   Extracted data: {json.dumps(extracted_data, indent=2)[:200]}...")
        else:
            print("⚠️ Test 2 PARTIAL: Task completed but no data extracted")
    else:
        print("❌ Test 2 FAILED")

# Test 3: Modal Exploration Flow
print("\n" + "=" * 60)
print("Test 3: Modal Discovery & Expansion")
print("=" * 60)

task_id = create_skyvern_task(
    task_url=APP_URL,
    navigation_goal="""
    1. Complete the survey (select option 3 for all questions)
    2. Go to the Feed tab
    3. Swipe through articles until you find one with a "💡 Try:" badge (exploratory article)
    4. Click the "Like" button on that article
    5. Look for an expansion card that appears asking to explore that mode
    6. Click the "Explore [Mode]" button if it appears
    7. Navigate to Insights tab
    8. Verify that the crossover count increased
    """,
    data_extraction_goal="Extract modal profile statistics including crossover events count"
)

if task_id:
    result = wait_for_task(task_id, timeout=90)
    if result and result.get("status") == "completed":
        print("✅ Test 3 PASSED: Modal exploration flow works")
    else:
        print("❌ Test 3 FAILED")

print("\n" + "=" * 60)
print("Skyvern Testing Complete!")
print("=" * 60)
print("""
NOTE: For full browser automation testing, ensure:
1. Skyvern server is running: python3.11 -m skyvern run server
2. Backend API is running: python3 search_backend.py (PORT=5001)
3. App is accessible at the file:// URL shown above

To run this test manually:
  python3 test_skyvern.py

To use Skyvern MCP in Claude Desktop/Code:
  - Ensure MCP server is configured in claude_desktop_config.json
  - Restart Claude Desktop/Code to load MCP tools
  - Skyvern tools will appear as mcp__skyvern__* functions
""")
