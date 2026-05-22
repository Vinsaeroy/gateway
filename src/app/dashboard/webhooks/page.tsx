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
    { id: "message.received", label: "Message Received", description: "When a new message is received" },
    { id: "message.sent", label: "Message Sent", description: "When a message is sent" },
    { id: "message.status", label: "Message Status", description: "When message status changes (delivered, read)" },
    { id: "connection.update", label: "Connection Update", description: "When session connects/disconnects" },
    { id: "group.update", label: "Group Update", description: "When group info changes" },
    { id: "group.participant", label: "Group Member", description: "When participants join, leave, or change roles" },
    { id: "contact.update", label: "Contact Update", description: "When contact info changes" },
    { id: "status.update", label: "Status/Story", description: "When a status is posted or viewed" },
    { id: "message.edited", label: "Message Edited", description: "When a message is edited" },
    { id: "message.deleted", label: "Message Deleted", description: "When a message is revoked/deleted" },
];

import { useSession } from "@/components/dashboard/session-provider";

export default function WebhooksPage() {
    const { sessionId, sessions } = useSession(); // Get active session ID and list of sessions
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showRegenConfirm, setShowRegenConfirm] = useState(false);

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
                setApiKey(data?.data?.apiKey);
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
                setApiKey(data?.data?.apiKey);
                toast.success("New API key generated!");
            }
        } catch (error) {
            toast.error("Failed to generate API key");
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
            toast.error("Name, URL, and at least one event are required");
            return;
        }

        if (!sessionId) {
            toast.error("No active session selected");
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
                toast.success("Webhook created!");
                setShowNewForm(false);
                setNewName("");
                setNewUrl("");
                setNewSecret("");
                setNewEvents(["message.received", "message.sent"]);
                fetchWebhooks();
            } else {
                toast.error("Failed to create webhook");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleUpdateWebhook = async () => {
        if (!editName || !editUrl || editEvents.length === 0) {
            toast.error("Name, URL, and at least one event are required");
            return;
        }

        if (!sessionId || !editingId) {
            toast.error("No active session selected");
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
                toast.success("Webhook updated!");
                setIsEditOpen(false);
                setEditingId(null);
                fetchWebhooks();
            } else {
                toast.error("Failed to update webhook");
            }
        } catch (error) {
            toast.error("An error occurred");
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
            toast.error("Failed to update webhook");
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
            toast.error("Failed to update webhook events");
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
            toast.success("Webhook deleted");
        } catch (error) {
            toast.error("Failed to delete webhook");
        } finally {
            setDeleteId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold">Webhooks & API</h1>
            </div>

            {/* API Key Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" /> API Key
                    </CardTitle>
                    <CardDescription>
                        Use this key to authenticate API requests. Include it in the X-API-Key header.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="flex-1 bg-slate-100 rounded-md p-2 sm:p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                            {apiKey ? (
                                showApiKey ? apiKey : "••••••••••••••••••••••••••••••••"
                            ) : (
                                <span className="text-muted-foreground">No API key generated</span>
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
                            if (apiKey) {
                                setShowRegenConfirm(true);
                            } else {
                                generateNewApiKey();
                            }
                        }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {apiKey ? "Regenerate" : "Generate"}
                        </Button>
                    </div>
                    {apiKey && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Example: <code className="bg-slate-100 px-1 py-0.5 rounded">curl -H "X-API-Key: {apiKey?.slice(0, 10)}..." http://your-server/api/sessions</code>
                        </p>
                    )}
                </CardContent>

                {/* API Key Regeneration Confirmation */}
                <AlertDialog open={showRegenConfirm} onOpenChange={setShowRegenConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Regenerate API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will invalidate your current API key. All existing integrations using the old key will stop working immediately. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { setShowRegenConfirm(false); generateNewApiKey(); }} className="bg-red-600 hover:bg-red-700">Regenerate</AlertDialogAction>
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
                                    <Webhook className="h-5 w-5" /> Webhooks
                                </CardTitle>
                                <CardDescription>
                                    Send real-time events to external URLs when activities happen in WhatsApp.
                                </CardDescription>
                            </div>
                            <Button onClick={() => {
                                setNewName("");
                                setNewUrl("");
                                setNewSecret("");
                                setNewEvents(["message.received", "message.sent"]);
                                setShowNewForm(!showNewForm);
                            }}>
                                <Plus className="h-4 w-4 mr-2" /> Add Webhook
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* New Webhook Form */}
                        {showNewForm && (
                            <Card className="border-dashed border-2">
                                <CardHeader>
                                    <CardTitle>New Webhook</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Name</Label>
                                            <Input
                                                placeholder="My Server"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Webhook URL</Label>
                                            <Input
                                                placeholder="https://example.com/webhook"
                                                value={newUrl}
                                                onChange={(e) => setNewUrl(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secret (optional, for HMAC signature)</Label>
                                        <Input
                                            placeholder="your-secret-key"
                                            value={newSecret}
                                            onChange={(e) => setNewSecret(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Events</Label>
                                        <div className="grid grid-cols-2 gap-2">
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
                                                        <p className="text-sm font-medium">{event.label}</p>
                                                        <p className="text-xs text-muted-foreground">{event.description}</p>
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
                                        }}>Cancel</Button>
                                        <Button onClick={handleSaveWebhook}>Create Webhook</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Existing Webhooks */}
                        {loading ? (
                            <p className="text-center text-muted-foreground py-8">Loading...</p>
                        ) : webhooks.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No webhooks configured for this session. Click "Add Webhook" to create one.
                            </p>
                        ) : (
                            webhooks.map((webhook) => (
                                <Card key={webhook.id} className={webhook.isActive ? "" : "opacity-60"}>
                                    <CardContent className="pt-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    {webhook.name}
                                                    <Badge variant={webhook.isActive ? "default" : "secondary"}>
                                                        {webhook.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                    {webhook.sessionId && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {webhook.sessionId}
                                                        </Badge>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={webhook.isActive}
                                                    onCheckedChange={(checked) => toggleWebhookActive(webhook.id, checked)}
                                                />
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(webhook)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => deleteWebhook(webhook.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Event Toggles */}
                                        <div className="space-y-2">
                                            <Label className="text-xs">Events (click to toggle)</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {AVAILABLE_EVENTS.map(event => (
                                                    <Badge
                                                        key={event.id}
                                                        variant={webhook.events.includes(event.id) ? "default" : "outline"}
                                                        className="cursor-pointer"
                                                        onClick={() => toggleEventForWebhook(webhook.id, event.id)}
                                                    >
                                                        {event.label}
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
                        <DialogTitle>Edit Webhook</DialogTitle>
                        <DialogDescription>Modify the webhook endpoint configuration and subscribed events.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    placeholder="My Server"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Webhook URL</Label>
                                <Input
                                    placeholder="https://example.com/webhook"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Secret (optional, for HMAC signature)</Label>
                            <Input
                                placeholder="your-secret-key"
                                value={editSecret}
                                onChange={(e) => setEditSecret(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Events</Label>
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
                                            <p className="text-sm font-medium">{event.label}</p>
                                            <p className="text-xs text-muted-foreground">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateWebhook}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the webhook configuration.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
