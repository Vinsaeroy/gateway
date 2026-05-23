"use client";

import { useEffect } from "react";

/**
 * Global error boundary for the App Router.
 * Replaces Next.js's default "Application error: a client-side exception
 * has occurred" overlay with a friendly page that lets users recover.
 *
 * Common triggers:
 *  - Browser translator (Google Translate) mutating DOM out from under React
 *  - Network blips during data fetching
 *  - Stale chunks after a deploy
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Detect translator-induced errors and auto-recover
        const message = error?.message || "";
        const isTranslateError =
            message.includes("removeChild") ||
            message.includes("insertBefore") ||
            message.includes("is not a child of this node") ||
            message.includes("Failed to execute");

        if (isTranslateError) {
            // Wait a tick then reset — DOM should be back to normal
            const t = setTimeout(() => reset(), 100);
            return () => clearTimeout(t);
        }
    }, [error, reset]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-4">
                <div className="text-5xl">⚠️</div>
                <h1 className="text-2xl font-bold">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">
                    The page hit an unexpected issue. This often happens when the browser
                    translator interferes with the app, or when the network is unstable.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted"
                    >
                        Go home
                    </button>
                </div>
                {error?.digest && (
                    <p className="text-xs text-muted-foreground/60 mt-4 font-mono" translate="no">
                        ref: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}
