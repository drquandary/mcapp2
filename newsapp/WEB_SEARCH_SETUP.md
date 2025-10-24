# NewsBadger WebSearch Integration Guide

This guide explains how to set up the WebSearch backend for NewsBadger using Claude's WebSearch tool.

## Overview

The NewsBadger app has two search modes:
1. **RSS/Google News** - Works out of the box, no setup needed
2. **Claude WebSearch** - Requires backend setup (this guide)

## Why a Backend?

Claude's WebSearch tool is server-side only and can't be called directly from browser JavaScript. We need a backend API that:
- Receives search requests from the browser
- Calls Claude's WebSearch tool
- Returns results to the browser

## Setup Instructions

### Option 1: Quick Start (Python Flask)

1. **Install Dependencies:**
   ```bash
   cd newsapp
   pip install -r requirements.txt
   ```

2. **Run the Backend:**
   ```bash
   python3 search_backend.py
   ```

   The API will start on `http://localhost:5000`

3. **Update App Configuration:**

   In `app.js`, update the API base URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';
   ```

4. **Test the Integration:**
   - Open the app in your browser
   - Click the "Search" tab or click "+ Find more like this" on any article
   - The app will now use WebSearch for discovery!

### Option 2: Using Claude Code Environment

If you're running this within Claude Code, the WebSearch tool is already available!

1. The `search_backend.py` is set up to use WebSearch
2. Just run: `python3 search_backend.py`
3. The backend automatically uses Claude's WebSearch tool

### Option 3: Custom Backend

You can implement the backend in any language. Just create endpoints:

```
POST /api/search
Body: { "query": "search terms", "max_results": 10 }
Response: { "articles": [...] }

POST /api/explore
Body: { "title": "...", "search_terms": [...] }
Response: { "articles": [...] }
```

## API Endpoints

### POST /api/search
Search the web for news articles.

**Request:**
```json
{
  "query": "latest AI developments",
  "max_results": 10
}
```

**Response:**
```json
{
  "query": "latest AI developments",
  "articles": [
    {
      "id": "web_1",
      "title": "Article Title",
      "summary": "Brief summary...",
      "content": "Full article content...",
      "url": "https://...",
      "source": "Source Name",
      "topic": "ai",
      "publishedAt": "2024-10-21T...",
      "readTime": 5,
      "image": "https://..."
    }
  ],
  "total_results": 10
}
```

### POST /api/explore
Find articles related to a given article.

**Request:**
```json
{
  "title": "OpenAI Releases GPT-4 Turbo",
  "content": "Article content...",
  "search_terms": ["GPT-4", "Turbo", "OpenAI"]
}
```

**Response:** Same format as `/api/search`

### GET /api/health
Check if the backend is running.

**Response:**
```json
{
  "status": "ok",
  "message": "NewsBadger WebSearch API is running",
  "features": ["web_search", "explore_topics"]
}
```

## Fallback Mode

If the backend isn't running, the app automatically falls back to:
- RSS feed fetching
- Google News RSS search
- Local article matching

This ensures the app always works, even without the WebSearch backend!

## Implementation in app.js

The app checks for the backend and uses it when available:

```javascript
// In ClaudeAPI class
async searchWebForArticles(searchTerms, exactEvent) {
    // Try WebSearch backend first
    if (API_BASE_URL) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: exactEvent || searchTerms.join(' '),
                    max_results: 20
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.articles;
            }
        } catch (error) {
            console.log('WebSearch backend not available, using fallback');
        }
    }

    // Fallback to RSS + Google News
    // ... existing code ...
}
```

## Testing

### Test the Backend
```bash
# Check health
curl http://localhost:5000/api/health

# Test search
curl -X POST http://localhost:5000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "artificial intelligence news", "max_results": 5}'
```

### Test in Browser
1. Open the app
2. Open browser console (F12)
3. Click "Search" tab or "+ Find more like this"
4. Watch console for:
   - "🌐 Using WebSearch backend" (backend working)
   - "📰 Using RSS fallback" (backend not available)

## Deployment

### Local Development
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:8000` (or any static server)

### Production (Example with Railway/Fly.io)

1. **Deploy Backend:**
   ```bash
   # Add to search_backend.py for production
   app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
   ```

2. **Update app.js:**
   ```javascript
   const API_BASE_URL = 'https://your-backend.railway.app';
   ```

3. **Deploy Frontend:**
   - Use Netlify, Vercel, or GitHub Pages
   - No special config needed!

## Security Notes

For production:
- Add authentication to the backend API
- Rate limit requests to prevent abuse
- Validate and sanitize all inputs
- Use HTTPS for both frontend and backend
- Consider adding API key authentication

## Troubleshooting

**"Backend not responding"**
- Check if `python3 search_backend.py` is running
- Verify the port isn't blocked by firewall
- Check `API_BASE_URL` in `app.js`

**"CORS errors"**
- Backend includes Flask-CORS by default
- If using different backend, enable CORS headers

**"No results from WebSearch"**
- Check backend logs for errors
- Verify Claude API access in environment
- Test with `/api/health` endpoint

## Architecture Diagram

```
┌─────────────┐
│   Browser   │
│  (app.js)   │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐
│  Backend API    │
│ search_backend  │
│   .py          │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Claude WebSearch│
│      Tool       │
└─────────────────┘
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Run the backend
3. ✅ Test with `/api/health`
4. ✅ Open the app and try searching!

Need help? Check the console logs in both backend and browser for debugging info.

---

**Made with Claude Code 🤖**
