"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function ChatError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Chat page error:", error);
    }, [error]);

    return (
        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center p-8">
            <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2 max-w-md">
                <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
                <p className="text-sm text-muted-foreground">
                    Failed to load chat. This may be caused by a network issue or server error.
                </p>
            </div>
            <Button onClick={reset} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
            </Button>
        </div>
    );
}
