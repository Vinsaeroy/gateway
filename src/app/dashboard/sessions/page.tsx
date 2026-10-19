import { auth } from "@/lib/auth";
import { SessionManager } from "@/components/dashboard/session-manager";
import { getT } from "@/i18n/server";

export default async function SessionsPage() {
    const session = await auth();
    const t = await getT();

    return (
        <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-6">{t("sessions.manage.title")}</h1>
            <SessionManager user={session?.user} />
        </div>
    );
}
