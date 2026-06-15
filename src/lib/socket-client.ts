"use client";

import { io, type Socket, type ManagerOptions, type SocketOptions } from "socket.io-client";

/**
 * Create a Socket.IO client with Railway/Cloudflare-friendly defaults.
 *
 * Why these settings:
 * - `transports: ["websocket"]` + `upgrade: false`: skip HTTP long-polling,
 *   which fails behind sticky-session-less proxies (Railway free tier, Cloudflare),
 *   causing repeated 400 "session id unknown" errors in network logs.
 * - `reconnectionAttempts: Infinity`: dashboard dibuka lama-lama; jangan menyerah
 *   reconnect (kalau menyerah, status WA berhenti update → user harus refresh).
 */
export function createAppSocket(
    extra: Partial<ManagerOptions & SocketOptions> = {}
): Socket {
    return io({
        path: "/api/socket/io",
        transports: ["websocket"],
        upgrade: false,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        ...extra,
    });
}
