"use client";

import { io, type Socket, type ManagerOptions, type SocketOptions } from "socket.io-client";

/**
 * Create a Socket.IO client with Railway/Cloudflare-friendly defaults.
 *
 * Why these settings:
 * - `transports: ["websocket"]` + `upgrade: false`: skip HTTP long-polling,
 *   which fails behind sticky-session-less proxies (Railway free tier, Cloudflare),
 *   causing repeated 400 "session id unknown" errors in network logs.
 * - `reconnectionAttempts` capped: avoid infinite retry storms.
 */
export function createAppSocket(
    extra: Partial<ManagerOptions & SocketOptions> = {}
): Socket {
    return io({
        path: "/api/socket/io",
        transports: ["websocket"],
        upgrade: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 20000,
        ...extra,
    });
}
