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
import { io, Socket } from "socket.io-client";

import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";

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
    const [contacts, setContacts] = useState("");
    const [message, setMessage] = useState("");
    const [delay, setDelay] = useState([2000]);
    const [loading, setLoading] = useState(false);
    const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        const socket = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        socket.on("connect", () => {
            socket.emit("join-session", sessionId);
        });

        socket.on("broadcast.progress", (data: BroadcastProgress) => {
            setBroadcastProgress(data);

            if (data.status === "completed") {
                setLoading(false);
                if (data.failed === 0) {
                    toast.success(`Broadcast selesai! ${data.sent} pesan terkirim.`);
                } else {
                    toast.warning(`Broadcast selesai. ${data.sent} terkirim, ${data.failed} gagal.`);
                }
            }
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [sessionId]);

    const handleSend = async () => {
        if (!sessionId) return toast.error("No active session found");
        if (!message.trim()) return toast.error("Message cannot be empty");
        setLoading(true);
        setBroadcastProgress(null);

        try {
            const recipients = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).map(s => {
                if (!s.includes('@')) return `${s}@s.whatsapp.net`;
                return s;
            });

            if (recipients.length === 0) {
                toast.error("No recipients specified");
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
                toast.info(`Broadcast dimulai untuk ${recipients.length} penerima...`);
            } else {
                toast.error(data.message || "Failed to start broadcast");
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error sending broadcast");
            setLoading(false);
        }
    };

    const recipientCount = contacts.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).length;

    const formatJid = (jid: string) => {
        if (!jid) return "-";
        return jid.replace("@s.whatsapp.net", "").replace("@g.us", " (Group)");
    };

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">Broadcast / Blast</h2>
                    <p className="text-muted-foreground text-sm mt-1">Kirim pesan massal ke banyak penerima sekaligus.</p>
                </div>

                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                    {/* Recipients Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipients</CardTitle>
                            <CardDescription>Enter phone numbers separated by comma or new line.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Target Numbers (e.g., 628123456789)</Label>
                                <Textarea
                                    placeholder={"628123456789\n628987654321"}
                                    className="min-h-[200px] font-mono text-sm"
                                    value={contacts}
                                    onChange={e => setContacts(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">{recipientCount} numbers identified</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Content</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Message</Label>
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="min-h-[150px]"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Delay: {(delay[0] / 1000).toFixed(1)}s</Label>
                                    <Slider
                                        defaultValue={[2000]}
                                        min={1000}
                                        max={15000}
                                        step={500}
                                        value={delay}
                                        onValueChange={setDelay}
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-muted-foreground">Delay antar pesan (+ random tambahan untuk menghindari ban).</p>
                                </div>

                                <Button
                                    className="w-full"
                                    onClick={handleSend}
                                    disabled={loading || !sessionId || recipientCount === 0 || !message.trim()}
                                >
                                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {loading ? "Broadcasting..." : "Start Broadcast"}
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
                                        <span>Broadcast In Progress</span>
                                    </>
                                ) : broadcastProgress.failed === 0 ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        <span>Broadcast Completed</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        <span>Broadcast Completed with Errors</span>
                                    </>
                                )}
                            </CardTitle>
                            <CardDescription>
                                ID: {broadcastProgress.broadcastId}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
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
                                        <CheckCircle2 className="h-3 w-3" /> Terkirim
                                    </div>
                                </div>
                                <div className="bg-background rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-red-500">{broadcastProgress.failed}</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                        <XCircle className="h-3 w-3" /> Gagal
                                    </div>
                                </div>
                                <div className="bg-background rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-muted-foreground">
                                        {broadcastProgress.total - broadcastProgress.sent - broadcastProgress.failed}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                                        <Clock className="h-3 w-3" /> Menunggu
                                    </div>
                                </div>
                            </div>

                            {/* Current recipient */}
                            {broadcastProgress.status === "running" && broadcastProgress.current && (
                                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-muted/50 rounded-lg">
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                    <span className="text-muted-foreground">Terakhir dikirim ke:</span>
                                    <span className="font-mono font-medium">{formatJid(broadcastProgress.current)}</span>
                                </div>
                            )}

                            {/* Error details */}
                            {broadcastProgress.status === "completed" && broadcastProgress.errors && broadcastProgress.errors.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                                        <XCircle className="h-4 w-4" />
                                        Failed Recipients ({broadcastProgress.errors.length})
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
