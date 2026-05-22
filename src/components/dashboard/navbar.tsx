"use client";

import { useState, useEffect } from "react";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { SessionSelector } from "@/components/dashboard/session-selector";
import { Button } from "@/components/ui/button";
import { RealtimeClock } from "@/components/dashboard/realtime-clock";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Inbox, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";

interface NavbarProps {
    appName?: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    href?: string;
    createdAt: string;
}

export function Navbar({ appName }: NavbarProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const responseData = await res.json();
                const items = responseData?.data || [];
                setNotifications(items);
                setUnreadCount(items.filter((n: Notification) => !n.read).length);
            }
        } catch (e) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();

        // Setup Socket.IO connection
        if (session?.user?.id) {
            const socketInstance = io({
                path: "/api/socket/io",
            });

            socketInstance.on("connect", () => {
                console.log("Socket connected for notifications");
                // Join user-specific room
                socketInstance.emit("join-user-room", session.user.id);
            });

            socketInstance.on("notification:new", (notification: Notification) => {
                console.log("New notification received:", notification);

                // Add to notifications list
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show toast popup
                toast.info(notification.title, {
                    description: notification.message,
                    action: notification.href ? {
                        label: "View",
                        onClick: () => router.push(notification.href!)
                    } : undefined,
                });
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        }
    }, [session?.user?.id]);

    const markAsRead = async (id?: string) => {
        try {
            const ids = id ? [id] : []; // Empty array means mark all
            const res = await fetch("/api/notifications/read", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids })
            });
            if (res.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setUnreadCount(0);
                }
            }
        } catch (e) {
            console.error("Failed to mark read");
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/delete?id=${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setNotifications(prev => prev.filter(n => n.id !== id));
                setUnreadCount(prev => {
                    const notification = notifications.find(n => n.id === id);
                    return notification && !notification.read ? Math.max(0, prev - 1) : prev;
                });
                toast.success("Notification deleted");
            }
        } catch (e) {
            console.error("Failed to delete notification");
            toast.error("Failed to delete notification");
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.read) markAsRead(n.id);
        if (n.href) router.push(n.href);
        setIsOpen(false);
    };

    return (
        <header className="bg-background/40 backdrop-blur-2xl border-b border-border/50 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full shadow-sm">
            <div className="flex items-center gap-3">
                <MobileNav appName={appName} />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <span className="hidden sm:inline"><RealtimeClock /></span>
                <SessionSelector />
                <div className="h-6 w-px bg-border/50 hidden sm:block" />

                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-full h-10 w-10">
                            <Bell className={`h-5 w-5 transition-colors ${unreadCount > 0 ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-2.5 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border-2 border-background" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-2xl border border-border/50 shadow-2xl glass-panel" align="end">
                        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-background/50">
                            <div>
                                <h4 className="font-semibold leading-none text-foreground">Notifications</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {unreadCount > 0 ? `You have ${unreadCount} unread updates.` : "No new notifications."}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => markAsRead()} className="h-auto py-1 px-2 text-xs">
                                    Mark all read
                                </Button>
                            )}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="min-h-[150px] flex flex-col items-center justify-center text-center p-4">
                                    <div className="bg-slate-100 p-3 rounded-full mb-3">
                                        <Inbox className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium">No new notifications</p>
                                    <p className="text-xs text-muted-foreground max-w-[180px]">We'll notify you when something important arrives.</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`p-4 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-3">
                                                <div
                                                    className="flex-1 space-y-1 cursor-pointer"
                                                    onClick={() => handleNotificationClick(n)}
                                                >
                                                    <p className={`text-sm font-medium leading-none ${!n.read ? 'text-blue-700' : 'text-slate-900'}`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!n.read && <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(n.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
