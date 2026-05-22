"use client";

import { useSession } from "./session-provider";
import { Bot, QrCode } from "lucide-react";
import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SessionGuard({ children }: { children: ReactNode }) {
    const { sessionId, loading, sessions } = useSession();

    if (loading) {
        return <div className="flex h-full items-center justify-center p-8">Loading session...</div>;
    }

    if (!sessionId) {
        return (
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-center p-8">
                <div className="rounded-full bg-green-100 p-6">
                    <QrCode className="h-12 w-12 text-green-600" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold tracking-tight">No Active Session</h2>
                    <p className="text-gray-500">
                        Please select a WhatsApp session from the top navigation bar to access this feature.
                    </p>
                </div>

                {sessions.length === 0 && (
                    <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-500">You don't have any sessions yet.</p>
                        <Link href="/dashboard/sessions">
                            <Button variant="outline">Create a Session</Button>
                        </Link>
                    </div>
                )}
            </div>
        );
    }

    return <>{children}</>;
}
