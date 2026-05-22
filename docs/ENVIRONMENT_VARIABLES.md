# 🔐 Environment Variables Guide

This document provides a comprehensive reference for all configuration options in **WA-AKG**.

> [!WARNING]
> Never commit your `.env` file to version control (Git). It contains sensitive credentials that could compromise your system.

---

## 🗄️ Database Configuration

| Variable | Required | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Yes | Connection string for MySQL or PostgreSQL. |

**Format:**
- **MySQL**: `mysql://user:pass@host:3306/db`
- **PostgreSQL**: `postgresql://user:pass@host:5432/db?schema=public`

---

## 🔐 Authentication & Security

### `AUTH_SECRET`
Used for NextAuth.js session encryption.
> [!IMPORTANT]
> Generate a strong 32-character secret using: `openssl rand -base64 32`

### `NEXTAUTH_URL`
The base URL where your application is hosted. Essential for callback redirects.
- **Dev**: `http://localhost:3000`
- **Prod**: `https://your-domain.com`

---

## 🚀 Application Settings

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | App environment (`development` | `production`). |
| `PORT` | `3000` | Port for the web server. |
| `TZ` | `UTC` | Default timezone for scheduling (e.g., `Asia/Jakarta`). |
| `LOCALE` | `en-US` | Locale for date/time formatting. |

---

## 🔌 WhatsApp Core (Baileys)

### `BAILEYS_LOG_LEVEL`
Controls the verbosity of the WhatsApp engine logs.
- **Recommended**: `error` (Prod), `debug` (Dev).
- **Values**: `trace`, `debug`, `info`, `warn`, `error`, `fatal`.

---

## 📚 Documentation & Swagger

| Variable | Default | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SWAGGER_ENABLED` | `true` | Enable/disable the `/docs` page. |
| `NEXT_PUBLIC_SWAGGER_USERNAME` | `admin` | Username for Swagger UI auth. |
| `NEXT_PUBLIC_SWAGGER_PASSWORD` | `admin123` | Password for Swagger UI auth. |

> [!CAUTION]
> Always change the default Swagger credentials or disable it entirely in production environments.

---

## 🔧 Feature Flags & Integrations

- **`REMOVE_BG_API_KEY`**: API key from [remove.bg](https://remove.bg) for automatic sticker background removal.
- **`ENABLE_NOTIFICATIONS`**: Set to `false` to silence system-wide UI alerts.
- **`ENABLE_AUTO_UPDATE_CHECK`**: Periodically checks for new version releases.

---

## 📝 Example Configuration (Production)
```env
NODE_ENV="production"
DATABASE_URL="mysql://user:pass@db-host:3306/wa_akg"
AUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="https://wa.api.com"
BAILEYS_LOG_LEVEL="error"
TZ="Asia/Jakarta"
```

---
<div align="center">
  **Last Updated**: May 2026 | **Version**: 1.5.3
</div>
