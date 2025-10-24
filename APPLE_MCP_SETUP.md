# Apple MCP Server Setup Guide

## Current Status
✅ **apple-mcp is installed and configured**

Your Claude Desktop config already has apple-mcp set up at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
"apple-mcp": {
  "command": "npx",
  "args": [
    "apple-mcp"
  ]
}
```

## Modules Available
All modules loaded successfully:
- ✅ **Mail** - Send emails, search, check unread counts
- ✅ **Contacts** - Access and manage contacts
- ✅ **Notes** - Read and write notes
- ✅ **Messages** - Access iMessages/SMS
- ✅ **Reminders** - Create and manage reminders
- ✅ **Calendar** - Schedule events, check availability
- ✅ **Maps** - Location and mapping features

## macOS Permissions Required

The apple-mcp server needs specific permissions to access your macOS apps. You'll need to grant these in **System Settings > Privacy & Security**:

### 1. Full Disk Access
**Path**: System Settings > Privacy & Security > Full Disk Access

Add these apps/processes:
- ✅ **Claude** (or Claude Desktop)
- ✅ **Terminal** (if running commands from Terminal)
- ✅ **Node** (`/opt/homebrew/bin/node`)

**Why**: Allows reading Mail database, Notes, and other app data stores.

### 2. Automation
**Path**: System Settings > Privacy & Security > Automation

Grant **Claude** (or the parent process) permission to control:
- ✅ **Mail**
- ✅ **Notes**
- ✅ **Contacts**
- ✅ **Reminders**
- ✅ **Calendar**
- ✅ **Messages**

**Why**: Enables sending emails, creating reminders, scheduling events.

### 3. Contacts
**Path**: System Settings > Privacy & Security > Contacts

- ✅ Grant access to **Claude** or **Node**

### 4. Calendars
**Path**: System Settings > Privacy & Security > Calendars

- ✅ Grant access to **Claude** or **Node**

### 5. Reminders
**Path**: System Settings > Privacy & Security > Reminders

- ✅ Grant access to **Claude** or **Node**

## How to Grant Permissions

1. **Open System Settings**
   ```bash
   open "x-apple.systempreferences:com.apple.preference.security?Privacy"
   ```

2. **Navigate to each Privacy category** listed above

3. **Click the (+) button** to add apps, or **toggle existing apps** on

4. **Important**: After granting permissions, **restart Claude Desktop** for changes to take effect

## Testing the Setup

After granting permissions and restarting Claude Desktop:

### Test 1: Check Unread Mail
In Claude Desktop, ask:
```
How many unread emails do I have in Mail?
```

### Test 2: Search Emails
```
Search my Mail for emails from the last 3 days about "research" or "VR"
```

### Test 3: Create a Reminder
```
Create a reminder for tomorrow at 2pm to review the apple-mcp setup
```

### Test 4: Check Calendar
```
What's on my calendar for today?
```

### Test 5: Send a Test Email (careful!)
```
Draft an email to myself at [your-email] with subject "MCP Test"
```

## Troubleshooting

### Issue: "Permission denied" errors
**Solution**:
1. Check Full Disk Access is granted
2. Restart Claude Desktop completely (Cmd+Q, then reopen)
3. Grant automation permissions for the specific app

### Issue: Mail commands not working
**Solution**:
1. Ensure **Mail.app is running** (some operations require it)
2. Check that your Mail accounts are active and synced
3. Verify Full Disk Access for Claude and Node

### Issue: "Module not found" errors
**Solution**:
```bash
# Reinstall apple-mcp
npm install -g apple-mcp
# Or clear npx cache
npx clear-npx-cache
```

### Issue: Commands time out
**Solution**:
1. Large Mail databases can be slow on first access
2. Ensure Mail is fully synced with your accounts
3. Try with a smaller search scope first

## Research Workflow Integration

As a VR & AI researcher, here are some useful automation ideas:

### Email Organization
```
Search my Mail for papers, PDFs, or emails from academic domains (.edu, .ac.uk) from last month
```

### Calendar Coordination
```
Find free 2-hour blocks in my calendar this week for deep work sessions
```

### Quick Notes
```
Create a new Note with my research ideas about [topic]
```

### Contact Management
```
Find contacts related to "computer vision" or "AI research"
```

### Reminder System
```
Create reminders for each paper I need to review this week
```

## Security Notes

- **Local control**: apple-mcp runs locally, doesn't send data to external servers
- **MCP standard**: Uses Model Context Protocol for secure AI-app interaction
- **Trust model**: Claude Desktop → apple-mcp → macOS apps
- **Permissions**: Only grant what you need; you can revoke anytime
- **Sensitive data**: Be cautious when asking Claude to access/send emails with sensitive information

## Configuration Location

Your current config:
```
/Users/jeffreyvadala/Library/Application Support/Claude/claude_desktop_config.json
```

## Repository & Documentation

- GitHub: https://github.com/supermemoryai/apple-mcp
- MCP Directory: https://glama.ai/mcp/servers/@supermemoryai/apple-mcp

## Next Steps

1. ✅ apple-mcp is installed
2. ⏳ Grant macOS permissions (see above)
3. ⏳ Restart Claude Desktop
4. ⏳ Test basic operations
5. ⏳ Integrate into your research workflow

---

**Note**: This setup was verified on macOS with:
- Node: v23.6.0
- bun: installed at /opt/homebrew/bin/bun
- Claude Desktop with MCP support

Created: 2025-10-23
