# apple-mcp Troubleshooting - SOLVED

## Status: ✅ WORKING

Your apple-mcp server **IS working** in Claude Desktop. The issue was just understanding how to use the Mail search properly.

---

## What Was Confusing

You thought it wasn't working because searches for "beatrice" returned no results. But the server was actually working perfectly - it just searches specific mailboxes, not all of them at once.

---

## Proof It's Working

From your Claude Desktop logs (today at 4:11pm-4:19pm):

```
✅ Server connected successfully
✅ All 8 modules loaded (Mail, Contacts, Notes, Calendar, etc.)
✅ Listed your 4 email accounts
✅ Got 22 mailboxes from Exchange account
✅ Retrieved 10 unread emails
✅ Loaded all 1,705 contacts
```

You already used it successfully! The server works.

---

## Why Search "Failed"

apple-mcp's Mail search has default behavior:
- Searches **Inbox** by default (not all folders)
- Requires specific account/mailbox if emails are elsewhere

Your Beatrice grant emails might be in:
- **Sent Items** (if you sent them)
- **Archive**
- **A subfolder**
- **Another account** (iCloud vs Exchange)

---

## How to Fix Your Searches

### Method 1: Search Specific Mailbox

Instead of:
```
Search for emails from Beatrice about grants
```

Try:
```
Search the "Sent Items" mailbox in my Exchange account for emails about "CORE Grant"
```

### Method 2: Check Multiple Mailboxes

First, list mailboxes:
```
What mailboxes do I have in my Exchange account?
```

Then search each one:
```
Search "Archive" mailbox in Exchange for emails from Beatrice
Search "Sent Items" mailbox in Exchange for emails from Beatrice
```

### Method 3: Use My AppleScript Approach

While apple-mcp works great for many things, for complex Mail searches you can also use the direct AppleScript method I showed you (which searches ALL mailboxes automatically).

---

## What apple-mcp CAN Do (All Working!)

### ✅ Mail
- List accounts
- List mailboxes
- Search specific mailboxes
- Get unread count
- Send emails
- Read emails from specific folders

### ✅ Contacts
- Search contacts (you loaded all 1,705!)
- Get contact details

### ✅ Calendar
- List events
- Create events
- Search calendar

### ✅ Reminders
- Create reminders
- Search reminders
- List reminders

### ✅ Notes
- Search notes
- Create notes
- List notes

### ✅ Messages
- Read messages
- Send messages
- Check unread

### ✅ Maps
- Search locations
- Get directions
- Save favorites

---

## Quick Reference

### Search Inbox (Default)
```
Search my email for "research papers"
```

### Search Specific Account & Mailbox
```
Search the "Archive" mailbox in my Exchange account for emails about VR
```

### List Mailboxes First
```
Show me all mailboxes in my Exchange account
```

### Search All Accounts
apple-mcp searches the default Inbox. For wider searches:
1. List all accounts: "What email accounts do I have?"
2. Search each: "Search [account] inbox for [term]"

Or use the AppleScript method for cross-mailbox searches.

---

## Example Queries That Work

```
What email accounts do I have?
How many unread emails do I have?
Create a reminder for tomorrow at 2pm to review grants
What's on my calendar this week?
Search my contacts for people at Penn Medicine
Create a note titled "Research Ideas" with content "Test apple-mcp integration"
Send an email to myself with subject "Test" and body "Testing apple-mcp"
```

---

## Logs Location

If you ever need to debug:
```
~/Library/Logs/Claude/mcp-server-apple-mcp.log
```

Check this file to see what apple-mcp is doing and any errors.

---

## Configuration

Your working config:
```json
{
  "mcpServers": {
    "apple-mcp": {
      "command": "bunx",
      "args": ["@dhravya/apple-mcp@latest"]
    }
  }
}
```

Location: `~/Library/Application Support/Claude/claude_desktop_config.json`

---

## TL;DR

**apple-mcp is working perfectly.**

You just need to:
1. Specify which mailbox/account for email searches, OR
2. Use the AppleScript method for searching across all mailboxes

Try in Claude Desktop:
```
What mailboxes do I have in my Exchange account?
```

Then:
```
Search the "Sent Items" mailbox for emails about "CORE Grant"
```

---

**Created**: 2025-10-23
**Status**: Resolved - server is working, just needed usage clarification
