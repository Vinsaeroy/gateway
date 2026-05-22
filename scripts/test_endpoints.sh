#!/bin/bash

API_KEY="wag_TESTAPIKEY123"
# Production/Dev URL
BASE_URL="https://wa-akg-dev.aikeigroup.net/api"

echo "Testing APIs against: $BASE_URL"
echo "Using API Key: $API_KEY"

# Helper function for separator
sep() { echo -e "\n\n--------------------------------------------\n$1"; }

# 1. List Sessions
sep "1. GET /sessions"
curl -s -X GET "$BASE_URL/sessions" \
  -H "x-api-key: $API_KEY" | head -c 500

# 2. Create Session (Update: sessionId is optional)
sep "2. POST /sessions"
curl -s -X POST "$BASE_URL/sessions" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "API Test Session", "sessionId": "api-test-1"}' | head -c 500

# 3. List Groups (Using query param per new format, though route supports both)
sep "3. GET /groups?sessionId=api-test-1"
curl -s -X GET "$BASE_URL/groups?sessionId=api-test-1" \
  -H "x-api-key: $API_KEY" | head -c 500

# 4. Create Auto Reply
sep "4. POST /autoreplies"
curl -s -X POST "$BASE_URL/autoreplies" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "api-test-1",
    "keyword": "ping",
    "response": "pong",
    "matchType": "EXACT"
  }' | head -c 500

# 5. Create Webhook (with Session ID)
sep "5. POST /webhooks"
curl -s -X POST "$BASE_URL/webhooks" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Webhook",
    "url": "https://example.com/webhook",
    "events": ["message.upsert"],
    "sessionId": "api-test-1"
  }' | head -c 500

# 6. Post Status (New Endpoint)
sep "6. POST /status/update"
curl -s -X POST "$BASE_URL/status/update" \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "api-test-1",
    "content": "Hello via API",
    "type": "TEXT",
    "backgroundColor": 4294901760 
  }' | head -c 500

# 7. Scheduler List (New Endpoint)
sep "7. GET /scheduler"
curl -s -X GET "$BASE_URL/scheduler?sessionId=api-test-1" \
  -H "x-api-key: $API_KEY" | head -c 500

# 8. Check System Updates (Admin)
sep "8. POST /system/check-updates"
curl -s -X POST "$BASE_URL/system/check-updates" \
  -H "x-api-key: $API_KEY" | head -c 500

echo -e "\n\nDone."
