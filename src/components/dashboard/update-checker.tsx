"use client";

import { useEffect } from "react";

export function UpdateChecker() {
    useEffect(() => {
        const checkUpdates = async () => {
            try {
                // Only check once per day to avoid spamming GitHub API
                const lastCheck = localStorage.getItem("lastUpdateCheck");
                const now = Date.now();
                const ONE_DAY = 24 * 60 * 60 * 1000;

                if (lastCheck && (now - parseInt(lastCheck)) < ONE_DAY) {
                    return; // Already checked today
                }

                const res = await fetch('/api/system/check-updates', { method: 'POST' });
                if (res.ok) {
                    localStorage.setItem("lastUpdateCheck", String(now));
                }
            } catch (_error) {
                // Silently fail — not critical
            }
        };

        checkUpdates();
    }, []);

    return null;
}
