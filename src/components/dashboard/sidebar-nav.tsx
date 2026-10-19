"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronDown, PanelLeftClose, PanelLeft } from "lucide-react";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    QrCode,
    ImageIcon,
    Webhook,
    CalendarClock,
    Bot,
    Bell,
    FileText,
    Code,
    Send,
    UserCheck,
    Megaphone,
    HardDrive,
    Activity,
    UserCircle,
    Tag,
    MessageCircleReply,
    Contact,
    UserPlus,
    Radio,
    CreditCard
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/i18n/react";

interface NavGroup {
    labelKey: string;
    items: NavItem[];
}

interface NavItem {
    href: string;
    labelKey: string;
    icon: React.ElementType;
    external?: boolean;
    superadminOnly?: boolean;
    allowedRoles?: string[];
    capability?: string;
}

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

export function SidebarNav() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isCollapsed, toggleCollapse } = useSidebar();
    // @ts-ignore
    const userRole = session?.user?.role;

    // Kapabilitas plan user (untuk sembunyikan menu fitur yang tidak aktif di plannya).
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

    // Track collapsed groups — all expanded by default
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (labelKey: string) => {
        setCollapsedGroups(prev => ({ ...prev, [labelKey]: !prev[labelKey] }));
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        return pathname.startsWith(href);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <nav className="flex-1 px-2 py-2 overflow-y-auto overflow-x-hidden space-y-0.5 styled-scrollbar">
                {navGroups.map((group) => {
                    const visibleItems = group.items.filter((item) => {
                        if (item.superadminOnly && userRole !== "SUPERADMIN") return false;
                        if (item.allowedRoles && (!userRole || !item.allowedRoles.includes(userRole))) return false;
                        // Sembunyikan fitur yang dimatikan di plan user (SUPERADMIN: /api/usage balikin semua true).
                        if (item.capability && caps && caps[item.capability] === false) return false;
                        return true;
                    });
                    if (visibleItems.length === 0) return null;

                    const isGroupCollapsed = collapsedGroups[group.labelKey] ?? false;

                    // "Main" group doesn't show a collapsible header
                    if (group.labelKey === "nav.groups.main") {
                        return (
                            <div key={group.labelKey} className="mb-1">
                                {visibleItems.map((item) => (
                                    <NavLink
                                        key={item.href}
                                        item={item}
                                        active={isActive(item.href)}
                                        isCollapsed={isCollapsed}
                                    />
                                ))}
                            </div>
                        );
                    }

                    return (
                        <div key={group.labelKey} className="mb-1">
                            {/* Group header — hidden when sidebar collapsed */}
                            {!isCollapsed && (
                                <button
                                    onClick={() => toggleGroup(group.labelKey)}
                                    className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground/80 transition-colors group"
                                >
                                    {t(group.labelKey)}
                                    <ChevronDown
                                        size={12}
                                        className={`transition-transform duration-200 ${isGroupCollapsed ? "-rotate-90" : ""}`}
                                    />
                                </button>
                            )}

                            {/* Collapsed sidebar: show a thin divider between groups */}
                            {isCollapsed && (
                                <div className="mx-3 my-2 border-t border-border/30" />
                            )}

                            {(!isGroupCollapsed || isCollapsed) && (
                                <div className="space-y-0.5">
                                    {visibleItems.map((item) => (
                                        <NavLink
                                            key={item.href}
                                            item={item}
                                            active={isActive(item.href)}
                                            isCollapsed={isCollapsed}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Collapse Toggle Button */}
            <div className="px-2 py-2 border-t border-border/30">
                <button
                    onClick={toggleCollapse}
                    className="flex items-center justify-center w-full gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                    {isCollapsed ? (
                        <PanelLeft size={18} />
                    ) : (
                        <>
                            <PanelLeftClose size={16} />
                            <span>{t("nav.collapse")}</span>
                        </>
                    )}
                </button>
            </div>
        </TooltipProvider>
    );
}

function NavLink({ item, active, isCollapsed }: { item: NavItem; active: boolean; isCollapsed: boolean }) {
    const { t } = useTranslation();
    const Icon = item.icon;

    const linkContent = (
        <Link
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className={`
                flex items-center rounded-lg text-sm font-medium
                transition-all duration-200 group relative
                ${isCollapsed ? "justify-center px-2 py-2.5 mx-1" : "gap-3 px-3 py-2"}
                ${active
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }
            `}
        >
            {active && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
            )}
            <Icon
                size={isCollapsed ? 20 : 17}
                className={`flex-shrink-0 transition-colors duration-200 ${active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"}`}
            />
            {!isCollapsed && <span className="truncate">{t(item.labelKey)}</span>}
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                    <p className="text-xs font-medium">{t(item.labelKey)}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}
