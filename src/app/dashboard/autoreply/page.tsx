"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/dashboard/session-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { BotMessageSquare, Loader2, Plus, Trash2, MessageCircleReply, Image as ImageIcon, Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAutoReplies, createAutoReply, deleteAutoReply, updateAutoReply } from "./actions";
import { SessionGuard } from "@/components/dashboard/session-guard";

interface AutoReply {
    id: string;
    keyword: string;
    matchType: string;
    response: string;
    isMedia: boolean;
    mediaUrl: string | null;
    triggerType: string;
    createdAt: Date;
}

export default function AutoReplyPage() {
    const { sessionId } = useSession();
    const [rules, setRules] = useState<AutoReply[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Form states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const [keyword, setKeyword] = useState("");
    const [response, setResponse] = useState("");
    const [matchType, setMatchType] = useState("EXACT");
    const [triggerType, setTriggerType] = useState("ALL");

    // Edit states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editKeyword, setEditKeyword] = useState("");
    const [editResponse, setEditResponse] = useState("");
    const [editMatchType, setEditMatchType] = useState("EXACT");
    const [editTriggerType, setEditTriggerType] = useState("ALL");

    useEffect(() => {
        if (sessionId) {
            fetchRules();
        }
    }, [sessionId]);

    const fetchRules = async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            // Using direct Server Action instead of API route
            const data = await getAutoReplies(sessionId);
            setRules(data as unknown as AutoReply[]);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error fetching auto-replies");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!sessionId) return;
        if (!keyword.trim() || !response.trim()) {
            toast.error("Keyword and response are required");
            return;
        }

        setSubmitting(true);
        try {
            // Using direct Server Action instead of API route
            await createAutoReply(sessionId, {
                keyword: keyword.trim(),
                response: response.trim(),
                matchType,
                triggerType,
                isMedia: false, // For simplicity in this V1 UI
                mediaUrl: null
            });

            toast.success("Auto-reply rule created");
            setIsCreateOpen(false);
            fetchRules();
            resetForm();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error creating auto-reply");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (ruleId: string) => {
        if (!sessionId) return;
        try {
            // Using direct Server Action
            await deleteAutoReply(sessionId, ruleId);
            toast.success("Auto-reply deleted");
            fetchRules();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error deleting auto-reply");
        }
    };

    const resetForm = () => {
        setKeyword("");
        setResponse("");
        setMatchType("EXACT");
        setTriggerType("ALL");
    };

    const handleEdit = (rule: AutoReply) => {
        setEditId(rule.id);
        setEditKeyword(rule.keyword);
        setEditResponse(rule.response);
        setEditMatchType(rule.matchType);
        setEditTriggerType(rule.triggerType);
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!sessionId || !editId) return;
        if (!editKeyword.trim() || !editResponse.trim()) {
            toast.error("Keyword and response are required");
            return;
        }

        setSubmitting(true);
        try {
            await updateAutoReply(sessionId, editId, {
                keyword: editKeyword.trim(),
                response: editResponse.trim(),
                matchType: editMatchType,
                triggerType: editTriggerType,
                isMedia: false,
                mediaUrl: null
            });

            toast.success("Auto-reply rule updated");
            setIsEditOpen(false);
            fetchRules();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Error updating auto-reply");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SessionGuard>
            <div className="max-w-5xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Auto Replies Builder</h1>
                    <p className="text-muted-foreground">Setup rules to automatically respond to incoming messages.</p>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            New Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create Auto-Reply Rule</DialogTitle>
                            <DialogDescription>Add a new keyword-based response.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Keyword</Label>
                                    <Input 
                                        value={keyword} 
                                        onChange={(e) => setKeyword(e.target.value)} 
                                        placeholder="e.g. !help, ping" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Match Type</Label>
                                    <Select value={matchType} onValueChange={setMatchType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EXACT">Exact Match</SelectItem>
                                            <SelectItem value="CONTAINS">Contains</SelectItem>
                                            <SelectItem value="STARTS_WITH">Starts With</SelectItem>
                                            <SelectItem value="REGEX">Regex Pattern</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Trigger Audience</Label>
                                <Select value={triggerType} onValueChange={setTriggerType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Everyone & Groups</SelectItem>
                                        <SelectItem value="PRIVATE">Private Chats Only</SelectItem>
                                        <SelectItem value="GROUP">Group Chats Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Reply Message</Label>
                                <Textarea 
                                    value={response} 
                                    onChange={(e) => setResponse(e.target.value)} 
                                    placeholder="Thank you for your message! Our team will get back to you shortly." 
                                    className="min-h-[120px]"
                                />
                                <p className="text-xs text-muted-foreground">You can use standard WhatsApp formatting (*bold*, _italic_, ~strikethrough~)</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={submitting || !keyword.trim() || !response.trim()}>
                                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Rule"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : rules.length === 0 ? (
                <Card className="border-dashed shadow-none bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <BotMessageSquare className="w-12 h-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No auto-replies configured</h3>
                        <p className="text-muted-foreground mb-4">You haven't set up any automated responses yet.</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create your first rule</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.map((rule) => (
                        <Card key={rule.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1 pr-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-sm break-all">{rule.keyword}</span>
                                        </CardTitle>
                                        <div className="flex gap-2 flex-wrap text-xs">
                                            <Badge variant="outline" className="text-muted-foreground font-normal shrink-0">{rule.matchType}</Badge>
                                            <Badge variant="secondary" className="font-normal shrink-0 text-[10px]">{rule.triggerType}</Badge>
                                        </div>
                                    </div>
                                    <div className="shrink-0 flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted" onClick={() => handleEdit(rule)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete the auto-reply for keyword <strong>{rule.keyword}</strong>? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(rule.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 flex-grow flex flex-col">
                                <div className="text-sm text-foreground bg-muted/30 p-3 rounded-md border whitespace-pre-wrap flex-grow">
                                    {rule.response}
                                </div>
                                {rule.isMedia && (
                                    <div className="mt-3 text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                                        <ImageIcon className="w-3 h-3" /> Includes Media Attachment
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Auto-Reply Dialog Modal */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setEditId(null);
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Auto-Reply Rule</DialogTitle>
                        <DialogDescription>Modify the keyword-based response rule.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Keyword</Label>
                                <Input 
                                    value={editKeyword} 
                                    onChange={(e) => setEditKeyword(e.target.value)} 
                                    placeholder="e.g. !help, ping" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Match Type</Label>
                                <Select value={editMatchType} onValueChange={setEditMatchType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXACT">Exact Match</SelectItem>
                                        <SelectItem value="CONTAINS">Contains</SelectItem>
                                        <SelectItem value="STARTS_WITH">Starts With</SelectItem>
                                        <SelectItem value="REGEX">Regex Pattern</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Trigger Audience</Label>
                            <Select value={editTriggerType} onValueChange={setEditTriggerType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Everyone & Groups</SelectItem>
                                    <SelectItem value="PRIVATE">Private Chats Only</SelectItem>
                                    <SelectItem value="GROUP">Group Chats Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Reply Message</Label>
                            <Textarea 
                                value={editResponse} 
                                onChange={(e) => setEditResponse(e.target.value)} 
                                placeholder="Response text..." 
                                className="min-h-[120px]"
                            />
                            <p className="text-xs text-muted-foreground">You can use standard WhatsApp formatting (*bold*, _italic_, ~strikethrough~)</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdate} disabled={submitting || !editKeyword.trim() || !editResponse.trim()}>
                            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </SessionGuard>
    );
}
