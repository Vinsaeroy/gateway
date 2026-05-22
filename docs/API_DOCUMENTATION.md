# WA-AKG API Documentation

# WhatsApp AI Gateway — Complete API Reference

Professional WhatsApp Gateway REST API with **120 routes** for complete WhatsApp automation.

## 🔐 Authentication

All endpoints require one of the following authentication methods:

| Method | Header / Cookie | Example |
| :--- | :--- | :--- |
| **API Key** | `X-API-Key` (header) | `X-API-Key: your-api-key-here` |
| **Session Cookie** | `next-auth.session-token` (cookie) | Automatically managed by browser |

## 📋 Common Parameters

| Parameter | Format | Example |
| :--- | :--- | :--- |
| `sessionId` | Unique session identifier | `session-01` |
| `jid` (Personal) | `{countryCode}{number}@s.whatsapp.net` | `628123456789@s.whatsapp.net` |
| `jid` (Group) | `{groupId}@g.us` | `120363123456789@g.us` |

---

## 📂 Web Authentication

### \[GET\] /auth/session

**Get current web session**

Check if the user is authenticated in the web dashboard

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Current session |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `user` | object | No | — |
| `expires` | string | No | — |

**Response Example (`200`):**

```json
{
  "user": {
    "name": "string",
    "email": "string",
    "image": "string"
  },
  "expires": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/auth/session" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /auth/csrf

**Get CSRF token**

Retrieve CSRF token for form submissions

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | CSRF Token |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `csrfToken` | string | No | — |

**Response Example (`200`):**

```json
{
  "csrfToken": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/auth/csrf" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Sessions

### \[GET\] /sessions

**List all accessible sessions**

Get all sessions accessible to the authenticated user (role-based filtering)

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of sessions |
| `401` | Unauthorized - Invalid or missing API key |

**Response Example (`200`):**

```json
[
  {
    "id": "clx123abc",
    "name": "Marketing Bot",
    "sessionId": "marketing-1",
    "status": "Connected",
    "userId": "string",
    "botConfig": {
      "text": "Hello from WA-AKG!"
    },
    "webhooks": [
      {
        "text": "Hello from WA-AKG!"
      }
    ],
    "_count": {
      "contacts": 0,
      "messages": 0,
      "groups": 0,
      "autoReplies": 0,
      "scheduledMessages": 0
    },
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-15T08:00:00.000Z"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions

**Create new WhatsApp session**

Creates a new WhatsApp session for QR code pairing

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | Display name for the session |
| `sessionId` | string | No | Unique session ID (auto-generated if not provided) |

**Example:**

```json
{
  "name": "Marketing Bot",
  "sessionId": "marketing-1"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Session created successfully |
| `400` | Invalid request body |
| `401` | Unauthorized - Invalid or missing API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `sessionId` | string | No | — |
| `status` | string | No | **Options:** `Connected`, `Disconnected`, `Connecting` |
| `userId` | string | No | — |
| `botConfig` | object, nullable | No | — |
| `webhooks` | array of object | No | — |
| `_count` | object, nullable | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "clx123abc",
  "name": "Marketing Bot",
  "sessionId": "marketing-1",
  "status": "Connected",
  "userId": "string",
  "botConfig": {
    "text": "Hello from WA-AKG!"
  },
  "webhooks": [
    {
      "text": "Hello from WA-AKG!"
    }
  ],
  "_count": {
    "contacts": 0,
    "messages": 0,
    "groups": 0,
    "autoReplies": 0,
    "scheduledMessages": 0
  },
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Marketing Bot","sessionId":"marketing-1"}'
```

---

### \[GET\] /sessions/{id}/qr

**Get QR code for pairing**

Retrieve QR code (string and base64 image) for WhatsApp pairing

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | Session ID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | QR code generated |
| `400` | Already connected |
| `404` | QR not available yet |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `qr` | string | No | QR code string |
| `base64` | string | No | Base64 data URL for image |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "QR code generated",
  "data": {
    "success": true,
    "qr": "2@AbCdEfGhIjKlMnOp...",
    "base64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/sales-01/qr" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /sessions/{id}/bot-config

**Get bot configuration**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Bot configuration retrieved |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/abc123/bot-config" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions/{id}/bot-config

**Update bot configuration**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | boolean | No | — |
| `botMode` | string | No | **Options:** `OWNER`, `SPECIFIC`, `BLACKLIST`, `ALL` |
| `botAllowedJids` | array of string | No | — |
| `botBlockedJids` | array of string | No | — |
| `autoReplyMode` | string | No | **Options:** `OWNER`, `SPECIFIC`, `BLACKLIST`, `ALL` |
| `autoReplyAllowedJids` | array of string | No | — |
| `autoReplyBlockedJids` | array of string | No | — |
| `botName` | string | No | — |
| `enableSticker` | boolean | No | — |
| `enableVideoSticker` | boolean | No | — |
| `maxStickerDuration` | integer | No | — |
| `enablePing` | boolean | No | — |
| `enableUptime` | boolean | No | — |
| `removeBgApiKey` | string, nullable | No | — |
| `antiSpamEnabled` | boolean | No | Enable random delays to avoid WhatsApp bans |
| `spamLimit` | integer | No | Max messages allowed in the interval window (default 5) |
| `spamInterval` | integer | No | Time window in seconds (default 10) |
| `spamDelayMin` | integer | No | Min random delay in ms (default 1000) |
| `spamDelayMax` | integer | No | Max random delay in ms (default 3000) |

**Example:**

```json
{
  "enabled": true,
  "botMode": "BLACKLIST",
  "botBlockedJids": [
    "628123456789@s.whatsapp.net"
  ],
  "autoReplyMode": "SPECIFIC",
  "autoReplyAllowedJids": [
    "628123456789@s.whatsapp.net"
  ],
  "botName": "My Assistant",
  "enableSticker": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Configuration updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `enabled` | boolean | No | — |
| `botMode` | string | No | — |
| `botAllowedJids` | array of string | No | — |
| `autoReplyMode` | string | No | — |
| `autoReplyAllowedJids` | array of string | No | — |
| `botName` | string | No | — |
| `enableSticker` | boolean | No | — |
| `enableVideoSticker` | boolean | No | — |
| `maxStickerDuration` | integer | No | — |
| `enablePing` | boolean | No | — |
| `enableUptime` | boolean | No | — |
| `removeBgApiKey` | string, nullable | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "sessionId": "string",
  "enabled": true,
  "botMode": "string",
  "botAllowedJids": [
    "string"
  ],
  "autoReplyMode": "string",
  "autoReplyAllowedJids": [
    "string"
  ],
  "botName": "string",
  "enableSticker": true,
  "enableVideoSticker": true,
  "maxStickerDuration": 0,
  "enablePing": true,
  "enableUptime": true,
  "removeBgApiKey": "string",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions/abc123/bot-config" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"botMode":"BLACKLIST","botBlockedJids":["628123456789@s.whatsapp.net"],"autoReplyMode":"SPECIFIC","autoReplyAllowedJids":["628123456789@s.whatsapp.net"],"botName":"My Assistant","enableSticker":true}'
```

---

### \[GET\] /sessions/{id}

**Get session details**

Get detailed information about a specific session including uptime and status

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Session details |
| `404` | Session not found |

**Response Example (`200`):**

```json
{
  "id": "clx123abc",
  "name": "Marketing Bot",
  "sessionId": "marketing-1",
  "status": "Connected",
  "userId": "string",
  "botConfig": {
    "text": "Hello from WA-AKG!"
  },
  "webhooks": [
    {
      "text": "Hello from WA-AKG!"
    }
  ],
  "_count": {
    "contacts": 0,
    "messages": 0,
    "groups": 0,
    "autoReplies": 0,
    "scheduledMessages": 0
  },
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z",
  "uptime": 0,
  "messageCount": 0,
  "hasInstance": true,
  "me": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions/{id}/{action}

**Perform session action**

Start, stop, restart, or logout a session

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |
| `action` | path | ✅ Yes | string | **Options:** `start`, `stop`, `restart`, `logout` |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Action performed successfully |
| `400` | Invalid action |
| `500` | Action failed |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions/abc123/start" \
  -H "X-API-Key: your-api-key"
```

---

### \[PATCH\] /sessions/{id}/settings

**Update session settings**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `config` | object | No | — |

**Example:**

```json
{
  "config": {
    "readReceipts": true,
    "rejectCalls": true
  }
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/sessions/abc123/settings" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"config":{"readReceipts":true,"rejectCalls":true}}'
```

---

### \[DELETE\] /sessions/{id}/settings

**Delete session and logout**

Permanently deletes session and logs out from WhatsApp

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Session deleted |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/sessions/abc123/settings" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Session Access

### \[GET\] /sessions/{sessionId}/access

**List users with shared access**

Get all users who have been granted access to the specified session. Only the session owner or SUPERADMIN can use this endpoint.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session ID (slug or CUID) |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Access list retrieved |
| `401` | Unauthorized |
| `403` | Forbidden - Only session owner can manage access |
| `404` | Session not found |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Access list retrieved successfully",
  "data": [
    {
      "id": "clx789def",
      "sessionId": "clx123abc",
      "userId": "clx456ghi",
      "createdAt": "2026-03-20T15:00:00.000Z",
      "user": {
        "id": "clx456ghi",
        "name": "Staff User",
        "email": "staff@example.com",
        "role": "STAFF"
      }
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/marketing-1/access" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions/{sessionId}/access

**Grant access to another user**

Grant session access to another registered user by email. Only the session owner or SUPERADMIN can use this endpoint. Cannot grant access to the session owner themselves or to SUPERADMINs (who already have access to all sessions).

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session ID (slug or CUID) |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | ✅ Yes | Email address of the user to grant access |

**Example:**

```json
{
  "email": "staff@example.com"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `201` | Access granted successfully |
| `400` | Validation error / Cannot grant to owner / SUPERADMIN already has access |
| `401` | Unauthorized |
| `403` | Forbidden - Only session owner can manage access |
| `404` | Session or user not found |
| `409` | User already has access |

**Response Example (`201`):**

```json
{
  "status": true,
  "message": "Access granted to staff@example.com",
  "data": {
    "id": "clx789def",
    "sessionId": "clx123abc",
    "userId": "clx456ghi",
    "createdAt": "2026-03-20T15:00:00.000Z",
    "user": {
      "id": "clx456ghi",
      "name": "Staff User",
      "email": "staff@example.com",
      "role": "STAFF"
    }
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions/marketing-1/access" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com"}'
```

---

### \[DELETE\] /sessions/{sessionId}/access

**Revoke user access**

Remove shared access for a user from the specified session. Only the session owner or SUPERADMIN can use this endpoint.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session ID (slug or CUID) |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | string | ✅ Yes | CUID of the user to revoke access from |

**Example:**

```json
{
  "userId": "clx456ghi"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Access revoked successfully |
| `400` | Validation error |
| `401` | Unauthorized |
| `403` | Forbidden - Only session owner can manage access |
| `404` | Session or access record not found |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Access revoked successfully",
  "data": null
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/sessions/marketing-1/access" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":"clx456ghi"}'
```

---

## 📂 Messaging (Deprecated)

### ~~\[POST\] /chat/send~~

> ⚠️ **DEPRECATED** — ⚠️ **DEPRECATED**: Use POST /messages/{sessionId}/{jid}/send instead. This endpoint will be removed in a future version.\n\nUniversal endpoint for sending text, images, videos, documents, and stickers

**[DEPRECATED] Send message (text/media/sticker)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `message` | object | ✅ Yes | Message content (text, image, sticker, etc.) |
| `mentions` | array of string | No | List of JIDs to mention |

**Example:**

```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "message": {
    "text": "Hello from WA-AKG!"
  },
  "mentions": [
    "628123456789@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message sent |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/send" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"sales-01","jid":"628123456789@s.whatsapp.net","message":{"text":"Hello from WA-AKG!"},"mentions":["628123456789@s.whatsapp.net"]}'
```

---

### ~~\[POST\] /chat/{sessionId}/send~~

> ⚠️ **DEPRECATED** — ⚠️ **DEPRECATED**: Use POST /messages/{sessionId}/{jid}/send instead.

**[DEPRECATED] Send message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | ✅ Yes | — |
| `message` | object | ✅ Yes | — |

**Example:**

```json
{
  "jid": "string",
  "message": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message sent |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/send" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"jid":"string","message":{"text":"Hello from WA-AKG!"}}'
```

---

## 📂 Messaging

### \[POST\] /messages/{sessionId}/{jid}/send

**Send message (text/media/sticker)**

Universal endpoint for sending text, images, videos, documents, and stickers. Supports mentions and all WhatsApp message types.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session identifier |
| `jid` | path | ✅ Yes | string | Recipient JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | object | ✅ Yes | Message content (text, image, sticker, etc.) |
| `mentions` | array of string | No | List of JIDs to mention (for group messages) |

**Example:**

```json
{
  "message": {
    "text": "Hello from WA-AKG!"
  },
  "mentions": [
    "628123456789@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message sent successfully |
| `400` | Invalid request - jid and message are required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found or disconnected |
| `500` | Failed to send message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sales-01/628123456789@s.whatsapp.net/send" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"Hello from WA-AKG!"},"mentions":["628123456789@s.whatsapp.net"]}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/media

**Send media (image/video/audio/document)**

Send file using multipart/form-data

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session identifier |
| `jid` | path | ✅ Yes | string | Recipient JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |
| `type` | string | ✅ Yes | **Options:** `image`, `video`, `audio`, `voice`, `document`, `sticker` **Default:** `image` |
| `caption` | string | No | — |

**Example:**

```json
{
  "file": "(binary)",
  "type": "image",
  "caption": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Media sent successfully |
| `400` | Bad Request - File missing |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send media |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/media" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[POST\] /messages/{sessionId}/broadcast

**Broadcast message to multiple recipients**

Send same message to multiple contacts with anti-ban delays (10-20s random)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `recipients` | array of string | ✅ Yes | — |
| `message` | string | ✅ Yes | — |
| `delay` | number | No | Optional delay (unused) |

**Example:**

```json
{
  "recipients": [
    "628123456789@s.whatsapp.net",
    "628987654321@s.whatsapp.net"
  ],
  "message": "Flash Sale! 50% off",
  "delay": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Broadcast started |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to start broadcast |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Broadcast started in background"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/broadcast" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"recipients":["628123456789@s.whatsapp.net","628987654321@s.whatsapp.net"],"message":"Flash Sale! 50% off","delay":0}'
```

---

### ~~\[POST\] /messages/broadcast~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/broadcast instead. This endpoint will be removed in a future version.

**Broadcast message (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `recipients` | array of string | ✅ Yes | — |
| `message` | string | ✅ Yes | — |
| `delay` | number | No | Intended delay between messages (ms). Note: implementation uses additional random 10-20s delay. **Default:** `2000` |

**Example:**

```json
{
  "sessionId": "string",
  "recipients": [
    "628123456789@s.whatsapp.net",
    "628987654321@s.whatsapp.net"
  ],
  "message": "Flash Sale! 50% off",
  "delay": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Broadcast started (background processing) |
| `400` | Invalid request (validation error) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to start broadcast |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Broadcast started in background"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/broadcast" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","recipients":["628123456789@s.whatsapp.net","628987654321@s.whatsapp.net"],"message":"Flash Sale! 50% off","delay":0}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/poll

**Send poll message**

Create interactive poll (2-12 options, single or multiple choice)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | string | ✅ Yes | — |
| `options` | array of string | ✅ Yes | — |
| `selectableCount` | integer | No | — |

**Example:**

```json
{
  "question": "What's your favorite product?",
  "options": [
    "Product A",
    "Product B",
    "Product C"
  ],
  "selectableCount": 1
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Poll sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send poll |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/poll" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"question":"What's your favorite product?","options":["Product A","Product B","Product C"],"selectableCount":1}'
```

---

### ~~\[POST\] /messages/poll~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/poll instead. This endpoint will be removed in a future version.

**Send poll message (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `question` | string | ✅ Yes | — |
| `options` | array of string | ✅ Yes | — |
| `selectableCount` | integer | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "question": "What's your favorite product?",
  "options": [
    "Product A",
    "Product B",
    "Product C"
  ],
  "selectableCount": 1
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Poll sent |
| `400` | Invalid request (missing fields or options out of range) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send poll |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/poll" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","question":"What's your favorite product?","options":["Product A","Product B","Product C"],"selectableCount":1}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/location

**Send location**

Share GPS coordinates with optional name and address

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `latitude` | number | ✅ Yes | — |
| `longitude` | number | ✅ Yes | — |
| `name` | string | No | — |
| `address` | string | No | — |

**Example:**

```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "name": "Central Park",
  "address": "Jakarta, Indonesia"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Location sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send location |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/location" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-6.2088,"longitude":106.8456,"name":"Central Park","address":"Jakarta, Indonesia"}'
```

---

### ~~\[POST\] /messages/location~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/location instead. This endpoint will be removed in a future version.

**Send location (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `latitude` | number | ✅ Yes | — |
| `longitude` | number | ✅ Yes | — |
| `name` | string | No | — |
| `address` | string | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "name": "Office",
  "address": "Jakarta, Indonesia"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Location sent |
| `400` | Invalid request (missing fields or coordinates out of range) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send location |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/location" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","latitude":-6.2088,"longitude":106.8456,"name":"Office","address":"Jakarta, Indonesia"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/contact

**Send contact card**

Share one or multiple contact vCards

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `contacts` | array of object | ✅ Yes | — |

**Example:**

```json
{
  "contacts": [
    {
      "displayName": "John Doe",
      "vcard": "BEGIN:VCARD..."
    }
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send contact |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/contact" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"contacts":[{"displayName":"John Doe","vcard":"BEGIN:VCARD..."}]}'
```

---

### ~~\[POST\] /messages/contact~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/contact instead. This endpoint will be removed in a future version.

**Send contact card (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `contacts` | array of object | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "contacts": [
    {
      "displayName": "string",
      "vcard": "string"
    }
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact sent |
| `400` | Invalid request (missing fields or empty contacts) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send contact |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/contact" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","contacts":[{"displayName":"string","vcard":"string"}]}'
```

---

### \[GET\] /messages/{sessionId}/download/{messageId}/media

**Download message media**

Download media from a message (direct binary or redirect)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Binary media file |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Cannot access session or message |
| `404` | Message not found or has no media |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/session-01/download/MSG_ID_123/media" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /messages/{id}/media~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /messages/{sessionId}/{messageId}/media instead. This endpoint will be removed in a future version.

**Download message media (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Binary media file |
| `400` | sessionId is required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Cannot access session or message |
| `404` | Message not found or has no media |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/abc123/media?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /messages/{sessionId}/{jid}/{messageId}/react

**React to message with emoji**

Add emoji reaction to a message (empty string removes reaction)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `emoji` | string | ✅ Yes | Emoji or empty string to remove |

**Example:**

```json
{
  "emoji": "👍"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reaction sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reaction |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123/react" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"emoji":"👍"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/{messageId}/reply

**Reply to a message (quoted reply)**

Send a quoted reply to a specific message by its ID. Uses same request format as /send — pass a Baileys message object.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | ID of message to reply to |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | object | ✅ Yes | Message content — same format as /send (text, image, video, etc.) |
| `mentions` | array of string | No | JIDs to mention |
| `fromMe` | boolean | No | Whether the quoted message was sent by you **Default:** `false` |

**Example:**

```json
{
  "message": {
    "text": "Thanks for your message!"
  },
  "mentions": [
    "628123456789@s.whatsapp.net"
  ],
  "fromMe": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reply sent successfully |
| `400` | message is required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reply |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sales-01/628123456789@s.whatsapp.net/3EB0ABCD1234567890/reply" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"Thanks for your message!"},"mentions":["628123456789@s.whatsapp.net"],"fromMe":true}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/reply

**Reply to a message (body-based)**

Send a quoted reply with messageId provided in the request body. Same request format as /send with added messageId.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `messageId` | string | ✅ Yes | ID of the message to reply to |
| `message` | object | ✅ Yes | Message content — same format as /send (text, image, video, etc.) |
| `mentions` | array of string | No | JIDs to mention |
| `fromMe` | boolean | No | Whether the quoted message was sent by you **Default:** `false` |

**Example:**

```json
{
  "messageId": "3EB0ABCD1234567890",
  "message": {
    "text": "Sure, let me check that for you!"
  }
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reply sent successfully |
| `400` | messageId and message required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reply |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sales-01/628123456789@s.whatsapp.net/reply" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"3EB0ABCD1234567890","message":{"text":"Sure, let me check that for you!"}}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/{messageId}/star

**Star or unstar a message**

Mark a message as starred (saved) or remove the star. Starred messages appear in the Starred Messages section.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `star` | boolean | No | true to star, false to unstar **Default:** `true` |
| `fromMe` | boolean | No | Whether the message was sent by you **Default:** `false` |

**Example:**

```json
{
  "star": true,
  "fromMe": false
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Star status updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to star/unstar message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message starred"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123/star" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"star":true,"fromMe":false}'
```

---

### \[GET\] /messages/{sessionId}/search

**Search messages**

Search messages stored in the database for a session. Supports full-text search, filtering by JID, type, and sender.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `q` | query | No | string | Text to search for in message content |
| `jid` | query | No | string | Filter by chat JID |
| `type` | query | No | string | Filter by message type **Options:** `TEXT`, `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`, `STICKER`, `LOCATION`, `CONTACT` |
| `fromMe` | query | No | boolean | Filter by sender (true=outgoing, false=incoming) |
| `page` | query | No | integer | **Default:** `1` |
| `limit` | query | No | integer | **Default:** `20` |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Search results |
| `400` | q or jid is required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |
| `500` | Failed to search messages |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `data` | array of object | No | — |
| `pagination` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "remoteJid": "string",
      "fromMe": true,
      "keyId": "string",
      "pushName": "string",
      "type": "string",
      "content": "string",
      "status": "string",
      "timestamp": "2026-01-15T08:00:00.000Z",
      "quoteId": "string"
    }
  ],
  "pagination": {
    "total": 0,
    "page": 0,
    "limit": 0,
    "pages": 0
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/sales-01/search?q=invoice&jid=628123456789@s.whatsapp.net&type=value&fromMe=value&page=value&limit=value" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /messages/react~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/{messageId}/react instead. This endpoint will be removed in a future version.

**React to message with emoji (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `messageId` | string | ✅ Yes | — |
| `emoji` | string | ✅ Yes | Emoji or empty string to remove |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "messageId": "3EB0ABCD1234567890",
  "emoji": "👍"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reaction sent |
| `400` | Invalid request (missing fields) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reaction |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Reaction sent"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/react" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","messageId":"3EB0ABCD1234567890","emoji":"👍"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/list

**Send list message**

Send a formatted numbered list message

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | ✅ Yes | — |
| `options` | array of string | ✅ Yes | — |
| `footer` | string | No | — |

**Example:**

```json
{
  "title": "Our Services",
  "options": [
    "Web Dev",
    "App Dev",
    "UI/UX"
  ],
  "footer": "Choose one"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/list" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"Our Services","options":["Web Dev","App Dev","UI/UX"],"footer":"Choose one"}'
```

---

### ~~\[POST\] /messages/list~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/list instead. This endpoint will be removed in a future version.

**Send list message (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `title` | string | ✅ Yes | — |
| `options` | array of string | ✅ Yes | — |
| `footer` | string | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "title": "Our Services",
  "options": [
    "Web Dev",
    "App Dev",
    "UI/UX"
  ],
  "footer": "Choose one"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List message sent |
| `400` | Missing fields or empty options |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send list message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/list" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","title":"Our Services","options":["Web Dev","App Dev","UI/UX"],"footer":"Choose one"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/spam

**Message bombing (Spam)**

Send a message multiple times in a row in the background

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | string | ✅ Yes | — |
| `count` | integer | No | **Default:** `10` |
| `delay` | integer | No | Delay in ms **Default:** `500` |

**Example:**

```json
{
  "message": "Check our new catalog!",
  "count": 5,
  "delay": 1000
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Spam started |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to start spam |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/spam" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message":"Check our new catalog!","count":5,"delay":1000}'
```

---

### ~~\[POST\] /messages/spam~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/spam instead. This endpoint will be removed in a future version.

**Message bombing (Spam) (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `message` | string | ✅ Yes | — |
| `count` | integer | No | **Default:** `10` |
| `delay` | integer | No | Delay in ms **Default:** `500` |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "message": "Check our new catalog!",
  "count": 5,
  "delay": 1000
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Spam started |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to start spam |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Bombing 5 messages started"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/spam" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","message":"Check our new catalog!","count":5,"delay":1000}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/sticker

**Send sticker**

Convert an image to sticker and send it

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |
| `pack` | string | No | Sticker pack name (default: WA-AKG) |
| `author` | string | No | Sticker author name (default: User) |
| `type` | string | No | Sticker crop type (default: full) **Options:** `full`, `crop`, `circle` |
| `quality` | integer | No | Image quality (default: 50) |

**Example:**

```json
{
  "file": "(binary)",
  "pack": "string",
  "author": "string",
  "type": "full",
  "quality": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Sticker sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create sticker |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/sticker" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### ~~\[POST\] /messages/sticker~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/{jid}/sticker instead. This endpoint will be removed in a future version.

**Send sticker (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `file` | string (binary) | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Sticker sent |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create sticker |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sticker" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[POST\] /messages/{sessionId}/forward

**Forward message**

Forward a message to one or multiple chats

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fromJid` | string | ✅ Yes | Source chat JID |
| `messageId` | string | ✅ Yes | — |
| `toJids` | array of string | ✅ Yes | Recipient JIDs |

**Example:**

```json
{
  "fromJid": "628123456789@s.whatsapp.net",
  "messageId": "3EB0ABCD1234567890",
  "toJids": [
    "628987654321@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message forwarded |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to forward message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/forward" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"fromJid":"628123456789@s.whatsapp.net","messageId":"3EB0ABCD1234567890","toJids":["628987654321@s.whatsapp.net"]}'
```

---

### ~~\[POST\] /messages/forward~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /messages/{sessionId}/forward instead. This endpoint will be removed in a future version.

**Forward message (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `fromJid` | string | ✅ Yes | Source chat JID |
| `messageId` | string | ✅ Yes | — |
| `toJids` | array of string | ✅ Yes | Recipient JIDs |

**Example:**

```json
{
  "sessionId": "string",
  "fromJid": "string",
  "messageId": "string",
  "toJids": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message forwarded |
| `400` | Invalid request (missing fields or empty recipients) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to forward message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message forwarded to 1 recipient(s)"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/forward" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","fromJid":"string","messageId":"string","toJids":["string"]}'
```

---

### \[DELETE\] /messages/{sessionId}/{jid}/{messageId}

**Delete message for everyone**

Delete message (only works for messages < 7 minutes old)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to delete message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message deleted for everyone"
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[DELETE\] /messages/delete~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use DELETE /messages/{sessionId}/{jid}/{messageId} instead. This endpoint will be removed in a future version.

**Delete message (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `messageId` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "messageId": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message deleted |
| `400` | Message too old (> 7 minutes) or missing fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to delete message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message deleted for everyone"
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/messages/delete" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","messageId":"string"}'
```

---

## 📂 Chat

### \[GET\] /chat/{sessionId}

**Get chat list with contacts**

Retrieve all contacts with last message for a session

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat list |

**Response Example (`200`):**

```json
[
  {
    "jid": "628123456789@s.whatsapp.net",
    "name": "John Doe",
    "notify": "string",
    "profilePic": "string"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chat/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /chat/{sessionId}/{jid}

**Get message history**

Fetch up to 100 messages for a chat (enriched with participant info for groups)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message history (max 100 messages) |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /chat/{sessionId}/{jid}/read

**Mark messages as read**

Mark specific messages or entire chat as read using RESTful path parameters

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session identifier |
| `jid` | path | ✅ Yes | string | URL-encoded WhatsApp JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `messageIds` | array of string | No | Optional: specific message IDs to mark as read. If not provided, marks entire chat as read |

**Example:**

```json
{
  "messageIds": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Messages marked as read |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to mark messages as read |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/read" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"messageIds":["string"]}'
```

---

### \[PUT\] /chat/{sessionId}/{jid}/archive

**Archive/unarchive chat**

Archive or unarchive a chat using RESTful path parameters

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `archive` | boolean | ✅ Yes | true to archive, false to unarchive |

**Example:**

```json
{
  "archive": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat archived/unarchived |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to archive/unarchive chat |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Chat archived"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/archive" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"archive":true}'
```

---

### \[PUT\] /chat/{sessionId}/{jid}/mute

**Mute/unmute chat**

Mute chat with optional duration (default 8 hours)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `mute` | boolean | ✅ Yes | — |
| `duration` | integer | No | Duration in seconds (default: 8 hours) |

**Example:**

```json
{
  "mute": true,
  "duration": 3600
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat muted/unmuted |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to mute/unmute chat |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Chat muted"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/mute" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"mute":true,"duration":3600}'
```

---

### \[PUT\] /chat/{sessionId}/{jid}/pin

**Pin/unpin chat**

Pin or unpin a chat

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `pin` | boolean | ✅ Yes | — |

**Example:**

```json
{
  "pin": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat pinned/unpinned |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to pin/unpin chat |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Chat pinned"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/pin" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"pin":true}'
```

---

### \[POST\] /chat/{sessionId}/{jid}/presence

**Send presence (typing/recording)**

Send presence status (typing, recording, online, etc.) to a chat

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `presence` | string | ✅ Yes | **Options:** `composing`, `recording`, `paused`, `available`, `unavailable` |

**Example:**

```json
{
  "presence": "composing"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Presence sent |
| `400` | Missing required fields or invalid presence |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send presence |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Presence 'composing' sent to 628123456789@s.whatsapp.net"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/presence" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"presence":"composing"}'
```

---

### \[POST\] /chat/{sessionId}/{jid}/profile-picture

**Get profile picture URL**

Get profile picture URL for a contact or group

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile picture URL |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to fetch profile picture |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `jid` | string | No | — |
| `profilePicUrl` | string, nullable | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "jid": "628123456789@s.whatsapp.net",
  "profilePicUrl": "https://pps.whatsapp.net/...",
  "message": "No profile picture found"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/profile-picture" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /chat/{sessionId}/check

**Check if numbers exist on WhatsApp**

Validate phone numbers (max 50 per request)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `numbers` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "numbers": [
    "628123456789",
    "628987654321"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Validation results |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to check numbers |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `results` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "results": [
    {
      "number": "string",
      "exists": true,
      "jid": "string",
      "error": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/check" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"numbers":["628123456789","628987654321"]}'
```

---

### ~~\[POST\] /chat/check~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /chat/{sessionId}/check instead. This endpoint will be removed in a future version.

**Check numbers (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `numbers` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "numbers": [
    "628123456789",
    "628987654321"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Validation results |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `results` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "results": [
    {
      "number": "string",
      "exists": true,
      "jid": "string",
      "error": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/check" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","numbers":["628123456789","628987654321"]}'
```

---

### ~~\[PUT\] /chat/read~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /chat/{sessionId}/{jid}/read instead. This endpoint will be removed in a future version.

**Mark messages as read (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `messageIds` | array of string | No | Optional: specific message IDs to mark |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "messageIds": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Marked as read |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/read" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","messageIds":["string"]}'
```

---

### ~~\[PUT\] /chat/archive~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /chat/{sessionId}/{jid}/archive instead. This endpoint will be removed in a future version.

**Archive/unarchive chat (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `archive` | boolean | ✅ Yes | true to archive, false to unarchive |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "archive": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat archived/unarchived |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/archive" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","archive":true}'
```

---

### ~~\[PUT\] /chat/mute~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /chat/{sessionId}/{jid}/mute instead. This endpoint will be removed in a future version.

**Mute/unmute chat (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `mute` | boolean | ✅ Yes | — |
| `duration` | integer | No | Duration in seconds (default: 8 hours) |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "mute": true,
  "duration": 3600
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat muted/unmuted |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/mute" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","mute":true,"duration":3600}'
```

---

### ~~\[PUT\] /chat/pin~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /chat/{sessionId}/{jid}/pin instead. This endpoint will be removed in a future version.

**Pin/unpin chat (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `pin` | boolean | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "pin": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat pinned/unpinned |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/pin" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","pin":true}'
```

---

### ~~\[POST\] /chat/presence~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /chat/{sessionId}/{jid}/presence instead. This endpoint will be removed in a future version.

**Send presence (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `presence` | string | ✅ Yes | **Options:** `composing`, `recording`, `paused`, `available`, `unavailable` |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "presence": "composing"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Presence sent |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/presence" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","presence":"composing"}'
```

---

### ~~\[POST\] /chat/profile-picture~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /chat/{sessionId}/{jid}/profile-picture instead. This endpoint will be removed in a future version.

**Get profile picture URL (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile picture URL |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `jid` | string | No | — |
| `profilePicUrl` | string, nullable | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "jid": "string",
  "profilePicUrl": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/profile-picture" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string"}'
```

---

## 📂 Groups

### \[GET\] /groups/{sessionId}

**List all groups**

Get all groups associated with the session

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of groups |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Resource not found |
| `500` | Failed to fetch groups |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "subject": "string",
    "desc": "string",
    "owner": "string",
    "size": 0,
    "participants": [
      {
        "id": "string",
        "admin": "string"
      }
    ]
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /groups~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /groups/{sessionId} instead. This endpoint will be removed in a future version.

**List all groups (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of groups |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /groups/{sessionId}/create

**Create new group**

Create a new group with specified participants

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `subject` | string | ✅ Yes | — |
| `participants` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "subject": "VIP Customers",
  "participants": [
    "628123456789@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group created |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create group |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `group` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "group": {
    "id": "string",
    "subject": "string",
    "desc": "string",
    "owner": "string",
    "size": 0,
    "participants": [
      {
        "id": "string",
        "admin": "string"
      }
    ]
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/session-01/create" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"subject":"VIP Customers","participants":["628123456789@s.whatsapp.net"]}'
```

---

### ~~\[POST\] /groups/create~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /groups/{sessionId}/create instead. This endpoint will be removed in a future version.

**Create new group (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `subject` | string | ✅ Yes | — |
| `participants` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "subject": "VIP Customers",
  "participants": [
    "628123456789@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group created |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/create" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","subject":"VIP Customers","participants":["628123456789@s.whatsapp.net"]}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/subject

**Update group subject**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `subject` | string | ✅ Yes | — |

**Example:**

```json
{
  "subject": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Subject updated |
| `400` | Invalid subject |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update subject |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `subject` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "subject": "string"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/subject" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"subject":"string"}'
```

---

### \[PUT\] /groups/{jid}/subject

**Update group name**

Update group subject (max 100 characters, requires admin)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | URL-encoded group JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `subject` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "subject": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Subject updated |
| `400` | Invalid request (missing fields or subject too long) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update group subject |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `subject` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Group subject updated successfully",
  "subject": "New Subject"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/subject" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","subject":"string"}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/members

**Manage group members**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `action` | string | ✅ Yes | **Options:** `add`, `remove`, `promote`, `demote` |
| `participants` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "action": "add",
  "participants": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Members updated |
| `400` | Invalid action |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update members |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `result` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "result": [
    {
      "text": "Hello from WA-AKG!"
    }
  ]
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/members" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action":"add","participants":["string"]}'
```

---

### ~~\[PUT\] /groups/{jid}/members~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /groups/{sessionId}/{jid}/members instead. This endpoint will be removed in a future version.

**Manage group members (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `action` | string | ✅ Yes | **Options:** `add`, `remove`, `promote`, `demote` |
| `participants` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "action": "add",
  "participants": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Members updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/members" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","action":"add","participants":["string"]}'
```

---

### \[GET\] /groups/{sessionId}/{jid}/invite

**Get invite code**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Invite code |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to get code |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `inviteCode` | string | No | — |
| `inviteUrl` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "inviteCode": "string",
  "inviteUrl": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/invite" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /groups/{sessionId}/{jid}/invite

**Revoke invite code**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Invite revoked |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to revoke code |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `newInviteCode` | string | No | — |
| `inviteUrl` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "newInviteCode": "string",
  "inviteUrl": "string"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/invite" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /groups/{jid}/invite~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /groups/{sessionId}/{jid}/invite instead. This endpoint will be removed in a future version.

**Get invite code (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Invite code |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `inviteCode` | string | No | — |
| `inviteUrl` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "inviteCode": "string",
  "inviteUrl": "https://chat.whatsapp.com/AbCdEfGh"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/invite?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PUT\] /groups/{jid}/invite~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /groups/{sessionId}/{jid}/invite instead. This endpoint will be removed in a future version.

**Revoke invite code (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Invite code revoked, new code generated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/invite" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string"}'
```

---

### \[GET\] /groups/{sessionId}/{jid}

**Get group details**

Get detailed group information

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group details |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Resource not found |
| `500` | Failed to fetch details |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `subjectOwner` | string | No | — |
| `subjectTime` | number | No | — |
| `desc` | string | No | — |
| `descOwner` | string | No | — |
| `descId` | string | No | — |
| `owner` | string | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "subject": "string",
  "subjectOwner": "string",
  "subjectTime": 0,
  "desc": "string",
  "descOwner": "string",
  "descId": "string",
  "owner": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /groups/{jid}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /groups/{sessionId}/{jid} instead. This endpoint will be removed in a future version.

**Get group details (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group details |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Group not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `subjectOwner` | string | No | — |
| `subjectTime` | integer | No | — |
| `size` | integer | No | — |
| `creation` | integer | No | — |
| `owner` | string | No | — |
| `desc` | string | No | — |
| `descId` | string | No | — |
| `restrict` | boolean | No | — |
| `announce` | boolean | No | — |
| `participants` | array of object | No | — |
| `ephemeralDuration` | integer | No | — |
| `inviteCode` | string | No | — |
| `pictureUrl` | string, nullable | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "subject": "string",
  "subjectOwner": "string",
  "subjectTime": 0,
  "size": 0,
  "creation": 0,
  "owner": "string",
  "desc": "string",
  "descId": "string",
  "restrict": true,
  "announce": true,
  "participants": [
    {
      "id": "string",
      "admin": "string"
    }
  ],
  "ephemeralDuration": 0,
  "inviteCode": "string",
  "pictureUrl": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/628123456789@s.whatsapp.net?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /groups/{jid}/leave

**Leave group**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Left group |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/leave" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string"}'
```

---

### \[POST\] /groups/{sessionId}/invite/accept

**Accept group invite**

Join a group using an invite code

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `inviteCode` | string | ✅ Yes | — |

**Example:**

```json
{
  "inviteCode": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group invite accepted |
| `400` | Invalid/Expired code |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to accept invite |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `groupJid` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "groupJid": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/session-01/invite/accept" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"string"}'
```

---

### ~~\[POST\] /groups/invite/accept~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /groups/{sessionId}/invite/accept instead. This endpoint will be removed in a future version.

**Accept group invite (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `inviteCode` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "inviteCode": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group invite accepted |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/invite/accept" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","inviteCode":"string"}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/picture

**Update group picture**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |

**Example:**

```json
{
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[DELETE\] /groups/{sessionId}/{jid}/picture

**Remove group picture**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture removed |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/picture" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PUT\] /groups/{jid}/picture~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /groups/{sessionId}/{jid}/picture instead. This endpoint will be removed in a future version.

**Update group picture (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | No | — |
| `file` | string (binary) | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### ~~\[DELETE\] /groups/{jid}/picture~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use DELETE /groups/{sessionId}/{jid}/picture instead. This endpoint will be removed in a future version.

**Remove group picture (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture removed |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/picture?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /groups/{sessionId}/{jid}/settings

**Update group settings**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `setting` | string | ✅ Yes | announcement (admins only send), not_announcement (all send), locked (admins only edit), unlocked (all edit) **Options:** `announcement`, `not_announcement`, `locked`, `unlocked` |
| `value` | boolean | No | Ignored but required |

**Example:**

```json
{
  "setting": "announcement",
  "value": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/settings" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"setting":"announcement","value":true}'
```

---

### ~~\[PUT\] /groups/{jid}/settings~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /groups/{sessionId}/{jid}/settings instead. This endpoint will be removed in a future version.

**Update group settings (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `setting` | string | ✅ Yes | announcement (admins only send), not_announcement (all send), locked (admins only edit), unlocked (all edit) **Options:** `announcement`, `not_announcement`, `locked`, `unlocked` |
| `value` | boolean | ✅ Yes | Ignored but required |

**Example:**

```json
{
  "sessionId": "string",
  "setting": "announcement",
  "value": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/settings" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","setting":"announcement","value":true}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/description

**Update group description**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `description` | string | No | — |

**Example:**

```json
{
  "description": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Description updated |
| `400` | Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `description` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "description": "string"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/description" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"description":"string"}'
```

---

### ~~\[PUT\] /groups/{jid}/description~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /groups/{sessionId}/{jid}/description instead. This endpoint will be removed in a future version.

**Update group description (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `description` | string | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "description": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group description updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/description" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","description":"string"}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/ephemeral

**Toggle disappearing messages**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expiration` | integer | ✅ Yes | **Options:** `0`, `86400`, `604800`, `7776000` |

**Example:**

```json
{
  "expiration": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Ephemeral toggled |
| `400` | Invalid expiration |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to toggle |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `expiration` | integer | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "expiration": 0
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/ephemeral" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"expiration":0}'
```

---

### ~~\[PUT\] /groups/{jid}/ephemeral~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /groups/{sessionId}/{jid}/ephemeral instead. This endpoint will be removed in a future version.

**Toggle disappearing messages (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `expiration` | integer | ✅ Yes | 0 (off), 86400 (24h), 604800 (7d), 7776000 (90d) **Options:** `0`, `86400`, `604800`, `7776000` |

**Example:**

```json
{
  "sessionId": "string",
  "expiration": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Ephemeral settings updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/ephemeral" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","expiration":0}'
```

---

## 📂 Contacts

### \[GET\] /contacts/{sessionId}

**List contacts**

Get all contacts with search and pagination

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `page` | query | No | integer | **Default:** `1` |
| `limit` | query | No | integer | **Default:** `10` |
| `search` | query | No | string | Search by name, notify, jid |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Paginated contacts |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `data` | array of object | No | — |
| `meta` | object | No | — |

**Response Example (`200`):**

```json
{
  "data": [
    {
      "jid": "628123456789@s.whatsapp.net",
      "name": "John Doe",
      "notify": "string",
      "profilePic": "string"
    }
  ],
  "meta": {
    "total": 0,
    "page": 0,
    "limit": 0,
    "totalPages": 0
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/contacts/session-01?page=value&limit=value&search=value" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /contacts~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /contacts/{sessionId} instead. This endpoint will be removed in a future version.

**List contacts (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |
| `page` | query | No | integer | **Default:** `1` |
| `limit` | query | No | integer | **Default:** `10` |
| `search` | query | No | string | Search by name, notify, jid |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Paginated contacts |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `data` | array of object | No | — |
| `meta` | object | No | — |

**Response Example (`200`):**

```json
{
  "data": [
    {
      "jid": "628123456789@s.whatsapp.net",
      "name": "John Doe",
      "notify": "string",
      "profilePic": "string"
    }
  ],
  "meta": {
    "total": 0,
    "page": 0,
    "limit": 0,
    "totalPages": 0
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/contacts?sessionId=session-01&page=value&limit=value&search=value" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /contacts/{sessionId}/{jid}/block

**Block contact**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact blocked |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to block contact |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/contacts/session-01/628123456789@s.whatsapp.net/block" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /contacts/block~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /contacts/{sessionId}/{jid}/block instead. This endpoint will be removed in a future version.

**Block contact (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact blocked |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/contacts/block" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string"}'
```

---

### \[POST\] /contacts/{sessionId}/{jid}/unblock

**Unblock contact**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact unblocked |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to unblock contact |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/contacts/session-01/628123456789@s.whatsapp.net/unblock" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /contacts/unblock~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /contacts/{sessionId}/{jid}/unblock instead. This endpoint will be removed in a future version.

**Unblock contact (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact unblocked |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/contacts/unblock" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string"}'
```

---

## 📂 Profile

### \[GET\] /profile/{sessionId}

**Get own profile**

Fetch profile information of the connected WhatsApp account

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile info |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `jid` | string | No | — |
| `status` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "jid": "string",
  "status": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/profile/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /profile/{sessionId}/name

**Update profile name**

Update the WhatsApp display name (max 25 chars)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |

**Example:**

```json
{
  "name": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Name updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/session-01/name" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string"}'
```

---

### \[PUT\] /profile/{sessionId}/status

**Update profile status**

Update the WhatsApp about/status (max 139 chars)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | string | ✅ Yes | — |

**Example:**

```json
{
  "status": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Status updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/session-01/status" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"status":"string"}'
```

---

### \[PUT\] /profile/{sessionId}/picture

**Update profile picture**

Upload a new profile picture

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |

**Example:**

```json
{
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/session-01/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[DELETE\] /profile/{sessionId}/picture

**Remove profile picture**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture removed |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/profile/session-01/picture" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PUT\] /profile/name~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /profile/{sessionId}/name instead.

**Update profile name (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `name` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "name": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile name updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/name" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","name":"string"}'
```

---

### ~~\[PUT\] /profile/status~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /profile/{sessionId}/status instead.

**Update profile status (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `status` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "status": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile status updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/status" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","status":"string"}'
```

---

### ~~\[PUT\] /profile/picture~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /profile/{sessionId}/picture instead.

**Update profile picture (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `file` | string (binary) | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile picture updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### ~~\[DELETE\] /profile/picture~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use DELETE /profile/{sessionId}/picture instead.

**Remove profile picture (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile picture removed |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/profile/picture?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /profile~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /profile/{sessionId} instead.

**Get own profile (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile information |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/profile?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Auto Reply

### \[GET\] /autoreplies/{sessionId}

**List auto-reply rules**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of auto-reply rules |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/autoreplies/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /autoreplies/{sessionId}

**Create auto-reply rule**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keyword` | string | ✅ Yes | — |
| `response` | string | ✅ Yes | — |
| `matchType` | string | No | **Options:** `EXACT`, `CONTAINS`, `STARTS_WITH`, `REGEX` |
| `isMedia` | boolean | No | — |
| `mediaUrl` | string | No | — |
| `triggerType` | string | No | **Options:** `ALL`, `GROUP`, `PRIVATE` |

**Example:**

```json
{
  "keyword": "hello",
  "response": "Hi there! How can I help?",
  "matchType": "EXACT",
  "triggerType": "ALL",
  "isMedia": false
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule created |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/autoreplies/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"hello","response":"Hi there! How can I help?","matchType":"EXACT","triggerType":"ALL","isMedia":false}'
```

---

### \[PUT\] /autoreplies/{sessionId}/{replyId}

**Update auto-reply rule**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `replyId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keyword` | string | ✅ Yes | — |
| `response` | string | ✅ Yes | — |
| `isMedia` | boolean | No | — |
| `mediaUrl` | string | No | — |
| `triggerType` | string | No | **Options:** `ALL`, `GROUP`, `PRIVATE` |

**Example:**

```json
{
  "keyword": "hello",
  "response": "Hi there! How can I help?",
  "matchType": "EXACT",
  "triggerType": "ALL",
  "isMedia": false
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Rule not found |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/autoreplies/session-01/reply_01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"hello","response":"Hi there! How can I help?","matchType":"EXACT","triggerType":"ALL","isMedia":false}'
```

---

### \[DELETE\] /autoreplies/{sessionId}/{replyId}

**Delete auto-reply rule**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `replyId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Rule not found |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/autoreplies/session-01/reply_01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /autoreplies~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /autoreplies/{sessionId} instead.

**List auto-reply rules (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of auto-reply rules |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/autoreplies?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /autoreplies~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /autoreplies/{sessionId} instead.

**Create auto-reply rule (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `keyword` | string | ✅ Yes | — |
| `response` | string | ✅ Yes | — |
| `matchType` | string | No | **Options:** `EXACT`, `CONTAINS`, `STARTS_WITH` **Default:** `EXACT` |

**Example:**

```json
{
  "sessionId": "string",
  "keyword": "price",
  "response": "Our prices start at $10",
  "matchType": "EXACT"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule created |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/autoreplies" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","keyword":"price","response":"Our prices start at $10","matchType":"EXACT"}'
```

---

### ~~\[GET\] /autoreplies/{id}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /autoreplies/{sessionId}/{replyId} instead.

**Get auto-reply rule (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Auto-reply rule details |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/autoreplies/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PUT\] /autoreplies/{id}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** No direct replacement yet, delete and recreate.

**Update auto-reply rule (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keyword` | string | No | — |
| `response` | string | No | — |
| `matchType` | string | No | **Options:** `EXACT`, `CONTAINS`, `STARTS_WITH` |

**Example:**

```json
{
  "keyword": "string",
  "response": "string",
  "matchType": "EXACT"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/autoreplies/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"string","response":"string","matchType":"EXACT"}'
```

---

### ~~\[DELETE\] /autoreplies/{id}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use DELETE /autoreplies/{sessionId}/{replyId} instead.

**Delete auto-reply rule (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule deleted |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/autoreplies/abc123" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Scheduler

### \[GET\] /scheduler/{sessionId}

**List scheduled messages**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of scheduled messages |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/scheduler/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /scheduler/{sessionId}

**Create scheduled message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | — |
| `sendAt` | string (date-time) | ✅ Yes | — |
| `mediaUrl` | string | No | — |
| `mediaType` | string | No | **Options:** `image`, `video`, `document` |

**Example:**

```json
{
  "jid": "628123456789@s.whatsapp.net",
  "content": "Reminder: Meeting in 10 mins",
  "sendAt": "2024-12-25T10:00:00.000Z",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Scheduled message created |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/scheduler/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"jid":"628123456789@s.whatsapp.net","content":"Reminder: Meeting in 10 mins","sendAt":"2024-12-25T10:00:00.000Z","mediaUrl":"https://example.com/image.jpg","mediaType":"image"}'
```

---

### \[PUT\] /scheduler/{sessionId}/{scheduleId}

**Update scheduled message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `scheduleId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | — |
| `sendAt` | string (date-time) | ✅ Yes | — |
| `mediaUrl` | string | No | — |
| `mediaType` | string | No | **Options:** `image`, `video`, `document` |

**Example:**

```json
{
  "jid": "628123456789@s.whatsapp.net",
  "content": "Updated meeting reminder",
  "sendAt": "2024-12-25T11:00:00.000Z",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Message not found |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/scheduler/session-01/sched_01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"jid":"628123456789@s.whatsapp.net","content":"Updated meeting reminder","sendAt":"2024-12-25T11:00:00.000Z","mediaUrl":"https://example.com/image.jpg","mediaType":"image"}'
```

---

### \[DELETE\] /scheduler/{sessionId}/{scheduleId}

**Delete scheduled message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `scheduleId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Message not found |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/scheduler/session-01/sched_01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /scheduler~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /scheduler/{sessionId} instead.

**List scheduled messages (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of scheduled messages |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |
| `500` | Internal Server Error |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "sessionId": "string",
    "jid": "string",
    "content": "string",
    "sendAt": "2026-01-15T08:00:00.000Z",
    "status": "PENDING"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/scheduler?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /scheduler~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /scheduler/{sessionId} instead.

**Schedule message (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `jid` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | — |
| `sendAt` | string (date-time) | ✅ Yes | — |
| `mediaUrl` | string, nullable | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "jid": "string",
  "content": "string",
  "sendAt": "2024-01-18T10:00:00",
  "mediaUrl": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message scheduled |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `jid` | string | No | — |
| `content` | string | No | — |
| `sendAt` | string (date-time) | No | — |
| `status` | string | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "sessionId": "string",
  "jid": "string",
  "content": "string",
  "sendAt": "2026-01-15T08:00:00.000Z",
  "status": "PENDING"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/scheduler" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","jid":"string","content":"string","sendAt":"2024-01-18T10:00:00","mediaUrl":"string"}'
```

---

### ~~\[DELETE\] /scheduler/{id}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use DELETE /scheduler/{sessionId}/{scheduleId} instead.

**Delete scheduled message (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Scheduled message deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Message not found |
| `500` | Internal server error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/scheduler/abc123" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Webhooks

### \[GET\] /webhooks/{sessionId}

**List webhooks for a session**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of webhooks |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/webhooks/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /webhooks/{sessionId}

**Create a webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `url` | string | ✅ Yes | — |
| `secret` | string | No | — |
| `events` | array of string | ✅ Yes | Events to subscribe to: `message.received`, `message.sent`, `message.status`, `connection.update`, `group.update`, `contact.update`, `status.update`, `group.participant`, `message.deleted`, `message.edited` or `*` |

**Example:**

```json
{
  "name": "string",
  "url": "string",
  "secret": "string",
  "events": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook created |
| `400` | Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/webhooks/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","url":"string","secret":"string","events":["string"]}'
```

---

### \[PUT\] /webhooks/{sessionId}/{id}

**Update webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `url` | string | No | — |
| `secret` | string | No | — |
| `events` | array of string | No | — |
| `isActive` | boolean | No | — |

**Example:**

```json
{
  "name": "string",
  "url": "string",
  "secret": "string",
  "events": [
    "string"
  ],
  "isActive": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Webhook not found |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/webhooks/session-01/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","url":"string","secret":"string","events":["string"],"isActive":true}'
```

---

### \[DELETE\] /webhooks/{sessionId}/{id}

**Delete webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Webhook not found |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/webhooks/session-01/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[GET\] /webhooks~~

> ⚠️ **DEPRECATED** — 

**List webhooks (DEPRECATED)**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of webhooks |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/webhooks" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /webhooks~~

> ⚠️ **DEPRECATED** — 

**Create webhook (DEPRECATED)**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook created |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/webhooks" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PATCH\] /webhooks/{id}~~

> ⚠️ **DEPRECATED** — 

**Update webhook (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `url` | string (uri) | No | — |
| `secret` | string | No | — |
| `sessionId` | string | No | — |
| `events` | array of string | No | — |
| `isActive` | boolean | No | — |

**Example:**

```json
{
  "name": "string",
  "url": "string",
  "secret": "string",
  "sessionId": "string",
  "events": [
    "string"
  ],
  "isActive": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook updated |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Webhook not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `url` | string | No | — |
| `secret` | string | No | — |
| `events` | array of string | No | — |
| `isActive` | boolean | No | — |
| `sessionId` | string | No | — |
| `userId` | string | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "name": "string",
  "url": "string",
  "secret": "string",
  "events": [
    "string"
  ],
  "isActive": true,
  "sessionId": "string",
  "userId": "string",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/webhooks/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","url":"string","secret":"string","sessionId":"string","events":["string"],"isActive":true}'
```

---

### \[DELETE\] /webhooks/{id}

**Delete webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Webhook not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/webhooks/abc123" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Users

### \[GET\] /users

**List users (SUPERADMIN only)**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of users |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Internal Server Error |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "_count": {
      "sessions": 0
    }
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/users" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /users

**Create user (SUPERADMIN only)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `email` | string (email) | ✅ Yes | — |
| `password` | string | ✅ Yes | — |
| `role` | string | No | **Options:** `SUPERADMIN`, `OWNER`, `STAFF` **Default:** `OWNER` |

**Example:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "SUPERADMIN"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User created |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `email` | string | No | — |
| `role` | string | No | — |
| `createdAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "createdAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","email":"string","password":"string","role":"SUPERADMIN"}'
```

---

### \[PATCH\] /users/{id}

**Update user (SUPERADMIN only)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `email` | string | No | — |
| `password` | string | No | — |
| `role` | string | No | **Options:** `SUPERADMIN`, `OWNER`, `STAFF` |

**Example:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "SUPERADMIN"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User updated |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | User not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `user` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "emailVerified": "string",
    "image": "string",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-15T08:00:00.000Z"
  }
}
```

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/users/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","email":"string","password":"string","role":"SUPERADMIN"}'
```

---

### \[DELETE\] /users/{id}

**Delete user (SUPERADMIN only)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | User not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/users/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /user/api-key

**Get current API key**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Current API key |
| `401` | Unauthorized - Invalid or missing API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | string, nullable | No | — |

**Response Example (`200`):**

```json
{
  "apiKey": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/user/api-key" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /user/api-key

**Generate new API key**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | New API key generated |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Failed to generate API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | string | No | — |

**Response Example (`200`):**

```json
{
  "apiKey": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/user/api-key" \
  -H "X-API-Key: your-api-key"
```

---

### \[DELETE\] /user/api-key

**Revoke API key**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | API key revoked |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Failed to revoke API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/user/api-key" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Labels

### \[GET\] /labels/{sessionId}

**List labels**

Get all labels with chat count

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of labels |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `labels` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "labels": [
    {
      "id": "string",
      "name": "string",
      "color": 0,
      "predefinedId": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/labels/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /labels/{sessionId}

**Create label**

Create new label with color (0-19 index)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `color` | integer | No | Color index (0-19) |

**Example:**

```json
{
  "name": "Important",
  "color": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label created |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create label |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `label` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "label": {
    "id": "string",
    "name": "string",
    "color": 0,
    "predefinedId": "string"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/labels/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Important","color":0}'
```

---

### ~~\[GET\] /labels~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /labels/{sessionId} instead.

**List all labels (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of labels |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/labels?sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[POST\] /labels~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use POST /labels/{sessionId} instead.

**Create label (DEPRECATED)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `name` | string | ✅ Yes | — |
| `color` | integer | No | — |

**Example:**

```json
{
  "sessionId": "string",
  "name": "string",
  "color": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label created |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/labels" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","name":"string","color":0}'
```

---

### \[PUT\] /labels/{sessionId}/{labelId}

**Update label**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `labelId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `color` | integer | No | — |

**Example:**

```json
{
  "name": "string",
  "color": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label updated |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `label` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "label": {
    "id": "string",
    "name": "string",
    "color": 0,
    "predefinedId": "string"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/session-01/label_01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","color":0}'
```

---

### \[DELETE\] /labels/{sessionId}/{labelId}

**Delete label**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `labelId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label deleted |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/labels/session-01/label_01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PUT\] /labels/{id}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /labels/{sessionId}/{labelId} instead.

**Update label (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `color` | integer | No | — |

**Example:**

```json
{
  "name": "string",
  "color": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","color":0}'
```

---

### ~~\[DELETE\] /labels/{id}~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use DELETE /labels/{sessionId}/{labelId} instead.

**Delete label (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label deleted |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/labels/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /labels/{sessionId}/chat/{jid}/labels

**Get chat labels**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat labels |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `labels` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "labels": [
    {
      "id": "string",
      "name": "string",
      "color": 0,
      "predefinedId": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/labels/session-01/chat/628123456789@s.whatsapp.net/labels" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /labels/{sessionId}/chat/{jid}/labels

**Update chat labels**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `labelIds` | array of string | ✅ Yes | — |
| `action` | string | ✅ Yes | **Options:** `add`, `remove` |

**Example:**

```json
{
  "labelIds": [
    "string"
  ],
  "action": "add"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat labels updated |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `labels` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "labels": [
    {
      "id": "string",
      "name": "string",
      "color": 0,
      "predefinedId": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/session-01/chat/628123456789@s.whatsapp.net/labels" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"labelIds":["string"],"action":"add"}'
```

---

### ~~\[GET\] /labels/chat-labels~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use GET /labels/{sessionId}/chat/{jid}/labels instead.

**Get chat labels (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | query | ✅ Yes | string | — |
| `sessionId` | query | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat labels |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/labels/chat-labels?jid=628123456789@s.whatsapp.net&sessionId=session-01" \
  -H "X-API-Key: your-api-key"
```

---

### ~~\[PUT\] /labels/chat-labels~~

> ⚠️ **DEPRECATED** — **DEPRECATED:** Use PUT /labels/{sessionId}/chat/{jid}/labels instead.

**Add or remove labels from chat (DEPRECATED)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | query | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `labelIds` | array of string | ✅ Yes | — |
| `action` | string | ✅ Yes | **Options:** `add`, `remove` |

**Example:**

```json
{
  "sessionId": "string",
  "labelIds": [
    "string"
  ],
  "action": "add"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat labels updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/chat-labels?jid=628123456789@s.whatsapp.net" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","labelIds":["string"],"action":"add"}'
```

---

### \[GET\] /chats/{sessionId}/by-label/{labelId}

**Get chats by label**

Get all chats associated with a specific label

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `labelId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of chats with label |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Label not found |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `label` | object | No | — |
| `chats` | array of string | No | — |
| `count` | integer | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "label": {
    "text": "Hello from WA-AKG!"
  },
  "chats": [
    "string"
  ],
  "count": 0
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chats/session-01/by-label/label_01" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Notifications

### \[GET\] /notifications

**List notifications**

Get the last 50 notifications for the authenticated user

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of notifications |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error fetching notifications |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "userId": "string",
    "title": "string",
    "message": "string",
    "type": "string",
    "href": "string",
    "read": true,
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/notifications" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /notifications

**Create notification**

Send a notification to a specific user or broadcast to all (Superadmin only)

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | ✅ Yes | — |
| `message` | string | ✅ Yes | — |
| `type` | string | No | **Options:** `INFO`, `SUCCESS`, `WARNING`, `ERROR` **Default:** `INFO` |
| `href` | string | No | — |
| `targetUserId` | string | No | Target user UUID |
| `broadcast` | boolean | No | **Default:** `false` |

**Example:**

```json
{
  "title": "Maintenance",
  "message": "System update in 5 minutes",
  "type": "INFO",
  "href": "/settings",
  "targetUserId": "string",
  "broadcast": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Notification created |
| `400` | Invalid request |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Error creating notification |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `count` | integer | No | Number of users notified if broadcast |

**Response Example (`200`):**

```json
{
  "success": true,
  "count": 0
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/notifications" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"Maintenance","message":"System update in 5 minutes","type":"INFO","href":"/settings","targetUserId":"string","broadcast":true}'
```

---

### \[PATCH\] /notifications/read

**Mark notifications as read**

Mark specific or all notifications as read for the authenticated user

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ids` | array of string | No | Array of notification IDs. If omitted or empty, all notifications are marked as read. |

**Example:**

```json
{
  "ids": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Notifications updated |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error updating notifications |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/notifications/read" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"ids":["string"]}'
```

---

### \[DELETE\] /notifications/delete

**Delete specific notification**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | query | ✅ Yes | string | Notification UUID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Notification deleted |
| `400` | Notification ID required |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error deleting notification |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/notifications/delete?id=abc123" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 System

### \[GET\] /settings/system

**Get system settings**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | System settings |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `appName` | string | No | — |
| `logoUrl` | string | No | — |
| `timezone` | string | No | — |

**Response Example (`200`):**

```json
{
  "id": "default",
  "appName": "WA-AKG",
  "logoUrl": "https://example.com/logo.png",
  "timezone": "Asia/Jakarta"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/settings/system" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /settings/system

**Update system settings**

Update global system configuration (Superadmin/Owner only)

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `appName` | string | No | — |
| `logoUrl` | string | No | — |
| `timezone` | string | No | — |

**Example:**

```json
{
  "appName": "string",
  "logoUrl": "string",
  "timezone": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Failed to update settings |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `appName` | string | No | — |
| `logoUrl` | string | No | — |
| `timezone` | string | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "appName": "string",
  "logoUrl": "string",
  "timezone": "string",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/settings/system" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"appName":"string","logoUrl":"string","timezone":"string"}'
```

---

### \[POST\] /status/{sessionId}/update

**Update status**

Post a status update (story) to WhatsApp. Supports text, image, and video.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `content` | string | ✅ Yes | Status text or caption |
| `type` | string | No | **Options:** `TEXT`, `IMAGE`, `VIDEO` **Default:** `TEXT` |
| `mediaUrl` | string | No | Required for IMAGE and VIDEO |
| `backgroundColor` | integer | No | — |
| `font` | integer | No | — |
| `mentions` | array of string | No | — |

**Example:**

```json
{
  "content": "string",
  "type": "TEXT",
  "mediaUrl": "string",
  "backgroundColor": 0,
  "font": 0,
  "mentions": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Status posted |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/status/session-01/update" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"content":"string","type":"TEXT","mediaUrl":"string","backgroundColor":0,"font":0,"mentions":["string"]}'
```

---

### \[POST\] /status/update

**Update status**

Post a status update (story) to WhatsApp. Supports text, image, and video.

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | Status text or caption |
| `type` | string | No | **Options:** `TEXT`, `IMAGE`, `VIDEO` **Default:** `TEXT` |
| `mediaUrl` | string | No | Required for IMAGE and VIDEO |
| `backgroundColor` | integer | No | ARGB color for TEXT status |
| `font` | integer | No | Font style for TEXT status |
| `mentions` | array of string | No | List of JIDs to mention/tag in the status |

**Example:**

```json
{
  "sessionId": "string",
  "content": "string",
  "type": "TEXT",
  "mediaUrl": "string",
  "backgroundColor": 0,
  "font": 0,
  "mentions": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Status updated |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to post status |
| `503` | Session not ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/status/update" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","content":"string","type":"TEXT","mediaUrl":"string","backgroundColor":0,"font":0,"mentions":["string"]}'
```

---

### \[POST\] /system/check-updates

**Check for updates**

Checks for new releases on GitHub and creates a system notification if a newer version is available.

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Check results |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error checking updates |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `version` | string | No | Latest version tag |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "version": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/system/check-updates" \
  -H "X-API-Key: your-api-key"
```

---

## 📦 Schemas

### Error

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `error` | string | No | — |

**Example:**

```json
{
  "status": false,
  "message": "Error occurred",
  "error": "Detailed error info"
}
```

### Success

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Example:**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

### Session

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `sessionId` | string | No | — |
| `status` | string | No | **Options:** `Connected`, `Disconnected`, `Connecting` |
| `userId` | string | No | — |
| `botConfig` | object, nullable | No | — |
| `webhooks` | array of object | No | — |
| `_count` | object, nullable | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Example:**

```json
{
  "id": "clx123abc",
  "name": "Marketing Bot",
  "sessionId": "marketing-1",
  "status": "Connected",
  "userId": "string",
  "botConfig": {
    "text": "Hello from WA-AKG!"
  },
  "webhooks": [
    {
      "text": "Hello from WA-AKG!"
    }
  ],
  "_count": {
    "contacts": 0,
    "messages": 0,
    "groups": 0,
    "autoReplies": 0,
    "scheduledMessages": 0
  },
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

### Message

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | string | No | — |

**Example:**

```json
{
  "text": "Hello! How can I help you?"
}
```

### Contact

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | No | — |
| `name` | string | No | — |
| `notify` | string | No | — |
| `profilePic` | string, nullable | No | — |

**Example:**

```json
{
  "jid": "628123456789@s.whatsapp.net",
  "name": "John Doe",
  "notify": "string",
  "profilePic": "string"
}
```

### ScheduledMessage

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `jid` | string | No | — |
| `content` | string | No | — |
| `sendAt` | string (date-time) | No | — |
| `status` | string | No | — |

**Example:**

```json
{
  "id": "string",
  "sessionId": "string",
  "jid": "string",
  "content": "string",
  "sendAt": "2026-01-15T08:00:00.000Z",
  "status": "PENDING"
}
```

### Webhook

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `url` | string | No | — |
| `events` | array of string | No | — |
| `secret` | string | No | — |

**Example:**

```json
{
  "id": "string",
  "sessionId": "string",
  "url": "string",
  "events": [
    "string"
  ],
  "secret": "string"
}
```

### Group

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `desc` | string | No | — |
| `owner` | string | No | — |
| `size` | number | No | — |
| `participants` | array of object | No | — |

**Example:**

```json
{
  "id": "string",
  "subject": "string",
  "desc": "string",
  "owner": "string",
  "size": 0,
  "participants": [
    {
      "id": "string",
      "admin": "string"
    }
  ]
}
```

### Label

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `color` | number, nullable | No | — |
| `predefinedId` | string, nullable | No | — |

**Example:**

```json
{
  "id": "string",
  "name": "string",
  "color": 0,
  "predefinedId": "string"
}
```

### GroupDetails

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `subjectOwner` | string | No | — |
| `subjectTime` | number | No | — |
| `desc` | string | No | — |
| `descOwner` | string | No | — |
| `descId` | string | No | — |
| `owner` | string | No | — |

**Example:**

```json
{
  "id": "string",
  "subject": "string",
  "subjectOwner": "string",
  "subjectTime": 0,
  "desc": "string",
  "descOwner": "string",
  "descId": "string",
  "owner": "string"
}
```

