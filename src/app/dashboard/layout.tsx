import { auth } from "@/lib/auth";
import { Navbar } from "@/components/dashboard/navbar";
import { SessionProvider } from "@/components/dashboard/session-provider";
import { SidebarProvider } from "@/components/dashboard/sidebar-context";
import { SidebarShell } from "@/components/dashboard/sidebar-shell";
import { UpdateChecker } from "@/components/dashboard/update-checker";
import { RegistrationWarning } from "@/components/dashboard/registration-warning";
import { prisma } from "@/lib/prisma";
import { Toaster } from "sonner";
import { redirect } from "next/navigation";
import pkg from "../../../package.json";

// Disable caching for all dashboard pages — prevents back button from showing stale logged-in pages
export const dynamic = "force-dynamic";
export const revalidate = 0;


export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    
    // Redirect to login if no valid session
    if (!session?.user) {
        redirect("/auth/login");
    }
    
    // Select hanya kolom yang dipakai → aman walau ada kolom baru yang belum di-`db push`
    let systemConfig: { appName: string | null; enableRegistration: boolean } | null = null;
    try {
        systemConfig = await prisma.systemConfig.findUnique({
            where: { id: "default" },
            select: { appName: true, enableRegistration: true }
        });
    } catch (e) {
        console.error("DashboardLayout: gagal baca systemConfig", e);
    }
    const appName = systemConfig?.appName || "WA-AKG";
    const registrationEnabled = systemConfig?.enableRegistration ?? true;

    return (
        <SessionProvider>
            <SidebarProvider>
                <UpdateChecker />
                <RegistrationWarning
                    role={session?.user?.role as string}
                    registrationEnabled={registrationEnabled}
                />
                <div className="flex h-screen bg-background relative overflow-hidden">
                    {/* Subtle ambient background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                        <div className="absolute -top-[20%] -left-[10%] w-[35rem] h-[35rem] bg-primary/[0.03] rounded-full blur-[100px]" />
                        <div className="absolute -bottom-[20%] -right-[10%] w-[25rem] h-[25rem] bg-blue-500/[0.03] rounded-full blur-[80px]" />
                    </div>

                    {/* Sidebar */}
                    <SidebarShell
                        appName={appName}
                        userName={session?.user?.name}
                        userEmail={session?.user?.email}
                        version={pkg.version}
                    />

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative z-10">
                        <Navbar appName={appName} />
                        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 styled-scrollbar">
                            {children}
                        </main>
                    </div>
                    <Toaster />
                </div>
            </SidebarProvider>
        </SessionProvider>
    );
}
