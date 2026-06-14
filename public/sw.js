// ============================================================
// Kill-switch Service Worker
// ------------------------------------------------------------
// App ini TIDAK memakai service worker. File ini ada hanya untuk
// menghentikan 404 "GET /sw.js" dan membersihkan service worker
// lama yang mungkin masih terdaftar di browser (mis. dari project
// lain yang pernah jalan di origin localhost yang sama).
//
// Saat browser memuat SW ini, ia akan: hapus semua cache lama,
// unregister dirinya sendiri, lalu reload tab agar bersih.
// ============================================================

self.addEventListener("install", () => {
    // Aktifkan langsung tanpa menunggu
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            } catch (e) {
                // ignore
            }

            try {
                await self.registration.unregister();
            } catch (e) {
                // ignore
            }

            // Reload semua tab yang dikontrol agar lepas dari SW
            try {
                const clients = await self.clients.matchAll({ type: "window" });
                for (const client of clients) {
                    client.navigate(client.url);
                }
            } catch (e) {
                // ignore
            }
        })()
    );
});

// Jangan intercept request apa pun (pass-through total)
self.addEventListener("fetch", () => {});
