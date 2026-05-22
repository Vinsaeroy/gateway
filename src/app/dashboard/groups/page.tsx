"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, RefreshCw } from "lucide-react";
import { SearchFilter } from "@/components/dashboard/search-filter";
import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { toast } from "sonner"; // Added import

// Define a type for Group if not already defined elsewhere
interface Group {
    id: string;
    subject: string;
    jid: string;
    participants?: any[];
}

export default function GroupsPage() {
    const { sessionId } = useSession();

    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchGroups = async (sessId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/groups/${sessId}`);
            if (res.ok) {
                const data = await res.json();
                setGroups(data?.data || []);
            } else {
                setGroups([]);
            }
        } catch (error) {
            toast.error("Failed to fetch groups");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchGroups(sessionId);
        } else {
            setGroups([]);
        }
    }, [sessionId]);

    const handleCreateGroup = async () => {
        if (!sessionId || !newGroupName) return;
        try {
            const res = await fetch(`/api/groups/${sessionId}/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, subject: newGroupName })
            });
            if (res.ok) {
                toast.success("Group created");
                setIsCreateOpen(false);
                setNewGroupName("");
                fetchGroups(sessionId);
            } else {
                toast.error("Failed to create group");
            }
        } catch (error) {
            toast.error("Failed to create group");
        }
    };

    const filteredGroups = groups.filter(g =>
        g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.jid.includes(searchTerm)
    );

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6" /> Groups
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {sessionId ? "Manage groups for active session." : "Select a session from the top bar."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => sessionId && fetchGroups(sessionId)} disabled={loading || !sessionId}>
                            <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setIsCreateOpen(true)} disabled={!sessionId}>
                            <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Create
                        </Button>
                    </div>
                </div>

                <SearchFilter
                    placeholder="Search groups..."
                    onSearch={setSearchTerm}
                />

                {/* Create Dialog */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-white dark:bg-background p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Create New Group</h2>
                            <div className="space-y-4">
                                <div>
                                    <Label>Group Subject</Label>
                                    <Input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="My New Group" />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateGroup}>Create</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Groups List */}
                {loading ? (
                    <div className="text-center p-8">Loading groups...</div>
                ) : filteredGroups.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg bg-slate-50">
                        {sessionId ? "No groups found matching criteria." : "No session selected."}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredGroups.map(group => (
                            <div key={group.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{group.subject}</h3>
                                    <div className="text-xs text-muted-foreground mt-1">{group.jid}</div>
                                    <div className="text-xs text-slate-500 mt-1">Participants: {group.participants?.length || 0}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SessionGuard>
    );
}
