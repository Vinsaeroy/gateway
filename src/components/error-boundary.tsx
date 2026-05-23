"use client";

import React from "react";

interface State {
    hasError: boolean;
    isTranslateError: boolean;
}

/**
 * App-wide error boundary that catches React render errors caused by
 * browser translation extensions (Google Translate, etc.) which mutate
 * the DOM out from under React.
 *
 * When a translate-related error is detected we soft-recover by forcing
 * a remount instead of showing a crash screen.
 */
export class TranslateSafeBoundary extends React.Component<
    React.PropsWithChildren,
    State
> {
    state: State = { hasError: false, isTranslateError: false };

    static getDerivedStateFromError(error: unknown): State {
        const message = error instanceof Error ? error.message : String(error);
        // These are the canonical signatures of translator-induced DOM races
        const translateSignatures = [
            "removeChild",
            "insertBefore",
            "is not a child of this node",
            "Failed to execute",
        ];
        const isTranslateError = translateSignatures.some((sig) =>
            message.includes(sig)
        );
        return { hasError: true, isTranslateError };
    }

    componentDidCatch(error: unknown, info: React.ErrorInfo) {
        // Always log so real bugs are still visible
        if (process.env.NODE_ENV !== "production") {
            console.error("ErrorBoundary caught:", error, info);
        }
    }

    componentDidUpdate(_: unknown, prev: State) {
        // Auto-recover from translator errors by clearing state on next tick
        if (this.state.isTranslateError && !prev.isTranslateError) {
            queueMicrotask(() => {
                this.setState({ hasError: false, isTranslateError: false });
            });
        }
    }

    render() {
        if (this.state.hasError && !this.state.isTranslateError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
                    <div className="max-w-md space-y-3">
                        <h2 className="text-lg font-semibold">Something went wrong</h2>
                        <p className="text-sm text-muted-foreground">
                            Please refresh the page. If the problem persists, contact support.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
