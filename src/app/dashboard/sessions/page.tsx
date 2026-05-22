import { auth } from "@/lib/auth";
import { SessionManager } from "@/components/dashboard/session-manager";

export default async function SessionsPage() {
    const session = await auth();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Sessions</h1>
            <SessionManager user={session?.user} />
        </div>
    );
}
