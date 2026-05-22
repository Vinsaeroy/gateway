"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Radio, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/components/dashboard/session-provider";

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
}

export default function AutoBroadcastPage() {
    const [broadcasts, setBroadcasts] = useState<AutoBroadcast[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [mediaType, setMediaType] = useState("");
    const [targets, setTargets] = useState<string[]>(["ALL"]);
    const [intervalMin, setIntervalMin] = useState(60);

    const { sessionId } = useSession();

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
            toast.error("Failed to fetch auto broadcasts");
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch(`/api/groups/${sessionId}`);
            const data = await res.json();
            if (data.status) setGroups(data.data || []);
        } catch (_error) { }
    };

    const resetForm = () => {
        setName("");
        setMessage("");
        setMediaUrl("");
        setMediaType("");
        setTargets(["ALL"]);
        setIntervalMin(60);
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!name || !message) {
            toast.error("Name and message are required");
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
                toast.success(editingId ? "Broadcast updated" : "Broadcast created");
                resetForm();
                setShowForm(false);
                fetchBroadcasts();
            } else {
                toast.error(data.message);
            }
        } catch (_error) {
            toast.error("Failed to save broadcast");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this auto broadcast?")) return;
        try {
            const res = await fetch(`/api/autobroadcast/${sessionId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.status) {
                toast.success("Deleted");
                fetchBroadcasts();
            }
        } catch (_error) {
            toast.error("Failed to delete");
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
                toast.success(isActive ? "Activated" : "Paused");
                fetchBroadcasts();
            }
        } catch (_error) {
            toast.error("Failed to update");
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
            const newTargets = targets.filter(t => t !== jid);
            setTargets(newTargets.length === 0 ? ["ALL"] : newTargets);
        } else {
            setTargets([...targets, jid]);
        }
    };

    if (!sessionId) {
        return (
            <div className="p-6 text-center text-muted-foreground">
                Please select a session first.
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Auto Broadcast</h1>
                    <p className="text-muted-foreground">Send recurring messages to groups automatically</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> New Broadcast
                </Button>
            </div>

            {/* Broadcast List */}
            <div className="grid gap-4">
                {broadcasts.length === 0 && (
                    <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                            No auto broadcasts configured. Click &quot;New Broadcast&quot; to create one.
                        </CardContent>
                    </Card>
                )}

                {broadcasts.map(b => (
                    <Card key={b.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{b.name}</h3>
                                        <Badge variant={b.isActive ? "default" : "secondary"}>
                                            {b.isActive ? "Active" : "Paused"}
                                        </Badge>
                                        {b.mediaType && (
                                            <Badge variant="outline">{b.mediaType}</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{b.message}</p>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Every {b.intervalMin} min
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {b.targets.includes("ALL") ? "All Groups" : `${b.targets.length} groups`}
                                        </span>
                                        {b.lastSentAt && (
                                            <span>Last sent: {new Date(b.lastSentAt).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={b.isActive}
                                        onCheckedChange={(checked) => handleToggle(b.id, checked)}
                                    />
                                    <Button size="icon" variant="ghost" onClick={() => handleEdit(b)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(b.id)}>
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
                        <DialogTitle>{editingId ? "Edit" : "New"} Auto Broadcast</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Promo Pagi" />
                        </div>

                        <div>
                            <Label>Message / Caption</Label>
                            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message text..." rows={4} />
                        </div>

                        <div>
                            <Label>Media URL (optional)</Label>
                            <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
                        </div>

                        {mediaUrl && (
                            <div>
                                <Label>Media Type</Label>
                                <Select value={mediaType} onValueChange={setMediaType}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="document">Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div>
                            <Label>Interval (minutes)</Label>
                            <Select value={String(intervalMin)} onValueChange={v => setIntervalMin(Number(v))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">Every 30 minutes</SelectItem>
                                    <SelectItem value="60">Every 1 hour</SelectItem>
                                    <SelectItem value="120">Every 2 hours</SelectItem>
                                    <SelectItem value="180">Every 3 hours</SelectItem>
                                    <SelectItem value="360">Every 6 hours</SelectItem>
                                    <SelectItem value="720">Every 12 hours</SelectItem>
                                    <SelectItem value="1440">Every 24 hours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Target Groups</Label>
                            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                                <div
                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer ${targets.includes("ALL") ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                                    onClick={() => setTargets(["ALL"])}
                                >
                                    <Radio className="h-4 w-4" />
                                    <span className="text-sm font-medium">All Groups</span>
                                </div>
                                {groups.map(g => (
                                    <div
                                        key={g.jid}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${targets.includes(g.jid) ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}
                                        onClick={() => toggleGroupTarget(g.jid)}
                                    >
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm">{g.subject || g.jid}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={loading} className="w-full">
                            {loading ? "Saving..." : (editingId ? "Update" : "Create")} Broadcast
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
