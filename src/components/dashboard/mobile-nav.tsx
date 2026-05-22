"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import Link from "next/link";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    QrCode,
    ImageIcon,
    Webhook,
    CalendarClock,
    Bot,
    Bell,
    FileText,
    Code,
    UserCheck,
    Megaphone,
    HardDrive,
    Activity,
    UserCircle,
    Tag,
    MessageCircleReply,
    UserPlus,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import pkg from "../../../package.json";

interface NavGroup {
    label: string;
    items: { href: string; label: string; icon: React.ElementType; external?: boolean; superadminOnly?: boolean }[];
}

// Keep in sync with sidebar-nav.tsx
const navGroups: NavGroup[] = [
    {
        label: "Main",
        items: [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/dashboard/sessions", label: "Sessions / QR", icon: QrCode },
        ],
    },
    {
        label: "Messaging",
        items: [
            { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
            { href: "/dashboard/broadcast", label: "Broadcast", icon: Megaphone },
            { href: "/dashboard/sticker", label: "Sticker Maker", icon: ImageIcon },
        ],
    },
    {
        label: "Contacts",
        items: [
            { href: "/dashboard/contacts", label: "Contacts", icon: UserCheck },
            { href: "/dashboard/groups", label: "Groups", icon: Users },
            { href: "/dashboard/labels", label: "Labels", icon: Tag },
        ],
    },
    {
        label: "Automation",
        items: [
            { href: "/dashboard/bot-settings", label: "Bot Settings", icon: Bot },
            { href: "/dashboard/autoreply", label: "Auto Reply", icon: MessageCircleReply },
            { href: "/dashboard/profile", label: "Bot Profile", icon: UserCircle },
            { href: "/dashboard/scheduler", label: "Scheduler", icon: CalendarClock },
            { href: "/dashboard/webhooks", label: "Webhooks & API", icon: Webhook },
        ],
    },
    {
        label: "Developer",
        items: [
            { href: "/docs", label: "API Docs", icon: FileText },
            { href: "/swagger", label: "Swagger UI", icon: Code, external: true },
        ],
    },
    {
        label: "Administration",
        items: [
            { href: "/dashboard/media", label: "Media Manager", icon: HardDrive },
            { href: "/dashboard/sessions/access", label: "Session Access", icon: UserPlus },
            { href: "/dashboard/users", label: "Users", icon: Users },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
            { href: "/dashboard/system-monitor", label: "System Monitor", icon: Activity, superadminOnly: true },
            { href: "/dashboard/notifications", label: "Notifications", icon: Bell, superadminOnly: true },
        ],
    },
];

export function MobileNav({ appName = "WA-AKG" }: { appName?: string }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    // @ts-ignore
    const userRole = session?.user?.role;

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[320px] p-0 flex flex-col">
                <SheetHeader className="px-5 py-4 text-left border-b border-slate-100">
                    <SheetTitle className="text-xl font-bold text-slate-800">{appName}</SheetTitle>
                    <SheetDescription className="text-[11px] text-slate-400 -mt-1">WhatsApp Gateway</SheetDescription>
                </SheetHeader>

                <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter(
                            (item) => !item.superadminOnly || userRole === "SUPERADMIN"
                        );
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.label} className="mb-1">
                                {group.label !== "Main" && (
                                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        {group.label}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {visibleItems.map(({ href, label, icon: Icon, external }) => (
                                        <Link
                                            key={href}
                                            href={href}
                                            target={external ? "_blank" : undefined}
                                            onClick={() => setOpen(false)}
                                            className={`
                                                flex items-center rounded-lg text-sm font-medium
                                                transition-all duration-200 group relative
                                                gap-3 px-3 py-2
                                                ${isActive(href)
                                                    ? "text-primary bg-primary/10 shadow-sm"
                                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                }
                                            `}
                                        >
                                            {isActive(href) && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                                            )}
                                            <Icon
                                                size={17}
                                                className={`flex-shrink-0 transition-colors duration-200 ${isActive(href) ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"}`}
                                            />
                                            <span className="truncate">{label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                            {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{session?.user?.name || "User"}</p>
                            <p className="text-[11px] text-slate-400 truncate">{session?.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2 text-xs h-8"
                        onClick={async () => {
                            setOpen(false);
                            await signOut({ callbackUrl: "/auth/login" });
                        }}
                    >
                        <LogOut size={14} /> Sign Out
                    </Button>
                    <p className="text-[10px] text-slate-300 text-center mt-2 font-mono">v{pkg.version}</p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
