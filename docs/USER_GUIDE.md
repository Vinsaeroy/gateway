# 📖 WA-AKG User Manual

Welcome to the **WA-AKG** User Guide. This document provides step-by-step instructions on how to use the dashboard features effectively.

---

## 🚀 Quick Start: Connecting WhatsApp

Before you can use any automation features, you must link a WhatsApp account.

1.  **Add Session**: Navigate to **Sessions** and click **"Add Session"**.
2.  **ID**: Enter a unique name for your session (e.g., `sales-team`).
3.  **Scan QR**: Open WhatsApp on your phone > **Linked Devices** > **Link a Device**. Scan the code on your screen.
4.  **Wait**: Once status shows `CONNECTED`, you are ready!
5.  **Make Active**: Select your new session in the **top navigation bar** to control it.

---

## 💬 Messaging Features

### 1. Real-time Chat
- Navigate to the **Chat** module to see your recent conversations.
- Supports sending text and images.
- Use the "New Chat" button to contact a number not in your history.

### 2. Smart Scheduler
- Navigate to **Scheduler** > **New Schedule**.
- **Message Content**: Supports multi-line text.
- **Media**: Send images, videos, or documents via URL.
- **Timing**: Accurate scheduling based on your configured timezone.

### 3. Automated Responses
- Navigate to **Auto Reply**.
- Create rules based on keywords.
- **Match Types**:
  - `EXACT`: Identical match.
  - `CONTAINS`: Keyword exists anywhere in the message.
  - `STARTS_WITH`: Message begins with the keyword.
- **Media Support**: Send images or videos by providing a direct URL.
- **Context Control**: Choose to reply in **All Chats**, **Private Only**, or **Group Only**.

---

## 📢 Mass Communication

### 1. Broadcast Engine
- Send bulk messages to multiple numbers or groups.
- **Anti-Ban Protection**: The system automatically adds random delays between sends.
- **Recipients**: Paste comma-separated numbers or select a pre-synced Group.

### 2. Group Management
- View all groups your session is part of in the **Groups** tab.
- Sync group members to your local database for targetting.

---

## 🛠️ Specialized Tools

### 1. Contact Management
- Search through thousands of synced contacts instantly.
- Filter by Name, Phone Number, or JID.
- View richness details like Profile Pictures and Privacy Status.

### 2. Sticker Maker
- Upload any image and convert it to a WhatsApp sticker.
- Use the **Remove Background** toggle if you have the API key configured.

---

## ⚙️ Configuration

Check the **Settings** page to customize:
- **App Branding**: Change the dashboard name and logo.
- **Access Control**: Configure **Whitelist** or **Blacklist** for Bot Commands and Auto Replies.
- **Timezone**: Select from all standard global IANA timezones (dynamically loaded) to ensure your scheduled messages fire at the correct local hour.
- **API Keys**: Manage your secret keys for third-party integrations.

---
<div align="center">
  **Version**: 1.5.4 | **Support**: [GitHub Issues](https://github.com/vinsaeroy/WA-AKG/issues)
</div>
