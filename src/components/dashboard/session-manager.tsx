'use client';

import { useState, useEffect } from 'react';
import { createAppSocket } from "@/lib/socket-client";
import type { Socket } from 'socket.io-client';
import QRCode from 'qrcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Label } from '@/components/ui/label';
import { Smartphone, Plus, Trash2, Settings, RefreshCw, Power, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/react';

type Session = {
    id: string;
    name: string;
    sessionId: string;
    status: string;
    qr?: string | null;
};

export function SessionManager({ user }: { user: any }) {
    const { t } = useTranslation();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [newSessionName, setNewSessionName] = useState("");
    const [newSessionId, setNewSessionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchSessions();

        // Init Socket
        const socketInstance = createAppSocket();

        socketInstance.on('connect', () => {
            console.log('Socket connected');
        });

        socketInstance.on('connection.update', (data: { sessionId: string, status: string, qr: string }) => {
            // Update specific session status if match
            setSessions(prev => prev.map(s => {
                if (s.sessionId === data.sessionId) {
                    return { ...s, status: data.status, qr: data.qr };
                }
                return s;
            }));

            if (data.status === 'CONNECTED') {
                fetchSessions(); // Refresh purely to get updated state from DB if needed
            }
        });

        setSocket(socketInstance);

        // Polling fallback (background, tanpa reload halaman): kalau socket
        // sempat putus / ada event yang terlewat, status tetap ter-update.
        const pollInterval = setInterval(() => {
            if (document.visibilityState === "visible") fetchSessions();
        }, 20000);

        return () => {
            socketInstance.disconnect();
            clearInterval(pollInterval);
        };
    }, []);

    // Gabung ke room tiap session supaya update status real-time diterima
    // (server emit ke room `sessionId`). Tanpa ini, status baru update saat refresh.
    useEffect(() => {
        if (!socket) return;
        const join = () => sessions.forEach(s => socket.emit("join-session", s.sessionId));
        join();
        socket.on("connect", join); // join ulang kalau socket reconnect
        return () => {
            socket.off("connect", join);
        };
    }, [socket, sessions]);

    const fetchSessions = () => {
        fetch('/api/sessions').then(res => res.json()).then(responseData => {
            const data = responseData?.data || [];
            if (Array.isArray(data)) setSessions(data);
        });
    }

    const createSession = async () => {
        if (!newSessionName) {
            toast.error(t("sessions.manager.toasts.nameRequired"));
            return;
        }

        // If ID matches existing
        if (newSessionId && sessions.some(s => s.sessionId === newSessionId)) {
            toast.error(t("sessions.manager.toasts.idExists"));
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    name: newSessionName,
                    sessionId: newSessionId || undefined // Optional, backend will generate if empty
                })
            });
            const responseData = await res.json();
            const session = responseData?.data;

            if (!res.ok || !session) throw new Error(responseData.error || responseData.message || t("sessions.manager.toasts.createFailed"));

            setSessions([...sessions, session]);
            setNewSessionName("");
            setNewSessionId("");
            toast.success(t("sessions.manager.toasts.created"));

            // Optionally redirect immediately or let user choose
            // router.push(`/dashboard/sessions/${session.sessionId}`);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || t("sessions.manager.toasts.createFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleManageSession = (sessionId: string) => {
        router.push(`/dashboard/sessions/${sessionId}`);
    }

    return (
        <div className="space-y-8">
            {/* Create New Session Card */}
            <Card className="bg-slate-50 border-dashed border-2">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Plus className="h-5 w-5" /> {t("sessions.manager.create.title")}
                    </CardTitle>
                    <CardDescription>
                        {t("sessions.manager.create.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="session-name">{t("sessions.manager.create.nameLabel")}</Label>
                            <Input
                                id="session-name"
                                value={newSessionName}
                                onChange={e => setNewSessionName(e.target.value)}
                                placeholder={t("sessions.manager.create.namePlaceholder")}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="session-id">{t("sessions.manager.create.idLabel")}</Label>
                            <Input
                                id="session-id"
                                value={newSessionId}
                                onChange={e => setNewSessionId(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                placeholder={t("sessions.manager.create.idPlaceholder")}
                            />
                            <p className="text-[10px] text-muted-foreground">{t("sessions.manager.create.idHint")}</p>
                        </div>
                        <Button onClick={createSession} disabled={loading}>
                            {loading ? t("sessions.manager.create.creating") : t("sessions.manager.create.submit")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Sessions Grid */}
            <div>
                <h2 className="text-xl font-semibold mb-4 text-slate-800">{t("sessions.manager.list.title", { count: sessions.length })}</h2>
                {sessions.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground bg-slate-50 rounded-lg border">
                        {t("sessions.manager.list.empty")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sessions.map(session => (
                            <Card key={session.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-base font-medium truncate">
                                        {session.name}
                                    </CardTitle>
                                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold truncate mb-2">{session.sessionId}</div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={session.status === 'CONNECTED' ? 'default' : 'secondary'}
                                            className={session.status === 'CONNECTED' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {session.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 p-3 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/sessions/access?session=${session.sessionId}`)}>
                                        <UserPlus className="h-4 w-4 mr-1" /> {t("sessions.manager.share")}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleManageSession(session.sessionId)}>
                                        <Settings className="h-4 w-4 mr-1" /> {t("sessions.manager.manage")}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
