"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Send, CheckCircle2, XCircle, Radio, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createAppSocket } from "@/lib/socket-client";
import type { Socket } from "socket.io-client";

import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useTranslation } from "@/i18n/react";
import { formatNumber } from "@/i18n/format";

interface BroadcastProgress {
    broadcastId: string;
    status: "running" | "completed";
    total: number;
    sent: number;
    failed: number;
    current?: string | null;
    progress?: number;
    errors?: { jid: string; error: string }[];
    startedAt?: string;
    completedAt?: string;
}

export default function BroadcastPage() {
    const { sessionId } = useSession();
    const { t, locale } = useTranslation();
    const [contacts, setContacts] = useState("");
    const [message, setMessage] = useState("");
    const [delay, setDelay] = useState([2000]);
    const [loading, setLoading] = useState(false);
    const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        const socket = createAppSocket();

        socket.on("connect", () => {
            socket.emit("join-session", sessionId);
        });

        socket.on("broadcast.progress", (data: BroadcastProgress) => {
            setBroadcastProgress(data);

            if (data.status === "completed") {
                setLoading(false);
                if (data.failed === 0) {
                    toast.success(t("broadcast.toasts.completedOk", { sent: data.sent }));
                } else {
                    toast.warning(t("broadcast.toasts.completedPartial", { sent: data.sent, failed: data.failed }));
                }
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [sessionId]);

    const handleSend = async () => {
        if (!sessionId) return toast.error(t("broadcast.toasts.noSession"));
        if (!message.trim()) return toast.error(t("broadcast.toasts.emptyMessage"));
        setLoading(true);
        setBroadcastProgress(null);

        try {
            const recipients = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(s => {
                if (!s.includes('@')) return `${s}@s.whatsapp.net`;
                return s;
            });

            if (recipients.length === 0) {
                toast.error(t("broadcast.toasts.noRecipients"));
                setLoading(false);
                return;
            }

            const res = await fetch("/api/messages/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sessionId,
                    recipients,
                    message: message,
                    delay: delay[0]
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.info(t("broadcast.toasts.started", { count: recipients.length }));
            } else {
                toast.error(data.message || t("broadcast.toasts.startFail"));
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            toast.error(t("broadcast.toasts.sendFail"));
            setLoading(false);
        }
    };

    const recipientCount = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;

    const formatJid = (jid: string) => {
        if (!jid) return "-";
        return jid.replace("@s.whatsapp.net", "").replace("@g.us", t("broadcast.progress.groupSuffix"));
    };

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{t("broadcast.page.title")}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{t("broadcast.page.subtitle")}</p>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                    {/* Recipients Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("broadcast.recipients.title")}</CardTitle>
                            <CardDescription>{t("broadcast.recipients.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("broadcast.recipients.label")}</Label>
                                <Textarea
                                    placeholder={"628123456789\n628987654321"}
                                    className="min-h-[200px] font-mono text-sm"
                                    value={contacts}
                                    onChange={e => setContacts(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">{t("broadcast.recipients.identified", { count: formatNumber(recipientCount, locale) })}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("broadcast.message.title")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("broadcast.message.label")}</Label>
                                <Textarea
                                    placeholder={t("broadcast.message.placeholder")}
                                    className="min-h-[150px]"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>{t("broadcast.message.delayLabel", { value: (delay[0] / 1000).toFixed(1) })}</Label>
                                    <Slider
                                        defaultValue={[2000]}
                                        min={1000}
                                        max={15000}
                                        step={500}
                                        value={delay}
                                        onValueChange={setDelay}
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-muted-foreground">{t("broadcast.message.delayHint")}</p>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleSend}
                                    disabled={loading || !sessionId || recipientCount === 0 || !message.trim()}
                                >
                                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {loading ? t("broadcast.message.running") : t("broadcast.message.start")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Monitoring Card */}
                {broadcastProgress && (
                    <Card className={`border-2 transition-colors ${
                        broadcastProgress.status === "completed" 
                            ? (broadcastProgress.failed === 0 ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10" : "border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-950/10")
                            : "border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/10"
                    }`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                {broadcastProgress.status === "running" ? (
                                    <>
                                        <Radio className="h-5 w-5 text-blue-500 animate-pulse" />
                                        <span>{t("broadcast.progress.running")}</span>
                                    </>
                                ) : broadcastProgress.failed === 0 ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span>{t("broadcast.progress.completed")}</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        <span>{t("broadcast.progress.completedWithErrors")}</span>
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {t("broadcast.progress.id", { id: broadcastProgress.broadcastId })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t("broadcast.progress.label")}</span>
                                    <span className="font-mono font-medium">
                                        {broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total}
                                        {" "}({broadcastProgress.progress || 0}%)
                                    </span>
                                </div>
                                <Progress value={broadcastProgress.progress || 0} className="h-3" />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-background rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-green-600">{broadcastProgress.sent}</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                        <CheckCircle2 className="h-3 w-3" /> {t("broadcast.progress.sent")}
                                    </div>
                                </div>
                                <div className="bg-background rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-red-500">{broadcastProgress.failed}</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                        <XCircle className="h-3 w-3" /> {t("broadcast.progress.failed")}
                                    </div>
                                </div>
                                <div className="bg-background rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-muted-foreground">
                                        {broadcastProgress.total - broadcastProgress.sent - broadcastProgress.failed}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                        <Clock className="h-3 w-3" /> {t("broadcast.progress.waiting")}
                                    </div>
                                </div>
                            </div>

                            {/* Current recipient */}
                            {broadcastProgress.status === "running" && broadcastProgress.current && (
                                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted/50 rounded-lg">
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                    <span className="text-muted-foreground">{t("broadcast.progress.lastSentTo")}</span>
                                    <span className="font-mono font-medium">{formatJid(broadcastProgress.current)}</span>
                                </div>
                            )}

                            {/* Error details */}
                            {broadcastProgress.status === "completed" && broadcastProgress.errors && broadcastProgress.errors.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                                        <XCircle className="h-4 w-4" />
                                        {t("broadcast.progress.failedRecipients", { count: broadcastProgress.errors.length })}
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-950/30 rounded-lg p-2 space-y-1">
                                        {broadcastProgress.errors.map((err, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs py-1 px-2 bg-background/60 rounded">
                                                <span className="font-mono">{formatJid(err.jid)}</span>
                                                <span className="text-red-500 truncate ml-2 max-w-[200px]">{err.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </SessionGuard>
    );
}
