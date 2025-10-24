# NewsBadger Ngrok Quick Reference

## Current Active URL

**Your app is currently accessible at:**
```
https://0477e3cbc72f.ngrok-free.app/newsapp/index.html
```

## Quick Commands

### Get Current URL
```bash
cd /Users/jeffreyvadala/mcapp2/newsapp
./get-ngrok-url.sh
```
This will show the current ngrok URL and copy it to your clipboard.

### Start Ngrok (if not running)
```bash
# Make sure local server is running first
cd /Users/jeffreyvadala/mcapp2
python3 -m http.server 8080 &

# Then start ngrok
ngrok http 8080
```

### Stop Ngrok
```bash
# Kill ngrok process
pkill -f ngrok
```

### Check if Ngrok is Running
```bash
curl -s http://localhost:4040/api/tunnels | python3 -m json.tool
```

## Important Notes

### Why URLs Change
- Ngrok generates a new random URL each time you restart it
- Free plan doesn't support reserved/custom domains
- If you restart ngrok, you'll need to share the new URL

### Ngrok Warning Page
- First-time visitors will see a ngrok warning page
- They need to click "Visit Site" button
- This is normal for free ngrok accounts

### Keeping Ngrok Running
- Ngrok will stay active as long as the terminal is open
- If your computer sleeps, the connection may drop
- To run in background: `ngrok http 8080 > ngrok.log 2>&1 &`

## Troubleshooting

### ERR_NGROK_3200 (Endpoint is offline)
This means:
- Ngrok has been restarted and URL changed
- Run `./get-ngrok-url.sh` to get the new URL
- OR ngrok isn't running - start it with `ngrok http 8080`

### Connection Refused
- Make sure local server is running: `lsof -i:8080`
- If not running: `python3 -m http.server 8080 &`
- Make sure ngrok is running: `curl http://localhost:4040/api/tunnels`

### Can't Access Ngrok Web Interface
- Visit http://localhost:4040 in your browser
- This shows live traffic and requests
- Only works when ngrok is running

## Testing

### Test Ngrok Connection
```bash
cd /Users/jeffreyvadala/mcapp2/newsapp
node test-ngrok.js
```

This will:
- Open the app via ngrok URL
- Handle the warning page
- Test the app functionality
- Show you if everything works

## Production Deployment

For a permanent URL, consider:
- **Ngrok Paid Plan**: Get a reserved domain
- **Vercel**: Deploy static site for free
- **Netlify**: Another free static hosting option
- **GitHub Pages**: Free hosting from your repo
