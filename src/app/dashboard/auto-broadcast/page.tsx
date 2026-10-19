"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Radio, Clock, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/dashboard/session-provider";
import { useTranslation } from "@/i18n/react";

interface AutoBroadcast {
    id: string;
    name: string;
    message: string;
    mediaUrl: string | null;
    mediaType: string | null;
    targets: string[];
    intervalMin: number;
    isActive: boolean;
    lastSentAt: string | null;
    createdAt: string;
}

interface Group {
    jid: string;
    subject: string | null;
    isCommunity?: boolean;
}

export default function AutoBroadcastPage() {
    const [broadcasts, setBroadcasts] = useState<AutoBroadcast[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [groupSearch, setGroupSearch] = useState("");

    // Form state
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState("");
    const [targets, setTargets] = useState<string[]>(["ALL"]);
    const [intervalMin, setIntervalMin] = useState(60);

    const { sessionId } = useSession();
    const { t } = useTranslation();

    useEffect(() => {
        if (sessionId) {
            fetchBroadcasts();
            fetchGroups();
        }
    }, [sessionId]);

    const fetchBroadcasts = async () => {
        try {
            const res = await fetch(`/api/autobroadcast/${sessionId}`);
            const data = await res.json();
            if (data.status) setBroadcasts(data.data);
        } catch (_error) {
            toast.error(t("broadcast.auto.toasts.fetchFail"));
        }
    };

    const [groupRefreshing, setGroupRefreshing] = useState(false);

    const fetchGroups = async (forceRefresh = false) => {
        try {
            if (forceRefresh) setGroupRefreshing(true);
            const url = `/api/groups/${sessionId}${forceRefresh ? "?refresh=1" : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status) setGroups(data.data || []);
            if (forceRefresh) toast.success(t("broadcast.auto.toasts.groupsRefreshed"));
        } catch (_error) {
            if (forceRefresh) toast.error(t("broadcast.auto.toasts.groupsRefreshFail"));
        } finally {
            if (forceRefresh) setGroupRefreshing(false);
        }
    };

    const resetForm = () => {
        setName("");
        setMessage("");
        setMediaUrl("");
        setMediaType("");
        setTargets(["ALL"]);
        setIntervalMin(60);
        setEditingId(null);
        setGroupSearch("");
    };

    const handleSave = async () => {
        if (!name || !message) {
            toast.error(t("broadcast.auto.toasts.required"));
            return;
        }
        setLoading(true);
        try {
            const payload = {
                id: editingId || undefined,
                name,
                message,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
                targets,
                intervalMin
            };

            const method = editingId ? "PUT" : "POST";
            const res = await fetch(`/api/autobroadcast/${sessionId}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.status) {
                toast.success(editingId ? t("broadcast.auto.toasts.updated") : t("broadcast.auto.toasts.created"));
                resetForm();
                setShowForm(false);
                fetchBroadcasts();
            } else {
                toast.error(data.message);
            }
        } catch (_error) {
            toast.error(t("broadcast.auto.toasts.saveFail"));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("broadcast.auto.toasts.deleteConfirm"))) return;
        try {
            const res = await fetch(`/api/autobroadcast/${sessionId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.status) {
                toast.success(t("broadcast.auto.toasts.deleted"));
                fetchBroadcasts();
            }
        } catch (_error) {
            toast.error(t("broadcast.auto.toasts.deleteFail"));
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch(`/api/autobroadcast/${sessionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive })
            });
            const data = await res.json();
            if (data.status) {
                toast.success(isActive ? t("broadcast.auto.toasts.activated") : t("broadcast.auto.toasts.paused"));
                fetchBroadcasts();
            }
        } catch (_error) {
            toast.error(t("broadcast.auto.toasts.updateFail"));
        }
    };

    const handleEdit = (b: AutoBroadcast) => {
        setEditingId(b.id);
        setName(b.name);
        setMessage(b.message);
        setMediaUrl(b.mediaUrl || "");
        setMediaType(b.mediaType || "");
        setTargets(b.targets);
        setIntervalMin(b.intervalMin);
        setShowForm(true);
    };

    const toggleGroupTarget = (jid: string) => {
        if (targets.includes("ALL")) {
            setTargets([jid]);
        } else if (targets.includes(jid)) {
            const newTargets = targets.filter(item => item !== jid);
            setTargets(newTargets.length === 0 ? ["ALL"] : newTargets);
        } else {
            setTargets([...targets, jid]);
        }
    };

    if (!sessionId) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                {t("broadcast.auto.noSession")}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">{t("broadcast.auto.title")}</h1>
                    <p className="text-sm text-muted-foreground">{t("broadcast.auto.subtitle")}</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> {t("broadcast.auto.newBroadcast")}
                </Button>
            </div>

            {/* Broadcast List */}
            <div className="grid gap-4">
                {broadcasts.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            {t("broadcast.auto.empty", { name: t("broadcast.auto.newBroadcast") })}
                        </CardContent>
                    </Card>
                )}

                {broadcasts.map(b => (
                    <Card key={b.id}>
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                                <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold truncate max-w-full">{b.name}</h3>
                                        <Badge variant={b.isActive ? "default" : "secondary"}>
                                            {b.isActive ? t("broadcast.auto.active") : t("broadcast.auto.paused")}
                                        </Badge>
                                        {b.mediaType && (
                                            <Badge variant="outline">{b.mediaType}</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 break-words">{b.message}</p>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {t("broadcast.auto.everyMinutes", { min: b.intervalMin })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {b.targets.includes("ALL") ? t("broadcast.auto.allGroups") : t("broadcast.auto.groupsCount", { count: b.targets.length })}
                                        </span>
                                        {b.lastSentAt && (
                                            <span className="break-all">{t("broadcast.auto.lastSent", { date: new Date(b.lastSentAt).toLocaleString() })}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start shrink-0">
                                    <Switch
                                        checked={b.isActive}
                                        onCheckedChange={(checked) => handleToggle(b.id, checked)}
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(b)} className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(b.id)} className="h-8 w-8">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? t("broadcast.auto.dialog.editTitle") : t("broadcast.auto.dialog.newTitle")}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>{t("broadcast.auto.dialog.name")}</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder={t("broadcast.auto.dialog.namePlaceholder")} />
                        </div>

                        <div>
                            <Label>{t("broadcast.auto.dialog.messageLabel")}</Label>
                            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t("broadcast.auto.dialog.messagePlaceholder")} rows={4} />
                        </div>

                        <div>
                            <Label>{t("broadcast.auto.dialog.mediaLabel")}</Label>
                            <div className="mt-2 space-y-2">
                                <Input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,video/mp4"
                                    className="text-xs sm:text-sm file:text-xs file:mr-2"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append("file", file);
                                        try {
                                            const res = await fetch("/api/autobroadcast/upload", {
                                                method: "POST",
                                                body: formData
                                            });
                                            const data = await res.json();
                                            if (data.status) {
                                                setMediaUrl(data.data.url);
                                                setMediaType(data.data.type);
                                                toast.success(t("broadcast.auto.toasts.uploaded"));
                                            } else {
                                                toast.error(data.message);
                                            }
                                        } catch (_err) {
                                            toast.error(t("broadcast.auto.toasts.uploadFail"));
                                        }
                                    }}
                                />
                                {mediaUrl && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{t("broadcast.auto.dialog.mediaReady", { type: mediaType })}</span>
                                        <Button size="sm" variant="ghost" onClick={() => { setMediaUrl(""); setMediaType(""); }}>
                                            {t("broadcast.auto.dialog.remove")}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label>{t("broadcast.auto.dialog.intervalLabel")}</Label>
                            <Input
                                type="number"
                                min={10}
                                max={1440}
                                value={intervalMin}
                                onChange={e => setIntervalMin(Number(e.target.value))}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {intervalMin >= 60
                                    ? (intervalMin % 60 > 0
                                        ? t("broadcast.auto.dialog.intervalHoursMinutes", { hours: Math.floor(intervalMin / 60), minutes: intervalMin % 60 })
                                        : t("broadcast.auto.dialog.intervalHours", { hours: Math.floor(intervalMin / 60) }))
                                    : t("broadcast.auto.dialog.intervalMinutes", { minutes: intervalMin })}
                            </p>
                        </div>

                        <div>
                            <Label>{t("broadcast.auto.dialog.targetGroups")}</Label>
                            <div className="flex gap-2 mt-2 mb-2">
                                <Input
                                    placeholder={t("broadcast.auto.dialog.searchPlaceholder")}
                                    value={groupSearch}
                                    onChange={e => setGroupSearch(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fetchGroups(true)}
                                    disabled={groupRefreshing}
                                    title={t("broadcast.auto.dialog.refreshTitle")}
                                >
                                    <RefreshCw className={`h-4 w-4 ${groupRefreshing ? "animate-spin" : ""}`} />
                                </Button>
                            </div>
                            <div className="mt-2 space-y-1 max-h-56 overflow-y-auto border rounded p-2">
                                <div
                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer ${targets.includes("ALL") ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                                    onClick={() => setTargets(["ALL"])}
                                >
                                    <Radio className="h-4 w-4" />
                                    <span className="text-sm font-medium">{t("broadcast.auto.dialog.allGroups")}</span>
                                </div>

                                {/* Regular Groups */}
                                {(() => {
                                    const filtered = groups.filter(g => !g.isCommunity && (g.subject || g.jid).toLowerCase().includes(groupSearch.toLowerCase()));
                                    if (filtered.length === 0 && !groupSearch) return null;
                                    return (
                                        <>
                                            <div className="text-xs font-semibold text-muted-foreground mt-3 mb-1 px-2 uppercase tracking-wide">{t("broadcast.auto.dialog.groupsSection")}</div>
                                            {filtered.map(g => (
                                                <div
                                                    key={g.jid}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${targets.includes(g.jid) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                                                    onClick={() => toggleGroupTarget(g.jid)}
                                                >
                                                    <Users className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{g.subject || g.jid}</span>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}

                                {/* Communities */}
                                {(() => {
                                    const filtered = groups.filter(g => g.isCommunity && (g.subject || g.jid).toLowerCase().includes(groupSearch.toLowerCase()));
                                    if (filtered.length === 0) return null;
                                    return (
                                        <>
                                            <div className="text-xs font-semibold text-muted-foreground mt-3 mb-1 px-2 uppercase tracking-wide">{t("broadcast.auto.dialog.communitiesSection")}</div>
                                            {filtered.map(g => (
                                                <div
                                                    key={g.jid}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm ${targets.includes(g.jid) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                                                    onClick={() => toggleGroupTarget(g.jid)}
                                                >
                                                    <Radio className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{g.subject || g.jid}</span>
                                                </div>
                                            ))}
                                        </>
                                    );
                                })()}

                                {groups.filter(g => (g.subject || g.jid).toLowerCase().includes(groupSearch.toLowerCase())).length === 0 && groupSearch && (
                                    <p className="text-xs text-muted-foreground text-center py-2">{t("broadcast.auto.dialog.noGroupsFound")}</p>
                                )}
                            </div>
                            {!targets.includes("ALL") && targets.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">{t("broadcast.auto.dialog.selected", { count: targets.length })}</p>
                            )}
                        </div>

                        <Button onClick={handleSave} disabled={loading} className="w-full">
                            {loading ? t("broadcast.auto.dialog.saving") : (editingId ? t("broadcast.auto.dialog.update") : t("broadcast.auto.dialog.create"))}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
