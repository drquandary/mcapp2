# Setting Up apple-mcp with Claude Desktop

## Quick Start Guide

Your apple-mcp server is already configured! Just follow these steps to activate it.

---

## Step 1: Verify Configuration (Already Done ✅)

Your config file at:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Already contains:
```json
{
  "mcpServers": {
    "apple-mcp": {
      "command": "npx",
      "args": ["apple-mcp"]
    }
  }
}
```

---

## Step 2: Grant macOS Permissions (REQUIRED)

apple-mcp needs permission to access your Mail, Notes, Contacts, etc.

### A. Full Disk Access

1. Open **System Settings**
2. Go to **Privacy & Security** > **Full Disk Access**
3. Click the **lock icon** (bottom left) and authenticate
4. Click the **+ button** and add:
   - **Claude Desktop** (find in Applications folder)
   - **Node** (at `/opt/homebrew/bin/node`)

### B. Automation Permissions

1. In **System Settings** > **Privacy & Security**
2. Go to **Automation**
3. Look for **Claude** or **node** in the list
4. When you first use apple-mcp features, macOS will prompt you to grant permissions
5. **Allow** access to:
   - Mail
   - Notes
   - Contacts
   - Reminders
   - Calendar
   - Messages (if needed)

**Note**: These prompts appear automatically when you first try to use each feature in Claude Desktop.

---

## Step 3: Restart Claude Desktop

**IMPORTANT**: After granting permissions, you must restart Claude Desktop completely.

1. **Quit Claude Desktop** (Cmd+Q, not just close the window)
2. **Reopen Claude Desktop**
3. The apple-mcp server will load automatically on startup

---

## Step 4: Verify It's Working

In a new conversation in Claude Desktop, try:

### Test 1: Check Mail
```
How many unread emails do I have?
```

### Test 2: Search Emails
```
Find emails from Beatrice about grants
```

### Test 3: Check Calendar
```
What's on my calendar today?
```

### Test 4: Create a Note
```
Create a new Note titled "apple-mcp test" with content "This is working!"
```

---

## How to Use apple-mcp in Claude Desktop

Once set up, just ask natural language questions or requests:

### Email Examples
- "Show me emails from the last 3 days about research"
- "Search for emails with PDF attachments from .edu addresses"
- "How many unread emails do I have from Penn Medicine?"
- "Find emails mentioning VR or virtual reality"

### Calendar Examples
- "What meetings do I have this week?"
- "Find 2-hour blocks in my calendar for deep work"
- "Add an event for tomorrow at 2pm: Team meeting"

### Notes Examples
- "Create a note with my research ideas about [topic]"
- "Show me notes containing 'grant proposal'"
- "Update my notes about [project]"

### Reminders Examples
- "Remind me to review papers tomorrow at 10am"
- "Create a reminder to follow up on the CORE grant"
- "Show my reminders for this week"

### Contacts Examples
- "Find contacts from Penn Medicine"
- "Search for people in my contacts related to AI research"
- "Show me contact info for Beatrice"

---

## Troubleshooting

### Issue: "I don't see any tools loading"

**Solution**:
1. Check that you restarted Claude Desktop after editing the config
2. Look for the apple-mcp server in the MCP section of Claude Desktop
3. Open Developer Tools (Help > Developer Tools) and check Console for errors

### Issue: "Permission denied" errors

**Solution**:
1. Grant **Full Disk Access** to Claude Desktop and Node
2. Restart Claude Desktop completely (Cmd+Q, then reopen)
3. Try the operation again - macOS should prompt for Automation permission
4. Click **OK** to allow access

### Issue: "apple-mcp not found"

**Solution**:
```bash
# Install globally first
npm install -g apple-mcp

# Or clear npx cache and try again
npx clear-npx-cache
```

### Issue: Commands time out or are slow

**Solution**:
1. First search may be slow as Mail indexes
2. Ensure Mail.app is open and synced
3. For large mailboxes, be specific in your searches (date ranges, specific people)

### Issue: Can't see the server in Claude Desktop

**Solution**:
1. Open Claude Desktop
2. Look in the bottom left for the MCP icon (plug icon)
3. Click it to see connected servers
4. apple-mcp should be listed with green status
5. If not, check the config file syntax (must be valid JSON)

---

## Optional: Use bunx Instead of npx (Faster)

You have `bun` installed, which can start MCP servers faster than `npx`.

To switch:

1. Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Change:
   ```json
   "apple-mcp": {
     "command": "bunx",
     "args": ["apple-mcp"]
   }
   ```

3. Restart Claude Desktop

---

## What You Get

Once configured, Claude Desktop will have these capabilities:

✅ **Mail**: Search, read, send emails, check unread counts
✅ **Calendar**: View events, check availability, create events
✅ **Reminders**: Create, read, manage reminders
✅ **Notes**: Create, search, update notes
✅ **Contacts**: Search and access contact information
✅ **Messages**: Access iMessages/SMS
✅ **Maps**: Location and mapping features

---

## Security & Privacy

- **Local only**: apple-mcp runs entirely on your Mac
- **No cloud**: Doesn't send your data to external servers
- **Your control**: You can revoke permissions anytime in System Settings
- **Audit**: Open source - you can review the code at https://github.com/supermemoryai/apple-mcp

---

## Next Steps After Setup

### 1. Test Core Features
Run the verification tests in Step 4 above

### 2. Integrate Into Your Workflow
As a VR/AI researcher, you can:
- Automatically organize research emails
- Track paper review deadlines with reminders
- Search for collaboration emails
- Quick-access contact info for colleagues
- Sync calendar for research meetings

### 3. Combine with Other MCP Servers
You already have other MCP servers configured:
- `codemcp` - code analysis
- `mcapp-database` - database access
- `academic-editor` - academic writing
- `j-reviewer` - journal reviews

Use them together! For example:
"Search my emails for the latest paper from Dr. Smith, then use academic-editor to review it"

---

## Current System Info

- ✅ macOS: Darwin 25.0.0
- ✅ Node: v23.6.0
- ✅ bun: installed at /opt/homebrew/bin/bun
- ✅ Config location: ~/Library/Application Support/Claude/claude_desktop_config.json
- ✅ apple-mcp: configured with npx

**Status**: Ready to use after granting permissions and restarting Claude Desktop!

---

**Created**: 2025-10-23
**Tested with**: Mail search for Beatrice's grant emails ✅
