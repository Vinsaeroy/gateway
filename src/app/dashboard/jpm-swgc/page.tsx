"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, Send, RefreshCw, Users, Clock } from "lucide-react";
import { toast } from "sonner";
import { SessionGuard } from "@/components/dashboard/session-guard";

interface Group {
    jid: string;
    subject: string | null;
    isCommunity?: boolean;
}

export default function JpmSwgcPage() {
    const { sessionId } = useSession();

    const [text, setText] = useState("");
    const [mediaType, setMediaType] = useState<"text" | "image" | "video">("text");
    const [mediaUrl, setMediaUrl] = useState("");
    const [delayMs, setDelayMs] = useState(2000);
    const [scope, setScope] = useState<"ALL" | "SPECIFIC">("ALL");
    const [targets, setTargets] = useState<string[]>([]);

    const [groups, setGroups] = useState<Group[]>([]);
    const [groupSearch, setGroupSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchGroups = async (forceRefresh = false) => {
        if (!sessionId) return;
        try {
            if (forceRefresh) setRefreshing(true);
            const url = `/api/groups/${sessionId}${forceRefresh ? "?refresh=1" : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                setGroups(
                    (data.data || []).map((g: any) => ({
                        jid: g.jid,
                        subject: g.subject || null,
                        isCommunity: !!g.isCommunity,
                    }))
                );
            }
            if (forceRefresh) toast.success("Group list refreshed");
        } catch {
            if (forceRefresh) toast.error("Failed to refresh groups");
        } finally {
            if (forceRefresh) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [sessionId]);

    const handleUpload = async (file: File) => {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            setUploading(true);
            const res = await fetch("/api/autobroadcast/upload", { method: "POST", body: formData });
            const data = await res.json();
            if (data.status) {
                setMediaUrl(data.data.url);
                setMediaType(data.data.type === "video" ? "video" : "image");
                toast.success("Media uploaded");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const toggleTarget = (jid: string) => {
        setTargets((prev) =>
            prev.includes(jid) ? prev.filter((t) => t !== jid) : [...prev, jid]
        );
    };

    const selectAllVisible = () => {
        const visible = filteredGroups.map((g) => g.jid);
        setTargets((prev) => Array.from(new Set([...prev, ...visible])));
    };

    const clearTargets = () => setTargets([]);

    const handleSend = async () => {
        if (!sessionId) {
            toast.error("No active session");
            return;
        }
        if (!text.trim() && !mediaUrl) {
            toast.error("Provide text or media");
            return;
        }
        if (scope === "SPECIFIC" && targets.length === 0) {
            toast.error("Pick at least one target group");
            return;
        }

        const confirmed = confirm(
            scope === "ALL"
                ? `Kirim status ke SEMUA grup (${groups.length} grup)? Action ini cukup berat.`
                : `Kirim status ke ${targets.length} grup terpilih?`
        );
        if (!confirmed) return;

        try {
            setSending(true);
            const res = await fetch(`/api/jpm-swgc/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: text.trim(),
                    mediaUrl: mediaUrl || undefined,
                    mediaType,
                    delayMs,
                    scope,
                    targets: scope === "SPECIFIC" ? Array.from(new Set(targets)) : undefined,
                }),
            });
            const data = await res.json();
            if (data.status) {
                toast.success(`Dispatch dimulai untuk ${data.data?.total || 0} grup. Cek log di Railway.`);
            } else if (res.status === 409) {
                toast.warning(data.message || "A dispatch is already running for this session");
            } else {
                toast.error(data.message || "Failed to dispatch");
            }
        } catch (e: any) {
            toast.error(e?.message || "Failed to dispatch");
        } finally {
            setSending(false);
        }
    };

    const filteredGroups = groups.filter(
        (g) =>
            !groupSearch ||
            (g.subject || g.jid).toLowerCase().includes(groupSearch.toLowerCase())
    );

    return (
        <SessionGuard>
            <div className="max-w-4xl space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Radio className="h-5 w-5 sm:h-6 sm:w-6" /> JPM SWGC
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Bulk Status Group Channel — broadcast pesan/foto/video sebagai status grup ke semua atau grup terpilih.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Compose Status</CardTitle>
                        <CardDescription>
                            Status akan terkirim sebagai <code>groupStatusMessageV2</code> via <code>relayMessage</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Text / Caption</Label>
                            <Textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Tulis pesan untuk dijadikan status grup..."
                                rows={4}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Media Type</Label>
                                <Select
                                    value={mediaType}
                                    onValueChange={(v) => setMediaType(v as any)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text only</SelectItem>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Delay between groups (ms)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={60000}
                                    value={delayMs}
                                    onChange={(e) =>
                                        setDelayMs(Math.max(0, Math.min(60000, Number(e.target.value) || 0)))
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Recommended: 2000–5000ms to avoid spam detection.
                                </p>
                            </div>
                        </div>

                        {mediaType !== "text" && (
                            <div className="grid gap-2">
                                <Label>Upload Media (or paste URL below)</Label>
                                <Input
                                    type="file"
                                    accept={mediaType === "video" ? "video/mp4" : "image/jpeg,image/png,image/webp"}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) handleUpload(f);
                                    }}
                                    disabled={uploading}
                                    className="text-xs sm:text-sm"
                                />
                                <Input
                                    placeholder="https://example.com/image.jpg or /api/media/xxx.jpg"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                />
                                {mediaUrl && (
                                    <p className="text-xs text-muted-foreground break-all">
                                        ✓ {mediaUrl}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Target Scope</Label>
                            <Select value={scope} onValueChange={(v) => setScope(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All groups ({groups.length})</SelectItem>
                                    <SelectItem value="SPECIFIC">Selected groups only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {scope === "SPECIFIC" && (
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <Label className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Selected: {targets.length} / {groups.length}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={selectAllVisible}
                                            disabled={filteredGroups.length === 0}
                                        >
                                            Select all visible
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={clearTargets}
                                            disabled={targets.length === 0}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchGroups(true)}
                                            disabled={refreshing}
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                                        </Button>
                                    </div>
                                </div>
                                <Input
                                    placeholder="Search groups..."
                                    value={groupSearch}
                                    onChange={(e) => setGroupSearch(e.target.value)}
                                />
                                <div className="max-h-72 overflow-y-auto border rounded-lg p-2 space-y-1 bg-muted/20">
                                    {filteredGroups.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-3">
                                            No groups. Click Refresh to sync from WhatsApp.
                                        </p>
                                    ) : (
                                        filteredGroups.map((g) => {
                                            const checked = targets.includes(g.jid);
                                            return (
                                                <label
                                                    key={g.jid}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-muted ${checked ? "bg-primary/10 border border-primary/30" : ""}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleTarget(g.jid)}
                                                        className="shrink-0"
                                                    />
                                                    <span className="truncate flex-1">
                                                        {g.subject || g.jid}
                                                    </span>
                                                    {g.isCommunity && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">
                                                            Community
                                                        </span>
                                                    )}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="border-l-2 border-amber-500/50 pl-3 py-2 bg-amber-500/5 rounded text-xs space-y-1">
                            <p className="font-medium flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Catatan
                            </p>
                            <p className="text-muted-foreground">
                                Status grup hanya tampil ke anggota grup itu. Group dengan &lt;2 member otomatis di-skip.
                                Gunakan delay 2000ms+ untuk hindari spam detection oleh WhatsApp.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button
                                onClick={handleSend}
                                disabled={sending || !sessionId || (scope === "SPECIFIC" && targets.length === 0)}
                                size="lg"
                                className="w-full sm:w-auto"
                            >
                                {sending ? (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                {sending
                                    ? "Mengirim..."
                                    : `Send to ${scope === "ALL" ? `${groups.length} groups` : `${targets.length} groups`}`}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SessionGuard>
    );
}
