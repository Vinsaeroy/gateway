"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, CalendarClock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import moment from "moment-timezone";
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
import { SearchFilter } from "@/components/dashboard/search-filter";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useTranslation } from "@/i18n/react";

interface ScheduledMessage {
    id: string;
    jid: string;
    content: string;
    sendAt: string;
    status: string;
    mediaUrl?: string;
    mediaType?: string;
}

export default function SchedulerPage() {
    const { sessionId: selectedSessionId } = useSession();
    const { t } = useTranslation();

    // ... rest of state
    const [messages, setMessages] = useState<ScheduledMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [systemTimezone, setSystemTimezone] = useState("Asia/Jakarta");

    // Form state ...
    const [showForm, setShowForm] = useState(false);
    const [newJid, setNewJid] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newSendAt, setNewSendAt] = useState("");
    const [newMediaUrl, setNewMediaUrl] = useState("");
    const [newMediaType, setNewMediaType] = useState("image");

    // Delete state
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Edit state
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editJid, setEditJid] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editSendAt, setEditSendAt] = useState("");
    const [editMediaUrl, setEditMediaUrl] = useState("");
    const [editMediaType, setEditMediaType] = useState("image");

    // Remove local updateSession logic as it is handled by provider

    useEffect(() => {
        // Fetch system timezone
        fetch('/api/settings/system')
            .then(res => res.json())
            .then(data => {
                if (data.status && data.data?.timezone) {
                    setSystemTimezone(data.data.timezone);
                }
            })
            .catch(() => { });

        if (selectedSessionId) {
            fetchMessages(selectedSessionId);
        } else {
            setMessages([]);
        }
    }, [selectedSessionId]);

    const fetchMessages = async (sessionId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/scheduler/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data?.data || []);
            } else {
                setMessages([]);
            }
        } catch (error) {
            toast.error(t("scheduler.toasts.fetchFail"));
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (msg: ScheduledMessage) => {
        setEditId(msg.id);
        const jidUser = msg.jid.split('@')[0];
        setEditJid(jidUser);
        setEditContent(msg.content);
        setEditMediaUrl(msg.mediaUrl || "");
        setEditMediaType(msg.mediaType || "image");

        // Format date for datetime-local input using correct system timezone
        const localIso = moment.tz(msg.sendAt, systemTimezone).format('YYYY-MM-DDTHH:mm');
        setEditSendAt(localIso);
        setIsEditOpen(true);
    };

    const handleSaveSchedule = async () => {
        if (!selectedSessionId || !newJid || !newContent || !newSendAt) return;

        // Append domain if missing
        let jid = newJid;
        if (!jid.includes("@")) {
            jid = jid + "@s.whatsapp.net"; // Default to private chat
        }

        try {
            const res = await fetch(`/api/scheduler/${selectedSessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jid,
                    content: newContent,
                    sendAt: newSendAt,
                    mediaUrl: newMediaUrl,
                    mediaType: newMediaType
                })
            });

            if (res.ok) {
                toast.success(t("scheduler.toasts.created"));
                setShowForm(false);
                setNewJid("");
                setNewContent("");
                setNewSendAt("");
                setNewMediaUrl("");
                setNewMediaType("image");
                fetchMessages(selectedSessionId);
            } else {
                toast.error(t("scheduler.toasts.createFail"));
            }
        } catch (error) {
            toast.error(t("scheduler.toasts.error"));
        }
    };

    const handleUpdateSchedule = async () => {
        if (!selectedSessionId || !editId || !editJid || !editContent || !editSendAt) return;

        let jid = editJid;
        if (!jid.includes("@")) {
            jid = jid + "@s.whatsapp.net";
        }

        try {
            const res = await fetch(`/api/scheduler/${selectedSessionId}/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jid,
                    content: editContent,
                    sendAt: editSendAt,
                    mediaUrl: editMediaUrl,
                    mediaType: editMediaType
                })
            });

            if (res.ok) {
                toast.success(t("scheduler.toasts.updated"));
                setIsEditOpen(false);
                setEditId(null);
                setEditJid("");
                setEditContent("");
                setEditSendAt("");
                setEditMediaUrl("");
                setEditMediaType("image");
                fetchMessages(selectedSessionId);
            } else {
                toast.error(t("scheduler.toasts.updateFail"));
            }
        } catch (error) {
            toast.error(t("scheduler.toasts.error"));
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/scheduler/${selectedSessionId}/${deleteId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success(t("scheduler.toasts.cancelled"));
                setMessages(messages.filter(m => m.id !== deleteId));
            } else {
                toast.error(t("scheduler.toasts.cancelFail"));
            }
        } catch (error) {
            toast.error(t("scheduler.toasts.cancelFail"));
        } finally {
            setDeleteId(null);
        }
    };

    const filteredMessages = messages.filter(m =>
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.jid.includes(searchTerm)
    );

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" /> {t("scheduler.title")}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {selectedSessionId ? t("scheduler.subtitleActive") : t("scheduler.subtitleNoSession")}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => selectedSessionId && fetchMessages(selectedSessionId)} disabled={loading || !selectedSessionId}>
                            <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {t("scheduler.refresh")}
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => {
                            setNewJid("");
                            setNewContent("");
                            setNewSendAt("");
                            setNewMediaUrl("");
                            setNewMediaType("image");
                            setShowForm(!showForm);
                        }} disabled={!selectedSessionId}>
                            <Plus className="h-4 w-4 mr-1 sm:mr-2" /> {t("scheduler.schedule")}
                        </Button>
                    </div>
                </div>

                <SearchFilter
                    placeholder={t("scheduler.searchPlaceholder")}
                    onSearch={setSearchTerm}
                />

                {/* New Schedule Form */}
                {showForm && (
                    <Card className="border-2 border-primary/20">
                        <CardHeader>
                            <CardTitle>{t("scheduler.form.title")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.recipientJid")}</Label>
                                    <div className="flex gap-2">
                                        <Select onValueChange={(val) => {
                                            if (val === "GROUP" && !newJid.endsWith("@g.us")) setNewJid(newJid + "@g.us");
                                            if (val === "PRIVATE" && !newJid.endsWith("@s.whatsapp.net")) setNewJid(newJid + "@s.whatsapp.net");
                                            if (val === "NEWSLETTER" && !newJid.endsWith("@newsletter")) setNewJid(newJid + "@newsletter");
                                        }}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue placeholder={t("scheduler.form.typePlaceholder")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PRIVATE">{t("scheduler.form.typePrivate")}</SelectItem>
                                                <SelectItem value="GROUP">{t("scheduler.form.typeGroup")}</SelectItem>
                                                <SelectItem value="NEWSLETTER">{t("scheduler.form.typeChannel")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={newJid}
                                            onChange={e => setNewJid(e.target.value)}
                                            placeholder={t("scheduler.form.jidPlaceholder")}
                                            className="flex-1"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t("scheduler.form.jidHint")}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.sendAt")}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newSendAt}
                                        onChange={e => setNewSendAt(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t("scheduler.form.message")}</Label>
                                <Textarea
                                    value={newContent}
                                    onChange={e => setNewContent(e.target.value)}
                                    placeholder={t("scheduler.form.messagePlaceholder")}
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.mediaUrl")}</Label>
                                    <Input
                                        value={newMediaUrl}
                                        onChange={e => setNewMediaUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.mediaType")}</Label>
                                    <Select value={newMediaType} onValueChange={setNewMediaType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">{t("scheduler.form.mediaImage")}</SelectItem>
                                            <SelectItem value="video">{t("scheduler.form.mediaVideo")}</SelectItem>
                                            <SelectItem value="document">{t("scheduler.form.mediaDocument")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => {
                                    setShowForm(false);
                                    setNewJid("");
                                    setNewContent("");
                                    setNewSendAt("");
                                    setNewMediaUrl("");
                                    setNewMediaType("image");
                                }}>{t("scheduler.form.cancel")}</Button>
                                <Button onClick={handleSaveSchedule}>{t("scheduler.form.submit")}</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Messages List */}
                {loading ? (
                    <div className="text-center p-8">{t("scheduler.list.loading")}</div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50">
                        {selectedSessionId ? t("scheduler.list.empty") : t("scheduler.list.noSession")}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredMessages.map(msg => (
                            <Card key={msg.id} className={msg.status === 'SENT' ? 'opacity-70' : ''}>
                                <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4">
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {msg.jid.split('@')[0]}
                                            <span className={`text-xs px-2 py-0.5 rounded font-normal ${msg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                msg.status === 'SENT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium mt-1">{msg.content}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {t("scheduler.list.scheduledFor", { date: new Date(msg.sendAt).toLocaleString() })}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(msg)} disabled={msg.status !== 'PENDING'}>
                                            {t("scheduler.list.edit")}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(msg.id)} className="text-destructive hover:text-destructive hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{t("scheduler.delete.title")}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {t("scheduler.delete.description")}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{t("scheduler.delete.close")}</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">{t("scheduler.delete.confirm")}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Edit Scheduled Message Dialog Modal */}
                <Dialog open={isEditOpen} onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) {
                        setEditId(null);
                        setEditJid("");
                        setEditContent("");
                        setEditSendAt("");
                        setEditMediaUrl("");
                        setEditMediaType("image");
                    }
                }}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{t("scheduler.edit.title")}</DialogTitle>
                            <DialogDescription>{t("scheduler.edit.description")}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.recipientJid")}</Label>
                                    <Input
                                        value={editJid}
                                        onChange={e => setEditJid(e.target.value)}
                                        placeholder={t("scheduler.edit.jidPlaceholder")}
                                    />
                                    <p className="text-xs text-muted-foreground">{t("scheduler.edit.jidHint")}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.sendAt")}</Label>
                                    <Input
                                        type="datetime-local"
                                        value={editSendAt}
                                        onChange={e => setEditSendAt(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>{t("scheduler.form.message")}</Label>
                                <Textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    placeholder={t("scheduler.form.messagePlaceholder")}
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.mediaUrl")}</Label>
                                    <Input
                                        value={editMediaUrl}
                                        onChange={e => setEditMediaUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t("scheduler.form.mediaType")}</Label>
                                    <Select value={editMediaType} onValueChange={setEditMediaType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">{t("scheduler.form.mediaImage")}</SelectItem>
                                            <SelectItem value="video">{t("scheduler.form.mediaVideo")}</SelectItem>
                                            <SelectItem value="document">{t("scheduler.form.mediaDocument")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>{t("scheduler.form.cancel")}</Button>
                            <Button onClick={handleUpdateSchedule}>{t("scheduler.edit.save")}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </SessionGuard>
    );
}
