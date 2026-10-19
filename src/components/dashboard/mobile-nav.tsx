"use client";

import { useState, useEffect } from "react";
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
    Radio,
    CreditCard,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/i18n/react";
import pkg from "../../../package.json";

interface NavGroup {
    labelKey: string;
    items: { href: string; labelKey: string; icon: React.ElementType; external?: boolean; superadminOnly?: boolean; capability?: string }[];
}

// Keep in sync with sidebar-nav.tsx
const navGroups: NavGroup[] = [
    {
        labelKey: "nav.groups.main",
        items: [
            { href: "/dashboard", labelKey: "nav.items.dashboard", icon: LayoutDashboard },
            { href: "/dashboard/sessions", labelKey: "nav.items.sessions", icon: QrCode },
        ],
    },
    {
        labelKey: "nav.groups.messaging",
        items: [
            { href: "/dashboard/chat", labelKey: "nav.items.chat", icon: MessageSquare },
            { href: "/dashboard/broadcast", labelKey: "nav.items.broadcast", icon: Megaphone, capability: "broadcast" },
            { href: "/dashboard/sticker", labelKey: "nav.items.stickerMaker", icon: ImageIcon, capability: "sticker" },
        ],
    },
    {
        labelKey: "nav.groups.contacts",
        items: [
            { href: "/dashboard/contacts", labelKey: "nav.items.contacts", icon: UserCheck },
            { href: "/dashboard/groups", labelKey: "nav.items.groups", icon: Users },
            { href: "/dashboard/labels", labelKey: "nav.items.labels", icon: Tag },
        ],
    },
    {
        labelKey: "nav.groups.automation",
        items: [
            { href: "/dashboard/bot-settings", labelKey: "nav.items.botSettings", icon: Bot },
            { href: "/dashboard/autoreply", labelKey: "nav.items.autoReply", icon: MessageCircleReply, capability: "autoReply" },
            { href: "/dashboard/profile", labelKey: "nav.items.botProfile", icon: UserCircle },
            { href: "/dashboard/scheduler", labelKey: "nav.items.scheduler", icon: CalendarClock, capability: "scheduler" },
            { href: "/dashboard/auto-broadcast", labelKey: "nav.items.autoBroadcast", icon: Radio, capability: "autoBroadcast" },
            { href: "/dashboard/jpm-swgc", labelKey: "nav.items.jpmSwgc", icon: Megaphone, capability: "jpm" },
            { href: "/dashboard/webhooks", labelKey: "nav.items.webhooks", icon: Webhook, capability: "webhook" },
        ],
    },
    {
        labelKey: "nav.groups.developer",
        items: [
            { href: "/docs", labelKey: "nav.items.apiDocs", icon: FileText },
            { href: "/swagger", labelKey: "nav.items.swagger", icon: Code, external: true },
        ],
    },
    {
        labelKey: "nav.groups.account",
        items: [
            { href: "/dashboard/billing", labelKey: "nav.items.billing", icon: CreditCard },
        ],
    },
    {
        labelKey: "nav.groups.administration",
        items: [
            { href: "/dashboard/media", labelKey: "nav.items.mediaManager", icon: HardDrive },
            { href: "/dashboard/sessions/access", labelKey: "nav.items.sessionAccess", icon: UserPlus },
            { href: "/dashboard/users", labelKey: "nav.items.users", icon: Users, superadminOnly: true },
            { href: "/dashboard/settings", labelKey: "nav.items.settings", icon: Settings },
            { href: "/dashboard/system-monitor", labelKey: "nav.items.systemMonitor", icon: Activity, superadminOnly: true },
            { href: "/dashboard/notifications", labelKey: "nav.items.notifications", icon: Bell, superadminOnly: true },
        ],
    },
];

export function MobileNav({ appName = "WA-AKG" }: { appName?: string }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    // @ts-ignore
    const userRole = session?.user?.role;

    const [caps, setCaps] = useState<Record<string, boolean> | null>(null);
    useEffect(() => {
        let active = true;
        fetch("/api/usage")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (active && d?.data?.capabilities) setCaps(d.data.capabilities);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

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
                    <SheetTitle className="text-xl font-bold text-slate-800" translate="no">{appName}</SheetTitle>
                    <SheetDescription className="text-[11px] text-slate-400 -mt-1">{t("nav.tagline")}</SheetDescription>
                </SheetHeader>

                <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
                    {navGroups.map((group) => {
                        const visibleItems = group.items.filter(
                            (item) =>
                                (!item.superadminOnly || userRole === "SUPERADMIN") &&
                                !(item.capability && caps && caps[item.capability] === false)
                        );
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={group.labelKey} className="mb-1">
                                {group.labelKey !== "nav.groups.main" && (
                                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        {t(group.labelKey)}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {visibleItems.map(({ href, labelKey, icon: Icon, external }) => (
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
                                            <span className="truncate">{t(labelKey)}</span>
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
                            <p className="text-sm font-medium text-slate-700 truncate" translate="no">{session?.user?.name || t("common.user")}</p>
                            <p className="text-[11px] text-slate-400 truncate" translate="no">{session?.user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2 text-xs h-8"
                        onClick={async () => {
                            setOpen(false);
                            try {
                                await signOut({ redirect: false });
                            } catch {}
                            document.cookie.split(";").forEach((c) => {
                                const eqPos = c.indexOf("=");
                                const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
                                if (name.includes("auth") || name.includes("session")) {
                                    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                                }
                            });
                            window.location.replace("/auth/login");
                        }}
                    >
                        <LogOut size={14} /> {t("nav.signOut")}
                    </Button>
                    <p className="text-[10px] text-slate-300 text-center mt-2 font-mono" translate="no">v{pkg.version}</p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
