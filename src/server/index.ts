import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { setupSocket } from "./socket";
import { waManager } from "../modules/whatsapp/manager";
import { logger } from "../lib/logger";
import pkg from "../../package.json";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3030", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      if (!req.url) return;
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error("Server", "Error handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setupSocket(io);
  // Optional: Global instance for Baileys to emit events
  (global as any).io = io;

  // Initialize WhatsApp Manager
  waManager.setup(io);
  waManager.loadSessions();

  // Start Scheduler
  import("../modules/whatsapp/scheduler").then(m => m.startScheduler());

  // Cloudflare 520 Fix: increase keep-alive timeout so Node doesn't kill idle connections that Cloudflare expects to reuse
  // See: https://github.com/vercel/next.js/issues/48962
  server.keepAliveTimeout = 120 * 1000; // 120 seconds
  server.headersTimeout = 120 * 1000; // 120 seconds

  server.listen(port, () => {
    logger.banner(pkg.name.toUpperCase(), pkg.version, port);

    // --- WA-AKG Monitor Heartbeat ---
    // Sends a ping every 30 seconds to the monitoring server
    // Hanya untuk dokumentasi ada berapa layanan WA-AKG yang aktif. 
    // Hanya untuk memantau tidak bermaksud lain. Semakin banyak WA-AKG yang aktif = semakin semangat saya mengembangkan WA-AKG ini.
    // Terima kasih telah menggunakan WA-AKG.
    const MONITOR_URL = "https://api-wa-akg.aikeigroup.net/api/ping";
    const APP_URL = process.env.BASE_URL || `http://${hostname}:${port}`; // Kamu bisa mengganti ini untuk keamanan WA-AKG kamu. Tapi jangan menghapus semua Heartbeat nya. Terima Kasih.
    const APP_NAME = process.env.APP_NAME || "WA-AKG";

    const sendHeartbeat = async () => {
      try {
        await fetch(MONITOR_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appUrl: APP_URL,
            appName: APP_NAME,
            isBackend: true,
            systemInfo: {
              platform: process.platform,
              nodeVersion: process.version,
              memoryUsage: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB"
            }
          }),
        });
      } catch (error) {
        // Silently fail to not disturb the main application
      }
    };

    // Initial ping
    sendHeartbeat();
    // Interval ping
    setInterval(sendHeartbeat, 30000);
    // --------------------------------
  });
});
