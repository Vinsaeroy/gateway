## [v1.5.4] - 2026-05-21

### Added
- **Docker Integration**: Added a multi-stage `Dockerfile` to package and build the Next.js web application.
- **Dynamic Timezone Settings**: Replaced hardcoded timezone selections in settings with dynamically generated list options fetched using browser `Intl` APIs.
- **Modals for Editing Operations**: Shifted editing interfaces (for webhooks, scheduler, labels, and auto-replies) from inline forms to modal dialog popups (`Dialog` components) for cleaner and decoupled creation/modification workflows.

### Fixed
- **Security Hardening**:
  - Prevented IDOR (Insecure Direct Object Reference) exploits across Webhooks (PUT/DELETE), Scheduler (PUT), and System Monitor GET endpoints by enforcing session ownership constraints.
  - Eliminated raw SQL querying (`queryRawUnsafe`) inside the Anti-Spam module, replacing it with secure, type-safe Prisma Client APIs.
- **Media Messaging with Captions**: Patched Baileys media sending by downloading web-based media URLs to buffers and passing them with appropriate normalized caption metadata.
- **UI/UX Refinements**:
  - Redesigned the topbar Session Selector dropdown with connection status badges, visual styling, and mobile responsiveness.
  - Restricted navigation visibility on the Sidebar to hide menu items that are not permitted for the user's role.
  - Fixed unbalanced JSX tags in bot settings page and type safety issues in navigation item filters.

---

## [v1.5.3.3] - 2026-04-19

### Fixed
- **Newsletter Media Native Patch**: Migrated from custom manual `patch-baileys.js` script to the standardized `patch-package` system. This makes the newsletter media unencrypted download fix (which resolves the persistent "HTTP 400 Bad Request" when downloading WhatsApp Channel media) native to the package manager, ensuring it safely persists across future `npm install` or deployment cycles.

---

## [v1.5.3.2] - 2026-04-19

### Fixed
- **[CRITICAL] Newsletter Media Upload Endpoint Failure**: Fixed an insidious ES6 Arrow Function scope binding bug in Baileys (`arguments[1].newsletter`) that caused Newsletter media payloads to bypass the `/newsletter/newsletter-*` CDN routes. All uploads are now guaranteed to travel through the unencrypted Channel CDN pipeline instead of the standard encrypted pathways, eliminating the `400 Bad Request` downloads.
- **Mobile Client PNG Crash Recovery**: Added rigid server-side validation to the Media API, strictly blocking PNGs/non-JPEG formats on WhatsApp Channels. The API now gracefully returns an explicit UI error notification since the mobile WhatsApp UI natively crashes/rejects non-JPEG payloads injected directly to the channel unencrypted CDN.
- **Webhook Connection Destructuring Error**: Removed unstable `sock.requestMediaConn()` function calls causing `500 Server Error` webhook panics during media retrieval failovers.

---

## [v1.5.3.1] - 2026-04-18

### Fixed
- **Newsletter Media Webhook Crash**: Fixed a critical issue where sending unencrypted media to a WhatsApp Newsletter would crash the webhook (`Cannot derive from empty media key`) by securely downloading the unencrypted file straight from the WhatsApp MMG servers using its `directPath`.
- **Newsletter Media (Error 479) & Silent Failure**: Overhauled the Baileys patch script to fully implement official PR `#2434` fixes for WhatsApp Newsletters. The robust RegEx-powered `postinstall` patch now correctly redirects uploads to `/newsletter/newsletter-*` paths, appends `server_thumb_gen=1`, enforces `url: null` for unencrypted objects, maps proper thumbnail hashes, and sets `mediatype` nodes. This fully resolves the mysterious "Error 479" ACK rejections and silent failures when sending media to channels.

---

## [v1.5.3] - 2026-04-08
### Added
- **WhatsApp Communities Support**: Added `isCommunity` and `linkedParentJid` to Group metadata schema, including automatic recognition and storage of Community structures during Group synchronization.
- **Advanced Webhook Events**: Added `group.update`, `group.participant`, `message.edited`, and `message.deleted` events for real-time tracking of precise WhatsApp actions.
- **Drag and Drop Media**: Added intuitive Drag and Drop overlay to the Chat Window for instant image, video, audio, and document uploads.
- **Media Download Enhancements**: Enhanced Media layout in Chat Window with "Download" buttons and an interactive "Downloading..." notification toaster UI.
- **Shared Session Webhooks**: Webhooks are now universally dispatched to all users with shared `SessionAccess`, instead of only the original session owner.
- **Labels Chat Assignment**: Enhanced Labels page with expandable cards showing assigned chats, and a contact picker to assign/unassign chats from labels.
- **Label Chats API**: New `GET /api/labels/[sessionId]/chats?labelId=` endpoint to fetch chats assigned to a label with contact name enrichment.

### Changed
- **Beautiful Console Logger**: Replaced all standard `console.log` and `console.error` calls across the core backend engine with a custom colored `logger` module.

### Fixed
- **Dashboard Webhooks UI**: Added missing `message.edited`, `message.deleted`, and `group.participant` events to the available webhook subscriptions list.
- **Initial Sync Message Disappearance**: Fixed a bug where initial messages in newly created chats were skipped when wrapped inside protocol messages (like edit/revoke types).
- **Missing Group Names in Chat List**: `ChatService.getChatsList` now natively fetches from the `Group` model so group chats don't appear as blank phone numbers.
- **Chat History Pagination**: Fixed a UI bug where the Chat Window would load the oldest 100 messages instead of newest ones. Corrected `.us` vs `.net` JID mismatches for real-time WebSockets.
- **Dashboard Disconnect Stats**: Perfected System Monitor Disconnected counts to properly group anything other than `CONNECTED` (e.g. `LOGGED_OUT`, `SCAN_QR`) as disconnected, accurately pulling from DB history when offline.
- **Pushed Names in Private Chats**: Prevented sender push names from rendering above chat bubbles in private Direct Messages (now strictly restricted to Group Chats).
- **Mobile Responsiveness Enhancements**: 
    - Replaced `<p>` with `<SheetDescription>` in mobile nav to fix Radix UI accessibility warnings.
    - Hidden clock and divider on small screens, reduced session selector width.
    - Made Session Detail Page Header responsive with flex-wrap for mobile.
- **Contacts Page Pagination**: Replaced unreasonable limit options (up to 3000) with 10/25/50/100/Show All options limit API parameters.

---

## [v1.5.3-beta.3] - 2026-04-08

### Fixed
- **Dashboard Webhooks UI**: Added missing `message.edited`, `message.deleted`, and `group.participant` events to the available webhook subscriptions list to ensure full parity with the actual events triggered by the backend engine.

---

## [v1.5.3-beta.2] - 2026-04-03

### Added
- **WhatsApp Communities Support**:
    - Added `isCommunity` and `linkedParentJid` to Group metadata schema.
    - Automatic recognition and storage of Community structures during Group synchronization.
- **Advanced Webhook Events**:
    - Added `group.update` event (triggered on subject, description, or group picture changes).
    - Added `group.participant` event (triggered when users join, leave, or are promoted/demoted).
    - Added `message.edited` and `message.deleted` (revoke) events for real-time tracking of message modifications.
- **Drag and Drop Media**:
    - Added intuitive Drag and Drop overlay to the Chat Window for instant image, video, audio, and document uploads.
- **Media Download Enhancements**:
    - Enhanced Media layout in Chat Window with generic "Download" buttons for Images, Videos, Audio, and Documents.
    - Added an interactive "Downloading..." notification toaster UI.
- **Shared Session Webhooks**:
    - Webhooks are now universally dispatched to all users with shared `SessionAccess`, instead of only the original session owner.

### Fixed
- **Initial Sync Message Disappearance**:
    - Fixed a bug where initial messages in newly created chats were completely skipped because Baileys wrapped them inside protocol messages (like edit/revoke types). 
- **Missing Group Names in Chat List**:
    - Fixed an issue where group chats appeared as blank phone numbers in the Chat List dashboard. `ChatService.getChatsList` now natively fetches from the `Group` model for accurate subject rendering.
- **Chat History Pagination**:
    - Fixed a UI bug where the Chat Window would load the **oldest 100 messages** instead of the newest ones (`orderBy` timestamp was ascending). Newest messages now load reliably.
    - Corrected real-time WebSocket `.us` vs `.net` JID inconsistencies so incoming messages snap exactly into active windows.
- **Dashboard Disconnect Stats**:
    - Perfected System Monitor Disconnected counts: Everything *other* than `CONNECTED` (e.g. `LOGGED_OUT`, `SCAN_QR`) is now logically grouped as disconnected.
- **Pushed Names in Private Chats**:
    - Prevented sender push names from rendering above chat bubbles in private Direct Messages (now strictly restricted to Group Chats).

---

## [v1.5.3-beta.1] - 2026-03-22

### Fixed
- **SheetContent Accessibility Warning**: Replaced `<p>` with `<SheetDescription>` in mobile nav to fix Radix `aria-describedby` warning.
- **Navbar Overflow on Mobile**: Hidden clock and divider on small screens, reduced session selector width.
- **Session Detail Page Header**: Made responsive with flex-wrap for mobile.
- **Disconnect Stats Returning Zeros**: System monitor API now queries real DB counts even when session is offline.
- **Contacts Page Pagination**: Replaced unreasonable limit options (up to 3000) with 10/25/50/100/Show All. API now supports `limit=all`.

### Added
- **Labels Chat Assignment**: Enhanced Labels page with expandable cards showing assigned chats, contact picker to assign/unassign chats from labels.
- **Label Chats API**: New `GET /api/labels/[sessionId]/chats?labelId=` endpoint to fetch chats assigned to a label with contact name enrichment.

### Changed
- **Beautiful Console Logger**: Replaced all standard `console.log`, `console.warn`, and `console.error` calls across the core WhatsApp engine, socket server, background jobs, and utility modules with a custom colored `logger`. This makes server logs much more readable and debugging significantly easier.

---

## [v1.5.2.1] - 2026-03-22

### Fixed
- **Mobile Sidebar Navigation Out of Sync**:
    - Synced mobile sidebar (`mobile-nav.tsx`) to match desktop sidebar (`sidebar-nav.tsx`).
    - Added missing pages: **Labels**, **Bot Profile**, **Session Access**.
    - Moved **Sessions / QR** from Administration to Main group.
    - Moved **Auto Reply** from Messaging to Automation group.
    - Fixed icon mismatches (Auto Reply now uses `MessageCircleReply` icon on both mobile and desktop).

---

## [v1.5.2] - 2026-03-20

### Added
- **Session Access Sharing**:
    - Session owners can now grant access to other registered users, allowing them to view and use the session without full ownership.
    - New Dashboard page (`/dashboard/sessions/access`) to manage shared access per session.
    - Quick "Share" button on each session card in Session Manager for fast access.
    - New API endpoints:
        - `GET /api/sessions/{sessionId}/access` — List users with shared access.
        - `POST /api/sessions/{sessionId}/access` — Grant access by email.
        - `DELETE /api/sessions/{sessionId}/access` — Revoke access by userId.
    - Sidebar navigation entry "Session Access" added under Administration group.
    - Security: Only session owners and SUPERADMINs can manage access. Prevents self-grant, owner-grant, and SUPERADMIN-grant.
    - Revoke access action requires AlertDialog confirmation for safety.
- **Broadcast Progress Monitoring**:
    - Real-time progress panel on Broadcast page showing Sent / Failed / Waiting counts.
    - Live animated progress bar with percentage indicator.
    - Current recipient tracking and error log display for failed messages.
    - Socket.IO `broadcast.progress` event emission from both broadcast API routes.
- **Profile Management Page** (`/dashboard/profile`):
    - View and edit WhatsApp Display Name, Status (About), and Profile Picture.
    - New API routes: `GET /api/profile/[sessionId]`, `PUT .../name`, `PUT .../status`, `PUT/DELETE .../picture`.
- **Labels Management Page** (`/dashboard/labels`):
    - Create, view, and delete WhatsApp labels from the dashboard.
- **Chat Service Module** (`src/modules/whatsapp/chat.service.ts`):
    - Centralized chat logic (getChatsList, getMessages, sendTextMessage, sendMediaMessage) to eliminate code duplication across Server Actions and API routes.
- **JID Normalization Utility**:
    - New `normalizeJid()` function in `jid-utils.ts` that standardizes `@c.us` → `@s.whatsapp.net`.
    - Applied consistently across Message storage, Contact upsert, and ChatService queries.

### Fixed
- **Chat List Not Syncing**:
    - Fixed JID mismatch between Contact table (`@c.us`/`@lid`) and Message table (`@s.whatsapp.net`) that caused chats to not appear.
    - Socket.IO `message.update` now serializes `timestamp` as ISO string instead of raw `Date` object.
    - Added `useRef`-based JID tracking in ChatList for reliable new-chat detection via socket events.
    - Added 800ms delay before refetching messages after send to allow Baileys to process `messages.upsert`.
- **Session Stats Showing 0**:
    - Fixed System Monitor API (`/api/system/monitor/[sessionId]`) to resolve session slug to database CUID before counting Contacts, Chats, and Messages.
- **Profile Page "Failed to load"**:
    - Implemented missing backend API routes for fetching WhatsApp profile data (name, status, picture) via Baileys socket methods.
- **Duplicate Sidebar Links**:
    - Removed redundant navigation entries for Auto Reply, Broadcasts, Contacts, and Groups.
- **Labels Page Syntax Errors**:
    - Fixed escaped backtick characters and missing imports that prevented the Labels page from compiling.

### Changed
- **Auth System (`api-auth.ts`)**:
    - `canAccessSession()` now checks `SessionAccess` records in addition to ownership.
    - `getAccessibleSessions()` now returns both owned and shared sessions for non-SUPERADMIN users.
    - New `isSessionOwner()` helper to distinguish ownership from shared access (used for protecting management endpoints).
- **Socket.IO Debug Logging**: Added detailed `[Socket]` console logs for `message.update` emissions showing keyId, remoteJid, and fromMe for easier debugging.
- **ChatWindow**: Media send now uses the same delayed-refresh pattern as text send for consistency.

### Database
- **New Model**: `SessionAccess` — many-to-many relationship between `User` and `Session` with cascade delete and unique `[sessionId, userId]` constraint.

---

## [v1.5.2-beta.2] - 2026-03-20

### Added
- **Session Access Sharing**:
    - Session owners can now grant access to other registered users, allowing them to view and use the session without full ownership.
    - New Dashboard page (`/dashboard/sessions/access`) to manage shared access per session.
    - New API endpoints:
        - `GET /api/sessions/{sessionId}/access` — List users with shared access.
        - `POST /api/sessions/{sessionId}/access` — Grant access by email.
        - `DELETE /api/sessions/{sessionId}/access` — Revoke access by userId.
    - Sidebar navigation entry "Session Access" added under Administration group.
    - Security: Only session owners and SUPERADMINs can manage access. Prevents self-grant, owner-grant, and SUPERADMIN-grant.
    - Revoke access action requires AlertDialog confirmation for safety.

### Changed
- **Auth System (`api-auth.ts`)**:
    - `canAccessSession()` now checks `SessionAccess` records in addition to ownership.
    - `getAccessibleSessions()` now returns both owned and shared sessions for non-SUPERADMIN users.
    - New `isSessionOwner()` helper to distinguish ownership from shared access (used for protecting management endpoints).

### Database
- **New Model**: `SessionAccess` — many-to-many relationship between `User` and `Session` with cascade delete and unique `[sessionId, userId]` constraint.

---

## [v1.5.2-beta.1] - 2026-03-15

### Added
- **Broadcast Progress Monitoring**:
    - Real-time progress panel on Broadcast page showing Sent / Failed / Waiting counts.
    - Live animated progress bar with percentage indicator.
    - Current recipient tracking and error log display for failed messages.
    - Socket.IO `broadcast.progress` event emission from both broadcast API routes.
- **Profile Management Page** (`/dashboard/profile`):
    - View and edit WhatsApp Display Name, Status (About), and Profile Picture.
    - New API routes: `GET /api/profile/[sessionId]`, `PUT .../name`, `PUT .../status`, `PUT/DELETE .../picture`.
- **Labels Management Page** (`/dashboard/labels`):
    - Create, view, and delete WhatsApp labels from the dashboard.
- **Chat Service Module** (`src/modules/whatsapp/chat.service.ts`):
    - Centralized chat logic (getChatsList, getMessages, sendTextMessage, sendMediaMessage) to eliminate code duplication across Server Actions and API routes.
- **JID Normalization Utility**:
    - New `normalizeJid()` function in `jid-utils.ts` that standardizes `@c.us` → `@s.whatsapp.net`.
    - Applied consistently across Message storage, Contact upsert, and ChatService queries.

### Fixed
- **Chat List Not Syncing**:
    - Fixed JID mismatch between Contact table (`@c.us`/`@lid`) and Message table (`@s.whatsapp.net`) that caused chats to not appear.
    - Socket.IO `message.update` now serializes `timestamp` as ISO string instead of raw `Date` object.
    - Added `useRef`-based JID tracking in ChatList for reliable new-chat detection via socket events.
    - Added 800ms delay before refetching messages after send to allow Baileys to process `messages.upsert`.
- **Session Stats Showing 0**:
    - Fixed System Monitor API (`/api/system/monitor/[sessionId]`) to resolve session slug to database CUID before counting Contacts, Chats, and Messages.
- **Profile Page "Failed to load"**:
    - Implemented missing backend API routes for fetching WhatsApp profile data (name, status, picture) via Baileys socket methods.
- **Duplicate Sidebar Links**:
    - Removed redundant navigation entries for Auto Reply, Broadcasts, Contacts, and Groups.
- **Labels Page Syntax Errors**:
    - Fixed escaped backtick characters and missing imports that prevented the Labels page from compiling.

### Changed
- **Socket.IO Debug Logging**: Added detailed `[Socket]` console logs for `message.update` emissions showing keyId, remoteJid, and fromMe for easier debugging.
- **ChatWindow**: Media send now uses the same delayed-refresh pattern as text send for consistency.

---

## [v1.5.1] - 2026-03-03

### Added
- **Global System Resource Monitoring**:
    - Centralized "System Monitor" dashboard for Superadmins to track CPU (Live & Per-core), RAM, Disk, and Network health.
    - Detailed process-level memory tracking (Heap/RSS) for the Node.js application.
- **Per-Session Health Monitoring**: 
    - Live Baileys socket ping/latency and connection uptime integrated directly into Session Detail pages.
- **Anti-Ban Protection (Anti-Spam Rate Limit)**:
    - High-performance message queue system to prevent WhatsApp account bans.
    - Configurable per-session thresholds, randomized delays, and FIFO message sequence management.
- **Improved Administration UI**:
    - Added security warnings on login/dashboard if Public Registration is enabled.
    - Sidebar navigation overhaul for better feature grouping (Messaging, Automation, Administration).
    - New dashboard controls for Command Prefix and Max Sticker Duration.
- **WhatsApp Pairing Code Connection**:
    - Support for linking WhatsApp accounts via 8-character pairing codes as an alternative to QR scanning.
    - Integrated "Link with Phone Number" UI in Session Detail page with one-click copy support.
    - Optimized browser identification for maximum compatibility with WhatsApp's pairing system.
- **Message View & Media Download**:
    - Fixed individual chat message visibility issues by standardizing API response structures.
    - Added one-click Media Download buttons for Image, Video, Audio, and Document messages in the Chat Window.
- **Standardization**: RESTful API path parameter standardization using `[sessionId]` and a consistent `{ status, message, data }` response format.

### Changed
- **SEO & Accessibility**: Introduced `NEXT_PUBLIC_ALLOW_INDEXING` toggle to control global search engine crawling (Default: noindex).
- **Alert System Overhaul**: Replaced intrusive browser `alert()` and `confirm()` calls with modern Sonner Toasts and Radix UI dialogs.
- **Mobile-First Responsiveness**: Comprehensive design update for 12+ dashboard pages to ensure flawless mobile viewing (tabs, headers, and grids).
- **Socket Reliability**: Refactored socket status detection for always-accurate "CONNECTED" reporting via readyState investigation.

### Fixed
- **Next.js 15 Compatibility**: Resolved critical TypeScript errors with Promise-wrapped route params.
- **JID Normalization**: Standardized mapping of `@lid` (Linked Device) to phone `@s.whatsapp.net` across Webhooks, Store, and UI.
- **JID Encoding**: Fixed 404 router errors caused by unencoded `@` symbols in API documentation examples.
- **Anti-Spam Stability**: Fixed socket wrapper preservation during session re-initialization.

---

## [v1.5.1-beta.3] - 2026-03-03

### Changed
- **SEO Accessibility**: Introduced `NEXT_PUBLIC_ALLOW_INDEXING` setting handling global HTML page bots indexing (Default: noindex/nofollow).
- **Admin Dashboard Layout**: Added proactive visual warnings on Dashboard entry for Superadmins alerting when Public Registration is globally enabled to safeguard deployment environments.
- **Improved Auth Consistency**: Standardized RESTful authentication validation, blocking users from listing user data or inspecting elements belonging to unowned session IDs via endpoints like `/api/contacts/route`.

---

## [v1.5.1-beta.2] - 2026-03-02

### Added
- **Global System Resource Monitoring**:
    - New Dashboard page (`/dashboard/system-monitor`) for Superadmins to monitor host server health.
    - Real-time CPU Load (Total & Per-Core breakdown).
    - System RAM vs Node.js Process Memory (Heap/RSS) tracking.
    - Network Traffic monitoring (Live RX/TX bytes per second).
    - Disk Usage tracking for all mounted partitions.
    - Automatic 3-second polling for live updates.
- **Per-Session Health Monitoring**:
    - Integrated real-time metrics into the Session Detail page.
    - **Connection Ping**: Monitors Baileys socket state and latency.
    - **Session Uptime**: Displays exactly how long the session has been connected.
    - **Message Store Stats**: Placeholders for tracking in-memory Baileys store (Contacts, Chats, Messages).
- **Administration & UI Features**:
    - Added "System Monitor" to the sidebar navigation (restricted to SUPERADMIN).
    - Replaced the "Auto Reply" quick action card on the Dashboard with "System Monitor".
    - Consolidated mobile menu navigation to precisely match the desktop sidebar's appearance and icon layout.

### Optimized
- **Mobile-First Responsiveness**:
    - Long system details like OS Distro and Session Uptime now automatically truncate with ellipsis to prevent screen overflow on narrow devices.
    - **Battery & Memory Optimization**: The System Monitor page uses the `Visibility API` to instantly pause real-time polling (every 3s) whenever the browser tab is hidden or minimized, preserving battery life and background resources.

### Fixed
- **Next.js 15 Compatibility**: Fixed TypeScript errors related to `Promise`-wrapped `params` in dynamic API routes.
- **Auth Logic**: Standardized backend auth to use `@/lib/api-auth` across all new monitoring endpoints.
- **Socket Reliability**: Improved socket state detection for `CONNECTED` sessions by accessing the underlying `ws.readyState`.

### Technical
- **New Dependencies**: Added `systeminformation` for OS metrics and `@radix-ui/react-progress` for UI components.
- **UI Components**: Manually implemented `src/components/ui/progress.tsx` due to environment-specific CLI issues.

---

## [v1.5.1-beta.1] - 2026-03-02

### Added
- **Anti-Ban Protection (Anti-Spam Rate Limit)**:
    - Per-session message queue system to prevent WhatsApp from detecting spam and banning accounts.
    - Configurable **Messages Threshold**, **Time Window**, **Min Delay**, and **Max Delay** via Bot Settings.
    - FIFO queue ensures messages are sent in order with randomized delays between sends.
    - Applies to **all** outgoing messages universally: bot replies, auto-replies, broadcasts, scheduled messages, and API calls.
    - Detailed console logging with queue status, message types, delay info, and estimated send times:
        - `📥 QUEUED` — Message enters the queue with position number.
        - `⏳ DELAY` — Rate limit reached, showing delay duration and queue depth.
        - `✅ SENDING/INSTANT` — Message dispatched with total wait time.
    - Config cached for 10 seconds to avoid excessive database queries.
    - Uses raw SQL queries for maximum compatibility (no Prisma client regeneration required).
- **Configurable Bot Command Prefix**:
    - New setting in Bot Settings to change the bot command prefix (default `#`, max 3 characters).
    - `command-handler.ts` now reads prefix from database instead of hardcoded value.
    - Menu command dynamically displays the configured prefix.
- **Max Sticker Duration UI**:
    - Added slider control (3–30 seconds) in Bot Settings for `maxStickerDuration`.
    - Previously only configurable via database — now accessible in the dashboard.

### Changed
- **Alert System Overhaul**:
    - Replaced native `alert()` in Broadcast page with `toast.error()` from Sonner.
    - Replaced native `confirm()` in Media page with AlertDialog for file deletion.
    - Added AlertDialog confirmation for API key regeneration in Webhooks page.
- **Mobile Responsiveness**:
    - Applied responsive design patterns across 12 dashboard pages: Groups, Scheduler, Auto Reply, Broadcast, Sticker, Users, Notifications, Webhooks, Settings, Bot Settings, API Docs, and Contacts.
    - Headers wrap on mobile (`flex-col sm:flex-row`), form grids stack (`grid-cols-1 sm:grid-cols-2`), dialog widths constrained, font sizes adjusted.
- **API Documentation Refactor**:
    - Standardized all response schemas in `API_DOCUMENTATION.md` to reflect the new `{ status: boolean, message: string, data: object }` format instead of the legacy `{ success: boolean }`.
    - Enriched the Session GET documentation to show `botConfig`, `webhooks`, and `_count` relationships.

### Fixed
- **API Quick Reference Bug**: Fixed completely outdated REST API endpoints in the Python and Node.js examples (e.g., changing `/api/chat/send` to `/api/messages/{sessionId}/{jid}/send`).
- **JID Encoding in Docs**: Added explicit `@` symbol URL encoding (`%40s.whatsapp.net`) to code examples to prevent 404 router errors.
- **Swagger UI Warning**: Suppressed `UNSAFE_componentWillReceiveProps` console warning from `ModelCollapse` component in Swagger UI page.
- **Anti-Spam Reliability**: Fixed socket wrapping being lost on reconnection — now wraps `sendMessage` inline in `init()` so it persists across session reconnects.
- **Prisma Schema**: Added `prefix`, `antiSpamEnabled`, `spamLimit`, `spamInterval`, `spamDelayMin`, `spamDelayMax` fields to `BotConfig` model.

---

## [v1.5.0] - 2026-02-26

### Added
- **Collapsible Sidebar**:
    - Desktop sidebar can now be minimized to icon-only mode (260px ↔ 72px).
    - Tooltips on each menu item when collapsed for quick identification.
    - Collapse state persisted in `localStorage` across page navigations.
    - Smooth CSS transitions on width, brand logo, and user footer.
    - New `SidebarProvider` context and `SidebarShell` client component architecture.
- **Chat UI Overhaul**:
    - **Search Bar**: Filter chats by name or phone number in real-time.
    - **WhatsApp-style List**: Borderless items with hover states, left accent on selected chat.
    - **Smart Previews**: Message preview up to 45 characters, media type icons (📎 Image, Video, etc.).
    - **Relative Time Labels**: Shows "Yesterday", "Mon", "Feb 12" instead of raw timestamps.
    - **Date Separators**: "Today", "Yesterday", or full date between message groups.
    - **Rounded Bubbles**: WhatsApp-style message bubbles with tail shape and inline timestamps.
    - **Dotted Background**: Subtle dot pattern in chat window for visual depth.
    - **Mobile Back Button**: Integrated back button in chat header for mobile navigation.
    - **Colored Attachment Menu**: Each media type has a distinct color icon.
- **Media Management Page** (`/dashboard/media`):
    - Per-user access control — users only see media from their own sessions.
    - Grouped view: files organized by **Session** → **Sender/From** (collapsible sections).
    - Sender info enriched from database (pushName, senderJid via batch keyId lookup).
    - Stats cards: total storage size, file count, images, and media breakdown.
    - Search and filter by type, filename, session, or sender name.
    - Grid view with image thumbnails and file metadata.
    - Multi-select and bulk delete with per-group "Select All".
    - Full-screen image preview modal.
    - SUPERADMIN sees all sessions' media; other users see only their own.
- **Media Security API**:
    - `GET /api/media` — List media files with sender metadata, filtered by session ownership.
    - `GET /api/media/[filename]` — Serve media with session ownership check.
    - `DELETE /api/media` — Bulk delete with per-file session ownership verification.
- **Shared JID Utilities**: New `src/lib/jid-utils.ts` module with `resolveToPhoneJid()`, `batchResolveToPhoneJid()`, and `isLidJid()` for consistent JID handling across the entire codebase.
- **Tooltip UI Component**: Added `@radix-ui/react-tooltip` dependency and `src/components/ui/tooltip.tsx`.

### Security
- **Media Storage Hardened**: Moved media files from `public/media/` (publicly accessible) to `data/media/` (private, requires authentication to access via API).
- **Middleware Bypass Fixed**: Removed dangerous `pathname.startsWith("/media")` and `pathname.includes(".")` rules that allowed unauthenticated access to media files and any URL containing a dot.
- **Media API Secured**: `GET /api/media/[filename]` now requires `getAuthenticatedUser()` (session or API key). Added `path.resolve()` check to prevent directory traversal attacks.
- **Media Session Ownership**: All media endpoints enforce `canAccessSession()` — users can only view, serve, and delete media belonging to their own sessions.
- **Security Headers**: Added `X-Content-Type-Options: nosniff` and `Cache-Control: private` to media responses.
- **Default Catch-All**: Middleware now requires authentication for all unmatched routes instead of passing through.

### Fixed
- **Media Sender Collision**: Fixed an issue where WhatsApp `keyId` collisions across different sessions caused media files to be grouped under the wrong sender ("Unknown"). The grouping API now requires an exact match on both `sessionId` and `keyId`.
- **Media Grouping UI**: Cleaned up the 3-level media grouping UI (User > Session > Sender) to use distinct cards with better padding and clear visual hierarchy, replacing the messy nested indents.
- **JID Consistency (Webhooks)**: Webhook payloads (`from`, `sender`, `participant`) now always use `@s.whatsapp.net` format instead of `@lid`. Uses a three-tier resolution: inline `remoteJidAlt` → DB Contact lookup → fallback.
- **JID Consistency (Web UI)**: Chat list API now batch-resolves `@lid` JIDs to phone numbers before responding, ensuring the UI always displays `@s.whatsapp.net` format.
- **JID Consistency (Message Store)**: `processAndSaveMessage` now normalizes `remoteJid` and `senderJid` before writing to the database, preventing `@lid` from being stored.
- **Chat List Overflow**: Fixed long text in chat list items expanding horizontally; now properly truncated with ellipsis.
- **Session Path Parameter**: Renamed API route folder from `sessions/[id]` to `sessions/[sessionId]` for consistency with all other endpoints. Updated all 5 route handlers and API docs page.

### Changed
- **Dashboard Layout**: Lighter ambient background gradients, tighter padding on mobile (`p-3`), cleaner overall feel.
- **Webhook Refactor**: Removed duplicated `resolveToPhoneJid` and `isLidJid` from `webhook.ts` — now imports from shared `jid-utils.ts`.
- **API Docs Page**: Session endpoints now correctly show `[sessionId]` instead of `[id]` in path and parameter descriptions.

---

## [v1.4.1] - 2026-02-21

### Added
- **Registration Toggle**: Super Admins can now enable or disable new user registrations directly from the dashboard settings.
- **Dynamic Auth UI**: Login and Register pages now reflect the live registration status, gracefully hiding forms or links when registration is disabled by an administrator.

### Changed
- Registration API now respects the global `enableRegistration` setting flag.

## [v1.4.0] - 2026-02-21

### Added
- **Dashboard UI Overhaul**:
    - **Grouped Sidebar Navigation**: Organizes features into logical sections (Messaging, Contacts, Automation, Developer, Administration).
    - **Active Link Highlighting**: Sidebar now correctly highlights the current active page.
    - **Collapsible Groups**: Sidebar sections can now be collapsed/expanded for a cleaner workspace.
    - **Revamped Home Page**: Features 4 summary stat cards, a quick-actions grid, and improved session status cards with colored indicators.
    - **Modernized Layout**: Added backdrop-blur to the navbar, refined spacing, and updated all loading skeletons.
- **Star/Unstar Message**: `POST /api/messages/{sessionId}/{jid}/{messageId}/star` to star or unstar messages.
- **Message Search**: `GET /api/messages/{sessionId}/search` with full-text search, JID/type/sender filters, and pagination.

### Fixed
- **WhatsApp Web Group Replies**: Fixed an issue where quoted replies in group chats were silently dropped by WhatsApp Web's UI.
    - Resolved user-facing `sessionId` directly to the db CUID to ensure robust database lookups for the original message.
    - Mapped Linked Device IDs (`@lid`) back to standard phone number JIDs (`@s.whatsapp.net`) via the `Contact` table.
    - Enforced strict WA Web quote validation by perfectly mirroring the original message's `fromMe`, `messageTimestamp`, and `pushName`.
    - Always structured text quotes as `extendedTextMessage`.
- **API Consistency**: Refactored reply endpoints (`/api/messages/[sessionId]/[jid]/[messageId]/reply` and `/api/messages/[sessionId]/[jid]/reply`) to use the same `{ message: { text: ... }, mentions: [] }` format as the `/send` endpoint.
- **Auto Reply Bug**: Fixed `matchType` default in PUT endpoint — was `"exact"` (lowercase) but handler expects `"EXACT"` (uppercase), causing updated rules to silently stop matching.
- **Contacts Block/Unblock**: Added missing `decodeURIComponent(jid)` — JIDs with `%40` encoding were not being decoded.
- **Contacts GET Auth**: Replaced `auth()` with `getAuthenticatedUser()` + `canAccessSession()` to enable API key authentication and session-level access control.
- **Infrastructure**: Fixed Prisma binary target issues for better environment compatibility.

### Changed
- **Consistency**: Standardized `403` error messages to `"Forbidden - Cannot access this session"` across 11 route files.
- **Consistency**: Standardized validation order (auth → params → body) across all routes.
- **Cleanup**: Removed duplicate `messages/[jid]/read` route (use `chat/[jid]/read` instead).
- **Styling**: Switched sidebar from a shadow-based design to a more modern border-based aesthetic.

## [v1.3.0] - 2026-02-01

### Added
- **Granular Access Control**:
    - Introduced `BLACKLIST` mode for both Bot Commands and Auto Replies.
    - Added `botBlockedJids` and `autoReplyBlockedJids` to `BotConfig`.
    - Updated Dashboard "Bot Settings" to configure Blocked/Allowed JIDs visually.
- **Advanced Auto Reply Features**:
    - **Context Awareness**: Auto replies can now be scoped to `ALL`, `GROUP`, or `PRIVATE` chats via `triggerType`.
    - **Media Support**: Auto replies can now include media attachments (Images, Videos, Documents) via `mediaUrl` and `isMedia`.
- **Scheduler Enhancements**:
    - **Media Support**: Scheduled messages now support `image`, `video`, and `document` types.
    - **Smart JID Helpers**: Added UI dropdown to easily select recipient type (`@s.whatsapp.net`, `@g.us`, `@newsletter`).
- **Documentation**:
    - Comprehensive audit of `src/lib/swagger.ts` with complete examples for all endpoints.
    - Updated `USER_GUIDE.md` and `README.md` with new feature instructions.

### Fixed
- **Type Safety**: Resolved Prisma type definition conflicts in Auto Reply API route.
- **Stability**: Improvements to context-based message filtering logic.

## [v1.2.0] - 2026-01-18

### Added
- **Major API Refactoring & Standardization**: 
    - **RESTful Architecture**: Completely refactored core API modules to use standardized RESTful path parameters (`/api/{resource}/{sessionId}`) instead of inconsistent query/body params.
    - **Affected Modules**:
        - **Contacts**: `/api/contacts/{sessionId}`
        - **Labels**: `/api/labels/{sessionId}`
        - **Profile**: `/api/profile/{sessionId}`
        - **Scheduler**: `/api/scheduler/{sessionId}`
        - **Auto Replies**: `/api/autoreplies/{sessionId}`
        - **Groups**: `/api/groups/{sessionId}`
        - **Webhooks**: `/api/webhooks/{sessionId}`
    - **Frontend Updates**: Updated all corresponding Dashboard pages (Contacts, Scheduler, Auto Reply, Groups) to consume these new endpoints.
- **Real-time Chat Sync**:
    - Implemented Socket.IO integration for instant message updates in Chat Window and Chat List.
    - Removed legacy polling mechanisms for better performance.
    - Added auto-scroll to bottom functionality for new messages.
- **Media Sending Support**:
    - Added UI for sending Images, Videos, Audio, Documents, and Stickers via a new attachment menu.
    - Implemented new API endpoint `POST /api/messages/{sessionId}/{jid}/media`.
- **Session Manager V2**:
    - Refactored Session Manager UI to a modern Grid Layout.
    - Added support for **Custom Session IDs** during creation.
    - Improved status indicators and navigation controls.
- **Landing Page Overhaul**:
    - Redesigned landing page with SaaS-style UI, features grid, and tech stack showcase.
    - Added Dynamic Version display, Privacy Policy, and Terms of Service pages.
- **Documentation**:
    - Enhanced Sidebar with accordion navigation and search.
    - Updated `API_DOCUMENTATION.md` and `swagger.ts` with new Media API endpoint.
- **Public API Enhancements**:
    - Added `fileUrl`, `sender` (object), and `remoteJidAlt` to webhook payloads.
    - Webhooks now include detailed `quoted` message information with auto-resolved media URLs.

### Fixed
- **Chat History Sorting**: Fixed `/api/chat/[sessionId]/[jid]` to correctly fetch the latest 100 messages chronologically.
- **Session Reliability**: Fixed issues with session restarting, stopping, and logout loops.
- **Logout Logic**: Explicit logout now correctly cleans up credentials.
- **Webhook Syntax**: Resolved a critical syntax error (duplicate code block) in `src/lib/webhook.ts` that caused build failures.
- **Robustness**: Improved `extractQuotedMessage` helper to handle various message types (Group, Private) accurately.

## [beta-v1.1.0.1] - 2026-01-15

### Added
- **Contact Management**: 
    - **Contact List Page**: New Dashboard page (`/dashboard/contacts`) to view, filter, and manage synced contacts.
    - **Features**: Search by Name/JID, Session Filtering, and Configurable Pagination Limits (5 to 3000 items per page).
    - **Database**: Enhanced `Contact` model to store `lid`, `verifiedName`, `remoteJidAlt`, `profilePic`, and raw `data`.
- **UI Enhancements**:
- **Enhanced Messaging Engine**:
    - **Duplicate Filter**: Implemented robust detection to prevent duplicate message processing and auto-replies.
    - **Junk Filter**: Automatically ignores empty messages and technical protocol messages (e.g., key distribution, reactions) to keep the logs clean.
- **Improved UI Inputs**:
    - **Multiline Support**: Auto Reply and Scheduler now use Textarea inputs, allowing for longer, multi-line messages.
- **Bug Fixes**:
    - **Media Access**: Fixed middleware configuration to ensure public media files are accessible.
### Fixed
- **Build Stability**: Resolved improper UI module imports (`Table`, `Pagination`) and missing type overrides for Prisma schema changes.
- **Backend Logic**: Fixed duplicate imports in dashboard pages.

## [1.1.0] - 2026-01-13

### Added
- **Webhook Enhancements**:
    - **Raw Data**: Added `raw` field to webhook payload containing the full Baileys message object.
    - **Media Support**: Added automatic media downloading (Images, Video, etc.). Webhook now includes `fileUrl` pointing to the saved file in `public/media`.
    - **Enriched Participant Data**: For group messages, the `sender` and `participant` fields are now objects containing detailed info (`id`, `phoneNumber`, `admin`).
    - **Standardized Fields**: Added `from` (Chat JID), `sender` (Participant/User), `isGroup`, and `remoteJidAlt` (extracted from message key) fields.
- **API Response Enrichment**:
    - **Chat History API**: `/api/chat/[sessionId]/[jid]` now returns enriched `sender` details for group messages, matching the webhook format.

### Fixed
- **Webhook Logic**: Fixed issues where `from` and `sender` were ambiguous or incorrect. `from` now consistently refers to the Chat Room, and `sender` refers to the actual sender.
- **Async Handling**: Updated message store to safely handle asynchronous webhook operations without blocking.

## [1.0.7] - 2026-01-13

### Fixed
- **Frontend Webhooks**: Fixed an issue where the webhook list was empty. The dashboard now correctly matches both the Session String ID (`mysession`) and the Internal Database ID (CUID) when filtering webhooks.
## [1.0.6] - 2026-01-13

### Fixed
- **Auto Reply**: Fixed silent failure where Auto Reply would not run for new sessions due to missing `BotConfig`. Added automatic creation of default config for both new and existing sessions.
- **API `POST /api/sessions`**: Fixed issue where custom `sessionId` provided in request body was ignored. Now accepts `sessionId` correctly.
- **API `POST /api/webhooks`**: Fixed `500 Internal Server Error` when creating webhooks. The API now correctly resolves the session string ID to the database internal ID (CUID).
- **API `POST /api/system/check-updates`**: Fixed authentication issue. Now uses `getAuthenticatedUser` to allow access via API Key (previously restricted to Session Cookie only).
- **Frontend Session Selector**: Fixed issue where only "CONNECTED" sessions were listed. Now displays all sessions (Disconnected, Scanning QR, etc.) to allow management.
- **Frontend Webhooks Page**: Fixed page to respect the currently selected session in the navbar. Webhook list is now filtered by session, and creating a webhook attaches it to the active session.

### Added
- **Auto Update Check**: Implemented automatic update checking when entering the dashboard. A specific notification is created only if a new version is available.
- **Logging Configuration**: Added `BAILEYS_LOG_LEVEL` support in `.env` to configure WhatsApp Baileys logger verbosity (default: `error`).
- **Scripts**: Added `scripts/test_endpoints.sh` for verifying API endpoints via curl.

### Documentation
- **API Documentation**: Completely overwrote `docs/API_DOCUMENTATION.md` with comprehensive details for all endpoints (Chat, Groups, Broadcast, Spam, Sticker, Status, Scheduler, System). 
- **Environment**: Updated `.env.example` to include new logging configuration.
