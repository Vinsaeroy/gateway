"use client";

import { useEffect } from "react";

export function UpdateChecker() {
    useEffect(() => {
        const checkUpdates = async () => {
            try {
                // Determine if we should check. Maybe check localStorage to avoid spamming every reload?
                // User said "setiap kali ada yang masuk dashboard", implying every time or session start.
                // Let's use sessionStorage to check once per browser tab session, or just fire it every time since backend handles deduplication.
                // Backend deduplication is robust (checks DB). So firing every time is fine and meets requirements.

                const res = await fetch('/api/system/check-updates', { method: 'POST' });
                const json = await res.json();
                console.log("UpdateChecker: Result", json);
            } catch (error) {
                console.error("UpdateChecker: Failed", error);
            }
        };

        checkUpdates();
    }, []);

    return null; // Invisible component
}
