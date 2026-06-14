// Kill-switch Service Worker — marketing app tidak memakai SW.
// Menghentikan 404 "GET /sw.js" dan membersihkan SW lama di browser.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            } catch (e) { /* ignore */ }
            try { await self.registration.unregister(); } catch (e) { /* ignore */ }
            try {
                const clients = await self.clients.matchAll({ type: "window" });
                for (const client of clients) client.navigate(client.url);
            } catch (e) { /* ignore */ }
        })()
    );
});

self.addEventListener("fetch", () => {});
