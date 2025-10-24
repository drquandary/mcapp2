# Quick Start: Enable WebSearch in NewsBadger

## What is This?

NewsBadger can use Claude's powerful WebSearch tool to discover news from across the entire web, not just RSS feeds!

## 3-Step Setup

### Step 1: Install Backend Dependencies
```bash
cd newsapp
pip install Flask Flask-CORS
```

### Step 2: Start the WebSearch Backend
```bash
python3 search_backend.py
```

You should see:
```
╔═══════════════════════════════════════════════════════════╗
║          NewsBadger WebSearch Backend API                 ║
╠═══════════════════════════════════════════════════════════╣
║  Status: Running                                           ║
║  Port: 5000                                                ║
╚═══════════════════════════════════════════════════════════╝
```

### Step 3: Enable in App
Open `app.js` and change line 4:
```javascript
// FROM:
const API_BASE_URL = null;

// TO:
const API_BASE_URL = 'http://localhost:5000';
```

## That's It!

Now when you click "+ Find more like this" on any article, NewsBadger will:
1. ✅ Use Claude WebSearch to find articles across the entire web
2. ✅ Fall back to RSS/Google News if backend is down
3. ✅ Show you comprehensive coverage of any topic

## Test It

1. Open the app in your browser
2. Read any article
3. Click the 🔍 button ("Find more like this")
4. Watch the magic! 🎉

The Search tab will populate with related articles found via WebSearch.

## Troubleshooting

**Backend won't start?**
```bash
# Make sure you're in the newsapp directory
cd newsapp

# Install dependencies
pip3 install Flask Flask-CORS

# Try again
python3 search_backend.py
```

**App not connecting?**
- Check that `API_BASE_URL` in `app.js` is set to `'http://localhost:5000'`
- Make sure the backend is running (check terminal)
- Open browser console (F12) and look for connection errors

**Want to disable WebSearch?**
Set `API_BASE_URL = null` in `app.js` - the app will work fine with RSS only!

---

📚 For more details, see [WEB_SEARCH_SETUP.md](./WEB_SEARCH_SETUP.md)
