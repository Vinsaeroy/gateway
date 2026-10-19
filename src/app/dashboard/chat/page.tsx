import { auth } from "@/lib/auth";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatLayoutClient } from "@/components/chat/chat-layout-client";
import { cookies } from "next/headers";
import { canAccessSession } from "@/lib/api-auth";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { getT } from "@/i18n/server";

export default async function ChatPage() {
    const session = await auth();
    console.log("ChatPage Session (Role debug):", session?.user?.role);

    if (!session?.user?.id) {
        const t = await getT();
        return <div>{t("chat.page.unauthorized")}</div>;
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;
    let validSessionId: string | null = null;

    if (sessionId) {
        // Validate access
        const hasAccess = await canAccessSession(session.user.id, session.user.role, sessionId);
        if (hasAccess) {
            // Ideally also check if CONNECTED but canAccessSession checks ownership.
            // We can do an extra check if needed.
            validSessionId = sessionId;
        }
    }

    if (!validSessionId) {
        return (
            <SessionGuard>
                <ChatInterface sessionId={null} />
            </SessionGuard>
        );
    }

    return (
        <div className="h-[calc(100dvh-6.5rem)] sm:h-[calc(100dvh-6rem)]">
            <ChatLayoutClient key={validSessionId} sessionId={validSessionId} />
        </div>
    );
}
