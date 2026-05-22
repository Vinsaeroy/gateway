# API Quick Reference

Quick reference guide for common API operations in WA-AKG.

## Base URL

```
http://localhost:3000/api
```

## Authentication

### Session-based
Use NextAuth session cookies (automatic when logged in via browser).

### API Key
Add header to all requests:
```
X-API-Key: ak_your-api-key-here
```

---

## Common Operations

### 1. Create a WhatsApp Session

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Session"
  }'
```

### 2. Get All Sessions

```bash
curl http://localhost:3000/api/sessions \
  -H "X-API-Key: your-api-key"
```

### 3. Send a Text Message

```bash
curl -X POST http://localhost:3000/api/messages/session-name/6281234567890%40s.whatsapp.net/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "text": "Hello from API!"
    }
  }'
```

### 4. Send an Image

```bash
curl -X POST http://localhost:3000/api/messages/session-name/6281234567890%40s.whatsapp.net/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "image": {
        "url": "https://example.com/image.jpg"
      },
      "caption": "Check this out!"
    }
  }'
```

### 5. Broadcast Message

```bash
curl -X POST http://localhost:3000/api/messages/broadcast \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-name",
    "recipients": [
      "6281234567890@s.whatsapp.net",
      "6289876543210@s.whatsapp.net"
    ],
    "message": "Broadcast message",
    "delay": 10000
  }'
```

### 6. Create Auto-Reply Rule

```bash
curl -X POST http://localhost:3000/api/autoreplies \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-name",
    "keyword": "hello",
    "response": "Hi! How can I help you?",
    "matchType": "EXACT"
  }'
```

### 7. Schedule a Message

```bash
curl -X POST http://localhost:3000/api/scheduler \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-name",
    "jid": "6281234567890@s.whatsapp.net",
    "content": "Scheduled message",
    "sendAt": "2024-12-31T23:59"
  }'
```

### 8. Create a Webhook

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Webhook",
    "url": "https://your-server.com/webhook",
    "secret": "webhook-secret",
    "sessionId": "session-name",
    "events": ["message.received", "message.sent"]
  }'
```

### 9. Get Chat List

```bash
curl http://localhost:3000/api/chat/session-name \
  -H "X-API-Key: your-api-key"
```

### 10. Get Messages from a Chat

```bash
# URL-encode the JID
curl http://localhost:3000/api/chat/session-name/6281234567890%40s.whatsapp.net \
  -H "X-API-Key: your-api-key"
```

### 11. Get Contacts (Paginated)

```bash
curl "http://localhost:3000/api/contacts?sessionId=session-name&page=1&limit=20&search=john" \
  -H "X-API-Key: your-api-key"
```

### 12. Get Groups

```bash
curl "http://localhost:3000/api/groups?sessionId=session-name" \
  -H "X-API-Key: your-api-key"
```

### 13. Create a Group

```bash
curl -X POST http://localhost:3000/api/groups/create \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-name",
    "subject": "My Group",
    "participants": [
      "6281234567890@s.whatsapp.net",
      "6289876543210@s.whatsapp.net"
    ]
  }'
```

### 14. Update Bot Configuration

```bash
curl -X POST http://localhost:3000/api/sessions/session-name/bot-config \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "botMode": "ALL",
    "autoReplyMode": "ALL",
    "enableSticker": true,
    "enablePing": true,
    "botName": "My Bot"
  }'
```

### 15. Post WhatsApp Status

> **⚠️ WARNING:** This endpoint has known stability issues and may not work reliably. Avoid using in production.

```bash
curl -X POST http://localhost:3000/api/status/update \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session-name",
    "content": "My status update",
    "type": "TEXT"
  }'
```

---

## JID Format

WhatsApp uses JID (Jabber ID) format:

- **Individual:** `6281234567890@s.whatsapp.net`
- **Group:** `120363123456789@g.us`
- **Broadcast:** `status@broadcast`

> **Note:** Phone numbers should include country code without `+` symbol.

---

## Match Types for Auto-Reply

- `EXACT` - Message exactly matches keyword
- `CONTAINS` - Message contains keyword anywhere
- `STARTS_WITH` - Message starts with keyword
- `ENDS_WITH` - Message ends with keyword

---

## Bot Modes

- `OWNER` - Bot commands only work for session owner
- `ALL` - Bot commands work for everyone
- `ALLOWED` - Bot commands only work for JIDs in `botAllowedJids`

---

## Auto-Reply Modes

- `ALL` - Auto-reply works in all chats
- `PRIVATE` - Auto-reply only in private chats
- `GROUP` - Auto-reply only in groups
- `ALLOWED` - Auto-reply only for JIDs in `autoReplyAllowedJids`

---

## Webhook Events

- `message.received` - Incoming messages
- `message.sent` - Outgoing messages
- `qr.update` - QR code updates
- `connection.update` - Connection status changes
- `group.join` - Bot added to group
- `group.participants.update` - Group participant changes

---

## User Roles

- `SUPERADMIN` - Full system access, can manage all users and sessions
- `OWNER` - Can manage own sessions and resources
- `STAFF` - Limited access to assigned sessions

---

## Response Status Codes

- `200` - Success
- `401` - Unauthorized (missing/invalid auth)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `400` - Bad request (validation error)
- `500` - Internal server error
- `503` - Service unavailable (session not ready)

---

## Tips

1. **Always verify session status** before sending messages
2. **Use webhooks** instead of polling for real-time updates
3. **Add delays** between bulk operations to avoid rate limiting
4. **Store API keys securely** - never commit to version control
5. **URL-encode JIDs** when using them in URL paths
6. **Check response status** and handle errors appropriately

---

## JavaScript/TypeScript Example

```typescript
const apiKey = 'ak_your-api-key';
const baseUrl = 'http://localhost:3000/api';

async function sendMessage(sessionId: string, jid: string, text: string) {
  const encJid = encodeURIComponent(jid);
  const response = await fetch(`${baseUrl}/messages/${sessionId}/${encJid}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    },
    body: JSON.stringify({
      message: { text }
    })
  });
  
  const data = await response.json();
  if (!data.status) {
    throw new Error(`API error: ${data.message || data.error}`);
  }
  
  return data;
}

// Usage
sendMessage('session-name', '6281234567890@s.whatsapp.net', 'Hello!')
  .then(result => console.log('Message sent:', result))
  .catch(error => console.error('Error:', error));
```

---

## Python Example

```python
import requests
import urllib.parse

API_KEY = 'ak_your-api-key'
BASE_URL = 'http://localhost:3000/api'

def send_message(session_id, jid, text):
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    }
    
    enc_jid = urllib.parse.quote(jid, safe='')
    
    data = {
        'message': {
            'text': text
        }
    }
    
    response = requests.post(
        f'{BASE_URL}/messages/{session_id}/{enc_jid}/send',
        headers=headers,
        json=data
    )
    
    result = response.json()
    if not result.get('status'):
        raise Exception(f"API error: {result.get('message')}")
        
    return result

# Usage
try:
    result = send_message('session-name', '6281234567890@s.whatsapp.net', 'Hello!')
    print(f'Message sent: {result}')
except Exception as e:
    print(e)
```

---

For complete documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
