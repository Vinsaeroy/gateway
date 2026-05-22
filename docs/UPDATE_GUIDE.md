# 🔄 WA-AKG Update Guide

Keep your **WA-AKG** instance up-to-date with the latest features, security patches, and performance improvements.

---

## 🚀 Standard Update Process

Follow these steps to update your application safely.

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Update Dependencies
```bash
npm install
```

### 3. Sync Database Schema
If the update includes database changes, run:
```bash
npm run db:push
```
> [!NOTE]
> For production environments requiring strict migration history, use `npx prisma migrate deploy` instead.

### 4. Build & Restart
```bash
# Build the optimized production bundle
npm run build

# Restart your process (example using PM2)
pm2 restart wa-akg
```

---

## 🏷️ Version Management

To manually bump your application version:

1.  Open `package.json`.
2.  Update the `"version"` field (e.g., `"1.1.1"` -> `"1.1.2"`).
3.  Rebuild the application.

The version number is displayed in the **Dashboard Sidebar** footer.

---

## 🛠️ Troubleshooting Updates

| Issue | Resolution |
| :--- | :--- |
| **Prisma Type Errors** | Run `npx prisma generate` to refresh the client. |
| **Build Failures** | Delete `.next` and `node_modules`, then `npm install`. |
| **API Errors** | Ensure your `.env` matches the latest requirements in `docs/ENVIRONMENT_VARIABLES.md`. |

---
<div align="center">
  **Version**: 1.1.2 | **Last Verified**: 2026-01-17
</div>
