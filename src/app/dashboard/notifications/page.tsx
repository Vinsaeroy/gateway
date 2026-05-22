
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react"; // Use client session for Role check UI-side

export default function NotificationAdminPage() {
    // Note: Server-side protection is also needed.
    // For now assuming Layout or Middleware handles role check, or API sends 403.

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [type, setType] = useState("INFO");
    const [broadcast, setBroadcast] = useState(true);
    const [targetUserId, setTargetUserId] = useState("");
    const [href, setHref] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!title || !message) return toast.error("Title and Message are required");
        if (!broadcast && !targetUserId) return toast.error("Target User ID is required for non-broadcast");

        setLoading(true);
        try {
            const res = await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    message,
                    type,
                    broadcast,
                    targetUserId: broadcast ? undefined : targetUserId,
                    href
                })
            });

            if (res.ok) {
                const responseData = await res.json();
                const data = responseData?.data || {};
                toast.success(`Notification sent successfully! (Count: ${data.count || 1})`);
                // Reset form
                setTitle("");
                setMessage("");
                setHref("");
            } else {
                toast.error("Failed to send notification");
            }
        } catch (e) {
            toast.error("Error sending notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
                    <Bell className="h-6 w-6 sm:h-8 sm:w-8" /> Notification Manager
                </h1>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Compose Notification</CardTitle>
                        <CardDescription>Send alerts to users or system-wide broadcasts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. System Maintenance" />
                        </div>

                        <div className="space-y-2">
                            <Label>Message</Label>
                            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Detailed message..." />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INFO">Info</SelectItem>
                                        <SelectItem value="WARNING">Warning</SelectItem>
                                        <SelectItem value="SUCCESS">Success</SelectItem>
                                        <SelectItem value="SYSTEM">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Action Link (Optional)</Label>
                                <Input value={href} onChange={e => setHref(e.target.value)} placeholder="/dashboard/settings" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <Switch id="broadcast" checked={broadcast} onCheckedChange={setBroadcast} />
                            <Label htmlFor="broadcast">Broadcast to ALL Users</Label>
                        </div>

                        {!broadcast && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <Label>Target User ID</Label>
                                <Input value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder="User ID (cuid)" />
                            </div>
                        )}

                        <div className="pt-4">
                            <Button className="w-full" onClick={handleSend} disabled={loading}>
                                {loading ? <CheckCircle2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Send Notification
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-base text-muted-foreground">Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-3 items-start">
                                <div className={`p-2 rounded-full ${type === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : type === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{title || "Notification Title"}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{message || "Notification message content will appear here."}</p>
                                    <p className="text-[10px] text-slate-400 mt-2">Just now</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
