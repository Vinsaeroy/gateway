"use client";

import { ChatLayoutClient } from "./chat-layout-client";

interface ChatInterfaceProps {
    sessionId: string | null;
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
    if (!sessionId) {
        return (
            <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
                No active WhatsApp session selected. Please select a session from the top bar.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] gap-4">
            <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow-sm">
                <ChatLayoutClient key={sessionId} sessionId={sessionId} />
            </div>
        </div>
    );
}
