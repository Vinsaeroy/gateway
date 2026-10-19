"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy, RefreshCw, Webhook, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SessionGuard } from "@/components/dashboard/session-guard";

interface WebhookConfig {
    id: string;
    name: string;
    url: string;
    secret?: string;
    sessionId?: string;
    events: string[];
    isActive: boolean;
    createdAt: string;
}

const AVAILABLE_EVENTS = [
    { id: "message.received", key: "messageReceived" },
    { id: "message.sent", key: "messageSent" },
    { id: "message.status", key: "messageStatus" },
    { id: "connection.update", key: "connectionUpdate" },
    { id: "group.update", key: "groupUpdate" },
    { id: "group.upsert", key: "groupJoined" },
    { id: "group.participant", key: "groupParticipant" },
    { id: "contact.update", key: "contactUpdate" },
    { id: "status.update", key: "statusUpdate" },
    { id: "message.edited", key: "messageEdited" },
    { id: "message.deleted", key: "messageDeleted" },
];

import { useSession } from "@/components/dashboard/session-provider";
import { useTranslation } from "@/i18n/react";

export default function WebhooksPage() {
    const { sessionId, sessions } = useSession(); // Get active session ID and list of sessions
    const { t } = useTranslation();
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeySet, setApiKeySet] = useState(false);
    const [apiKeyHidden, setApiKeyHidden] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showRegenConfirm, setShowRegenConfirm] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);

    // New webhook form
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newUrl, setNewUrl] = useState("");
    const [newSecret, setNewSecret] = useState("");
    const [newEvents, setNewEvents] = useState<string[]>(["message.received", "message.sent"]);

    useEffect(() => {
        if (sessions.length > 0) {
            fetchWebhooks();
        }
        fetchApiKey();
    }, [sessionId, sessions]); // Refetch when sessionId changes or sessions are loaded

    const fetchWebhooks = async () => {
        setLoading(true);
        try {
            // Fetch webhooks using the new session-scoped endpoint
            const res = await fetch(`/api/webhooks/${sessionId}`);
            if (res.ok) {
                const responseData = await res.json();
                const data = responseData?.data || [];
                // Find current session to get its internal ID (CUID)
                const currentSession = sessions.find(s => s.sessionId === sessionId);
                const currentSessionCuid = currentSession?.id;

                // Filter by active session (check both String ID and CUID)
                const filtered = data.filter((w: WebhookConfig) =>
                    w.sessionId === sessionId ||
                    w.sessionId === currentSessionCuid ||
                    !w.sessionId
                );
                setWebhooks(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch webhooks", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApiKey = async () => {
        try {
            const res = await fetch("/api/user/api-key");
            if (res.ok) {
                const data = await res.json();
                setApiKey(data?.data?.apiKey ?? null);
                setApiKeySet(Boolean(data?.data?.apiKeySet));
                setApiKeyHidden(Boolean(data?.data?.hidden));
            }
        } catch (error) {
            console.error("Failed to fetch API key", error);
        }
    };

    const generateNewApiKey = async () => {
        try {
            const res = await fetch("/api/user/api-key", { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setApiKey(data?.data?.apiKey ?? null);
                setApiKeySet(true);
                setApiKeyHidden(false);
                setShowApiKey(true); // tampilkan sekali, karena tidak bisa dilihat lagi nanti
                toast.success(t("webhooks.apiKey.createdToast"), { duration: 8000 });
            }
        } catch (error) {
            toast.error(t("webhooks.apiKey.generateFail"));
        }
    };

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editSecret, setEditSecret] = useState("");
    const [editEvents, setEditEvents] = useState<string[]>([]);

    const handleEdit = (webhook: WebhookConfig) => {
        setEditingId(webhook.id);
        setEditName(webhook.name);
        setEditUrl(webhook.url);
        setEditSecret(webhook.secret || "");
        setEditEvents(webhook.events);
        setIsEditOpen(true);
    };

    const handleSaveWebhook = async () => {
        if (!newName || !newUrl || newEvents.length === 0) {
            toast.error(t("webhooks.toasts.required"));
            return;
        }

        if (!sessionId) {
            toast.error(t("webhooks.toasts.noSession"));
            return;
        }

        try {
            const payload: any = {
                name: newName,
                url: newUrl,
                events: newEvents
            };

            if (newSecret) {
                payload.secret = newSecret;
            }

            const res = await fetch(`/api/webhooks/${sessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(t("webhooks.toasts.created"));
                setShowNewForm(false);
                setNewName("");
                setNewUrl("");
                setNewSecret("");
                setNewEvents(["message.received", "message.sent"]);
                fetchWebhooks();
            } else {
                toast.error(t("webhooks.toasts.createFail"));
            }
        } catch (error) {
            toast.error(t("webhooks.toasts.error"));
        }
    };

    const handleUpdateWebhook = async () => {
        if (!editName || !editUrl || editEvents.length === 0) {
            toast.error(t("webhooks.toasts.required"));
            return;
        }

        if (!sessionId || !editingId) {
            toast.error(t("webhooks.toasts.noSession"));
            return;
        }

        try {
            const webhook = webhooks.find(w => w.id === editingId);
            const targetSessionId = webhook?.sessionId || sessionId;

            const payload: any = {
                name: editName,
                url: editUrl,
                events: editEvents
            };

            if (editSecret) {
                payload.secret = editSecret;
            }

            const res = await fetch(`/api/webhooks/${targetSessionId}/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(t("webhooks.toasts.updated"));
                setIsEditOpen(false);
                setEditingId(null);
                fetchWebhooks();
            } else {
                toast.error(t("webhooks.toasts.updateFail"));
            }
        } catch (error) {
            toast.error(t("webhooks.toasts.error"));
        }
    };

    const toggleWebhookActive = async (id: string, isActive: boolean) => {
        try {
            // Find webhook to get its session ID
            const webhook = webhooks.find(w => w.id === id);
            const targetSessionId = webhook?.sessionId || sessionId; // Fallback to current session if missing (legacy)

            await fetch(`/api/webhooks/${targetSessionId}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive })
            });
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive } : w));
        } catch (error) {
            toast.error(t("webhooks.toasts.updateFail"));
        }
    };

    const handleTestWebhook = async (webhook: WebhookConfig) => {
        setTestingId(webhook.id);
        try {
            const res = await fetch(`/api/webhooks/${sessionId}/${webhook.id}/test`, { method: "POST" });
            const data = await res.json();
            if (data?.ok) {
                toast.success(data.message || t("webhooks.toasts.testOk"));
            } else {
                toast.error(data?.message || t("webhooks.toasts.testFail"), { duration: 6000 });
            }
        } catch {
            toast.error(t("webhooks.toasts.testError"));
        } finally {
            setTestingId(null);
        }
    };

    const toggleEventForWebhook = async (webhookId: string, eventId: string) => {
        const webhook = webhooks.find(w => w.id === webhookId);
        if (!webhook) return;

        const newEvents = webhook.events.includes(eventId)
            ? webhook.events.filter(e => e !== eventId)
            : [...webhook.events, eventId];

        // Find webhook to get its session ID
        const targetSessionId = webhook.sessionId || sessionId;

        try {
            await fetch(`/api/webhooks/${targetSessionId}/${webhookId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ events: newEvents })
            });
            setWebhooks(webhooks.map(w => w.id === webhookId ? { ...w, events: newEvents } : w));
        } catch (error) {
            toast.error(t("webhooks.toasts.eventsFail"));
        }
    };

    const [deleteId, setDeleteId] = useState<string | null>(null);

    const deleteWebhook = async (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const webhook = webhooks.find(w => w.id === deleteId);
            const targetSessionId = webhook?.sessionId || sessionId;
            await fetch(`/api/webhooks/${targetSessionId}/${deleteId}`, { method: "DELETE" });
            setWebhooks(webhooks.filter(w => w.id !== deleteId));
            toast.success(t("webhooks.toasts.deleted"));
        } catch (error) {
            toast.error(t("webhooks.toasts.deleteFail"));
        } finally {
            setDeleteId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t("webhooks.toasts.copied"));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">{t("webhooks.title")}</h1>
            </div>

            {/* API Key Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" /> {t("webhooks.apiKey.title")}
                    </CardTitle>
                    <CardDescription>
                        {t("webhooks.apiKey.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="flex-1 bg-slate-100 rounded-md p-2 sm:p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                            {apiKey ? (
                                showApiKey ? apiKey : "••••••••••••••••••••••••••••••••"
                            ) : apiKeySet && apiKeyHidden ? (
                                <span className="text-muted-foreground">{t("webhooks.apiKey.hidden")}</span>
                            ) : (
                                <span className="text-muted-foreground">{t("webhooks.apiKey.none")}</span>
                            )}
                        </div>
                        {apiKey && (
                            <>
                                <Button variant="ghost" size="icon" onClick={() => setShowApiKey(!showApiKey)}>
                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                        <Button onClick={() => {
                            if (apiKeySet) {
                                setShowRegenConfirm(true);
                            } else {
                                generateNewApiKey();
                            }
                        }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {apiKeySet ? t("webhooks.apiKey.regenerate") : t("webhooks.apiKey.generate")}
                        </Button>
                    </div>
                    {apiKey && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("webhooks.apiKey.exampleLabel")} <code className="bg-slate-100 px-1 py-0.5 rounded">curl -H "X-API-Key: {apiKey?.slice(0, 10)}..." http://your-server/api/sessions</code>
                        </p>
                    )}
                    {!apiKey && apiKeySet && apiKeyHidden && (
                        <p className="text-xs text-muted-foreground mt-2">
                            {t("webhooks.apiKey.hiddenNoteA")}<b>{t("webhooks.apiKey.regenerate")}</b>{t("webhooks.apiKey.hiddenNoteB")}
                        </p>
                    )}
                </CardContent>

                {/* API Key Regeneration Confirmation */}
                <AlertDialog open={showRegenConfirm} onOpenChange={setShowRegenConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("webhooks.apiKey.regenTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("webhooks.apiKey.regenDescription")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("webhooks.apiKey.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { setShowRegenConfirm(false); generateNewApiKey(); }} className="bg-red-600 hover:bg-red-700">{t("webhooks.apiKey.regenerate")}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>

            {/* Webhooks Section */}
            <SessionGuard>
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" /> {t("webhooks.section.title")}
                                </CardTitle>
                                <CardDescription>
                                    {t("webhooks.section.description")}
                                </CardDescription>
                            </div>
                            <Button onClick={() => {
                                setNewName("");
                                setNewUrl("");
                                setNewSecret("");
                                setNewEvents(["message.received", "message.sent"]);
                                setShowNewForm(!showNewForm);
                            }}>
                                <Plus className="h-4 w-4 mr-2" /> {t("webhooks.section.add")}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* New Webhook Form */}
                        {showNewForm && (
                            <Card className="border-dashed border-2">
                                <CardHeader>
                                    <CardTitle>{t("webhooks.form.newTitle")}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t("webhooks.form.name")}</Label>
                                            <Input
                                                placeholder={t("webhooks.form.namePlaceholder")}
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("webhooks.form.url")}</Label>
                                            <Input
                                                placeholder="https://example.com/webhook"
                                                value={newUrl}
                                                onChange={(e) => setNewUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("webhooks.form.secret")}</Label>
                                        <Input
                                            placeholder="your-secret-key"
                                            value={newSecret}
                                            onChange={(e) => setNewSecret(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t("webhooks.form.events")}</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {AVAILABLE_EVENTS.map(event => (
                                                <div key={event.id} className="flex items-center gap-2 p-2 rounded border">
                                                    <Switch
                                                        checked={newEvents.includes(event.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setNewEvents([...newEvents, event.id]);
                                                            } else {
                                                                setNewEvents(newEvents.filter(e => e !== event.id));
                                                            }
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{t(`webhooks.events.${event.key}.label`)}</p>
                                                        <p className="text-xs text-muted-foreground">{t(`webhooks.events.${event.key}.description`)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="ghost" onClick={() => {
                                            setShowNewForm(false);
                                            setNewName("");
                                            setNewUrl("");
                                            setNewSecret("");
                                        }}>{t("webhooks.form.cancel")}</Button>
                                        <Button onClick={handleSaveWebhook}>{t("webhooks.form.create")}</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Existing Webhooks */}
                        {loading ? (
                            <p className="text-center text-muted-foreground py-8">{t("webhooks.list.loading")}</p>
                        ) : webhooks.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                {t("webhooks.list.empty", { name: t("webhooks.section.add") })}
                            </p>
                        ) : (
                            webhooks.map((webhook) => (
                                <Card key={webhook.id} className={webhook.isActive ? "" : "opacity-60"}>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold flex items-center gap-2 flex-wrap">
                                                    <span className="truncate max-w-full">{webhook.name}</span>
                                                    <Badge variant={webhook.isActive ? "default" : "secondary"}>
                                                        {webhook.isActive ? t("webhooks.list.active") : t("webhooks.list.inactive")}
                                                    </Badge>
                                                    {webhook.sessionId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {webhook.sessionId}
                                                        </Badge>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-mono break-all">{webhook.url}</p>
                                            </div>
                                            <div className="flex items-center gap-1 sm:gap-2 self-end sm:self-start shrink-0">
                                                <Switch
                                                    checked={webhook.isActive}
                                                    onCheckedChange={(checked) => toggleWebhookActive(webhook.id, checked)}
                                                />
                                                <Button variant="ghost" size="sm" onClick={() => handleTestWebhook(webhook)} disabled={testingId === webhook.id} className="h-8 px-2">
                                                    {testingId === webhook.id ? t("webhooks.list.testing") : t("webhooks.list.test")}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(webhook)} className="h-8 px-2">
                                                    {t("webhooks.list.edit")}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteWebhook(webhook.id)} className="h-8 w-8">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Event Toggles */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">{t("webhooks.list.eventsToggle")}</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {AVAILABLE_EVENTS.map(event => (
                                                    <Badge
                                                        key={event.id}
                                                        variant={webhook.events.includes(event.id) ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => toggleEventForWebhook(webhook.id, event.id)}
                                                    >
                                                        {t(`webhooks.events.${event.key}.label`)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </SessionGuard>

            {/* Edit Webhook Dialog Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t("webhooks.form.editTitle")}</DialogTitle>
                        <DialogDescription>{t("webhooks.form.editDescription")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t("webhooks.form.name")}</Label>
                                <Input
                                    placeholder={t("webhooks.form.namePlaceholder")}
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t("webhooks.form.url")}</Label>
                                <Input
                                    placeholder="https://example.com/webhook"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t("webhooks.form.secret")}</Label>
                            <Input
                                placeholder="your-secret-key"
                                value={editSecret}
                                onChange={(e) => setEditSecret(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t("webhooks.form.events")}</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {AVAILABLE_EVENTS.map(event => (
                                    <div key={event.id} className="flex items-center gap-2 p-2 rounded border">
                                        <Switch
                                            checked={editEvents.includes(event.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setEditEvents([...editEvents, event.id]);
                                                } else {
                                                    setEditEvents(editEvents.filter(e => e !== event.id));
                                                }
                                            }}
                                        />
                                        <div>
                                            <p className="text-sm font-medium">{t(`webhooks.events.${event.key}.label`)}</p>
                                            <p className="text-xs text-muted-foreground">{t(`webhooks.events.${event.key}.description`)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>{t("webhooks.form.cancel")}</Button>
                        <Button onClick={handleUpdateWebhook}>{t("webhooks.form.save")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("webhooks.delete.title")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("webhooks.delete.description")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("webhooks.delete.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{t("webhooks.delete.confirm")}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
