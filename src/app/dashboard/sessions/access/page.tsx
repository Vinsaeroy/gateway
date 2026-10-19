"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Trash2, Shield, ShieldCheck, ShieldAlert, User, Users, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/i18n/react";
import { intlLocale } from "@/i18n/config";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SessionInfo {
    id: string;
    sessionId: string;
    name: string;
    userId: string;
    status: string;
}

interface AccessEntry {
    id: string;
    sessionId: string;
    userId: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
    };
}

export default function SessionAccessPage() {
    const { t, locale } = useTranslation();
    const { data: authSession } = useSession();
    const searchParams = useSearchParams();
    const sessionFromUrl = searchParams.get("session") || "";
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>(sessionFromUrl);
    const [accessList, setAccessList] = useState<AccessEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [accessLoading, setAccessLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // For revoke confirmation
    const [revokeTarget, setRevokeTarget] = useState<AccessEntry | null>(null);

    // @ts-ignore
    const currentUserId = authSession?.user?.id;
    // @ts-ignore
    const currentUserRole = authSession?.user?.role;

    // Fetch user's owned sessions — wait for authSession to be ready
    useEffect(() => {
        if (!authSession?.user) return; // Wait until session is loaded
        fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authSession?.user]);

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/sessions");
            if (res.ok) {
                const data = await res.json();
                const allSessions: SessionInfo[] = data?.data || [];
                // Filter to show only sessions owned by the current user (not shared ones)
                // SUPERADMIN sees all sessions
                const owned = currentUserRole === "SUPERADMIN"
                    ? allSessions
                    : allSessions.filter((s: SessionInfo) => s.userId === currentUserId);
                setSessions(owned);
                if (owned.length > 0 && !selectedSession) {
                    setSelectedSession(owned[0].sessionId);
                }
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
            toast.error(t("sessions.access.toasts.loadSessionsFailed"));
        } finally {
            setLoading(false);
        }
    };

    const fetchAccessList = useCallback(async () => {
        if (!selectedSession) return;
        setAccessLoading(true);
        try {
            const res = await fetch(`/api/sessions/${selectedSession}/access`);
            if (res.ok) {
                const data = await res.json();
                setAccessList(data?.data || []);
            } else if (res.status === 403) {
                toast.error(t("sessions.access.toasts.noPermission"));
                setAccessList([]);
            } else {
                setAccessList([]);
            }
        } catch (error) {
            console.error("Failed to fetch access list", error);
            toast.error(t("sessions.access.toasts.loadAccessFailed"));
        } finally {
            setAccessLoading(false);
        }
    }, [selectedSession]);

    useEffect(() => {
        if (selectedSession) {
            fetchAccessList();
        }
    }, [selectedSession, fetchAccessList]);

    const handleGrantAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !selectedSession) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/sessions/${selectedSession}/access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || t("sessions.access.toasts.granted"));
                setEmail("");
                fetchAccessList();
            } else {
                toast.error(data.message || t("sessions.access.toasts.grantFailed"));
            }
        } catch (error) {
            toast.error(t("sessions.access.toasts.grantFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    const confirmRevoke = async () => {
        if (!revokeTarget || !selectedSession) return;

        try {
            const res = await fetch(`/api/sessions/${selectedSession}/access`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: revokeTarget.user.id })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(t("sessions.access.toasts.revoked"));
                fetchAccessList();
            } else {
                toast.error(data.message || t("sessions.access.toasts.revokeFailed"));
            }
        } catch (error) {
            toast.error(t("sessions.access.toasts.revokeFailed"));
        } finally {
            setRevokeTarget(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "SUPERADMIN": return <ShieldAlert className="h-4 w-4 text-red-500" />;
            case "OWNER": return <ShieldCheck className="h-4 w-4 text-blue-500" />;
            default: return <User className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "SUPERADMIN": return "destructive" as const;
            case "OWNER": return "default" as const;
            default: return "secondary" as const;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">{t("sessions.access.loadingSessions")}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <Lock className="h-5 w-5 sm:h-6 sm:w-6" /> {t("sessions.access.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t("sessions.access.subtitle")}
                    </p>
                </div>
            </div>

            {/* Session Selector */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t("sessions.access.select.title")}</CardTitle>
                    <CardDescription>
                        {t("sessions.access.select.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t("sessions.access.select.empty")}
                        </p>
                    ) : (
                        <Select value={selectedSession} onValueChange={setSelectedSession}>
                            <SelectTrigger className="w-full sm:w-[360px]">
                                <SelectValue placeholder={t("sessions.access.select.placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                {sessions.map(s => (
                                    <SelectItem key={s.sessionId} value={s.sessionId}>
                                        <div className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${s.status === "CONNECTED" ? "bg-green-500" : "bg-gray-400"}`} />
                                            {s.name} <span className="text-muted-foreground">({s.sessionId})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {/* Grant Access Form */}
            {selectedSession && (
                <Card className="border-2 border-primary/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <UserPlus className="h-4 w-4" /> {t("sessions.access.grant.title")}
                        </CardTitle>
                        <CardDescription>
                            {t("sessions.access.grant.description")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleGrantAccess} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 space-y-1.5">
                                <Label htmlFor="email" className="sr-only">{t("sessions.access.grant.emailLabel")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("sessions.access.grant.emailPlaceholder")}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <Button type="submit" disabled={submitting || !email.trim()}>
                                {submitting ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {t("sessions.access.grant.granting")}</>
                                ) : (
                                    <><UserPlus className="h-4 w-4 mr-2" /> {t("sessions.access.grant.submit")}</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Access List */}
            {selectedSession && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" /> {t("sessions.access.list.title")}
                            <Badge variant="outline" className="ml-auto">
                                {accessList.length === 1
                                    ? t("sessions.access.list.countOne", { count: accessList.length })
                                    : t("sessions.access.list.countMany", { count: accessList.length })}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accessLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">{t("sessions.access.list.loading")}</span>
                            </div>
                        ) : accessList.length === 0 ? (
                            <div className="text-center py-8">
                                <Shield className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                <p className="text-sm text-muted-foreground">
                                    {t("sessions.access.list.empty")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {accessList.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                                                {entry.user.name?.charAt(0)?.toUpperCase() || entry.user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm truncate">
                                                    {entry.user.name || t("sessions.access.list.fallbackName")}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {entry.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                            <Badge variant={getRoleBadgeVariant(entry.user.role)} className="hidden sm:flex items-center gap-1 text-xs">
                                                {getRoleIcon(entry.user.role)}
                                                {entry.user.role}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground hidden md:inline">
                                                {new Date(entry.createdAt).toLocaleDateString(intlLocale[locale])}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                                onClick={() => setRevokeTarget(entry)}
                                                title={t("sessions.access.list.revokeTitle")}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Revoke Confirmation Dialog */}
            <AlertDialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("sessions.access.revokeDialog.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("sessions.access.revokeDialog.intro")}{" "}
                            <strong>{revokeTarget?.user.name || revokeTarget?.user.email}</strong>
                            {" "}{t("sessions.access.revokeDialog.outro")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("sessions.access.revokeDialog.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRevoke} className="bg-red-600 hover:bg-red-700">
                            {t("sessions.access.revokeDialog.confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
