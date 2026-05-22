"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    ImageIcon,
    Video,
    Music,
    FileText,
    Trash2,
    Search,
    Download,
    Eye,
    HardDrive,
    Files,
    CheckSquare,
    Square,
    X,
    RefreshCw,
    FolderOpen,
    ChevronDown,
    ChevronRight,
    User as UserIcon,
    Smartphone,
    Contact,
} from "lucide-react";

interface MediaFile {
    name: string;
    size: number;
    type: "image" | "video" | "audio" | "document";
    ext: string;
    sessionId: string;
    sessionName: string;
    ownerName: string;
    ownerId: string;
    from: string;
    fromName: string | null;
    fromMe: boolean;
    createdAt: string;
    modifiedAt: string;
    url: string;
}

interface MediaListResponse {
    files: MediaFile[];
    totalSize: number;
    totalCount: number;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getTypeBg(type: string) {
    switch (type) {
        case "image": return "bg-blue-500/10";
        case "video": return "bg-purple-500/10";
        case "audio": return "bg-orange-500/10";
        default: return "bg-emerald-500/10";
    }
}

function getTypeIcon(type: string) {
    switch (type) {
        case "image": return <ImageIcon className="h-5 w-5 text-blue-500" />;
        case "video": return <Video className="h-5 w-5 text-purple-500" />;
        case "audio": return <Music className="h-5 w-5 text-orange-500" />;
        default: return <FileText className="h-5 w-5 text-emerald-500" />;
    }
}

function getSenderDisplay(file: MediaFile): string {
    if (file.fromMe) return "Me (Sent)";
    if (file.fromName) return file.fromName;
    if (file.from && file.from !== "Unknown") return file.from.split("@")[0];
    return "Unknown";
}

// --- Grouped types ---
interface SenderGroup {
    senderKey: string;
    senderDisplay: string;
    files: MediaFile[];
    totalSize: number;
}

interface SessionGroup {
    sessionId: string;
    sessionName: string;
    totalSize: number;
    senders: SenderGroup[];
}

interface UserGroup {
    ownerId: string;
    ownerName: string;
    totalSize: number;
    sessions: SessionGroup[];
}

export default function MediaPage() {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [totalSize, setTotalSize] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/media");
            if (!res.ok) throw new Error("Failed to fetch");
            const responseData = await res.json();
            const mediaData = responseData?.data || {};
            setFiles(mediaData.files || []);
            setTotalSize(mediaData.totalSize || 0);
            setTotalCount(mediaData.totalCount || 0);
        } catch (error) {
            console.error("Failed to load media:", error);
            toast.error("Failed to load media files");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMedia(); }, []);

    const filteredFiles = useMemo(() => {
        return files.filter((f) => {
            const q = searchQuery.toLowerCase();
            const matchSearch = !q ||
                f.name.toLowerCase().includes(q) ||
                f.sessionId.toLowerCase().includes(q) ||
                f.sessionName.toLowerCase().includes(q) ||
                f.ownerName.toLowerCase().includes(q) ||
                f.from.toLowerCase().includes(q) ||
                (f.fromName || "").toLowerCase().includes(q);
            const matchType = filterType === "all" || f.type === filterType;
            return matchSearch && matchType;
        });
    }, [files, searchQuery, filterType]);

    // Build 3-level grouping: User → Session → Sender
    const grouped = useMemo((): UserGroup[] => {
        const usersMap: Record<string, UserGroup> = {};

        for (const file of filteredFiles) {
            // User level
            if (!usersMap[file.ownerId]) {
                usersMap[file.ownerId] = {
                    ownerId: file.ownerId,
                    ownerName: file.ownerName,
                    totalSize: 0,
                    sessions: [],
                };
            }
            const userGroup = usersMap[file.ownerId];
            userGroup.totalSize += file.size;

            // Session level
            let sessionGroup = userGroup.sessions.find(s => s.sessionId === file.sessionId);
            if (!sessionGroup) {
                sessionGroup = {
                    sessionId: file.sessionId,
                    sessionName: file.sessionName,
                    totalSize: 0,
                    senders: [],
                };
                userGroup.sessions.push(sessionGroup);
            }
            sessionGroup.totalSize += file.size;

            // Sender level
            const senderKey = file.fromMe ? "_me_" : file.from;
            let senderGroup = sessionGroup.senders.find(s => s.senderKey === senderKey);
            if (!senderGroup) {
                senderGroup = {
                    senderKey,
                    senderDisplay: getSenderDisplay(file),
                    files: [],
                    totalSize: 0,
                };
                sessionGroup.senders.push(senderGroup);
            }
            senderGroup.files.push(file);
            senderGroup.totalSize += file.size;
        }

        // Sort all levels by size desc
        const result = Object.values(usersMap).sort((a, b) => b.totalSize - a.totalSize);
        result.forEach(u => {
            u.sessions.sort((a, b) => b.totalSize - a.totalSize);
            u.sessions.forEach(s => s.senders.sort((a, b) => b.totalSize - a.totalSize));
        });
        return result;
    }, [filteredFiles]);

    // Collapse all by default when grouped dependencies change (e.g on initial load or search)
    useEffect(() => {
        const allKeys = new Set<string>();
        grouped.forEach(userGroup => {
            allKeys.add(`user:${userGroup.ownerId}`);
            userGroup.sessions.forEach(sessionGroup => {
                allKeys.add(`session:${userGroup.ownerId}:${sessionGroup.sessionId}`);
                sessionGroup.senders.forEach(sender => {
                    allKeys.add(`sender:${userGroup.ownerId}:${sessionGroup.sessionId}:${sender.senderKey}`);
                });
            });
        });
        setCollapsed(allKeys);
    }, [grouped]);

    const toggleCollapse = (key: string) => {
        setCollapsed(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const toggleSelect = (name: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
    };

    const selectAllInGroup = (groupFiles: MediaFile[]) => {
        setSelected(prev => {
            const next = new Set(prev);
            const allSelected = groupFiles.every(f => next.has(f.name));
            groupFiles.forEach(f => allSelected ? next.delete(f.name) : next.add(f.name));
            return next;
        });
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = async () => {
        if (selected.size === 0) return;
        setShowDeleteConfirm(false);
        setDeleting(true);
        try {
            const res = await fetch("/api/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filenames: Array.from(selected) }),
            });
            if (!res.ok) throw new Error("Failed to delete");
            const responseData = await res.json();
            const data = responseData?.data;
            toast.success(`Deleted ${data?.deleted || 0} file(s)`);
            if (data?.failed > 0) toast.warning(`Failed to delete ${data.failed} file(s)`);
            setSelected(new Set());
            fetchMedia();
        } catch { toast.error("Failed to delete files"); }
        finally { setDeleting(false); }
    };

    const stats = useMemo(() => {
        const r = { image: 0, video: 0, audio: 0, document: 0 };
        files.forEach(f => r[f.type]++);
        return r;
    }, [files]);

    const ChevronIcon = ({ id }: { id: string }) =>
        collapsed.has(id) ? <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />;

    return (
        <div className="space-y-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Media Manager</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage downloaded media files</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 self-start" onClick={fetchMedia} disabled={loading}>
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { icon: <HardDrive className="h-4 w-4 text-primary" />, bg: "bg-primary/10", value: formatFileSize(totalSize), label: "Total Size" },
                    { icon: <Files className="h-4 w-4 text-blue-500" />, bg: "bg-blue-500/10", value: totalCount, label: "Total Files" },
                    { icon: <ImageIcon className="h-4 w-4 text-blue-500" />, bg: "bg-blue-500/10", value: stats.image, label: "Images" },
                    { icon: <Video className="h-4 w-4 text-purple-500" />, bg: "bg-purple-500/10", value: stats.video + stats.audio + stats.document, label: "Other" },
                ].map((s) => (
                    <Card key={s.label} className="border-border/40">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
                            <div>
                                <p className="text-lg font-bold text-foreground">{s.value}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search by filename, session, user, or sender..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 pl-8 text-sm" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {["all", "image", "video", "audio", "document"].map((t) => (
                        <Button key={t} variant={filterType === t ? "default" : "outline"} size="sm" className="h-9 text-xs capitalize px-3" onClick={() => setFilterType(t)}>{t}</Button>
                    ))}
                </div>
            </div>

            {/* Selection Bar */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 p-2.5 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <span className="text-sm font-medium">{selected.size} selected</span>
                    <Button variant="destructive" size="sm" className="gap-1.5 h-8" onClick={() => setShowDeleteConfirm(true)} disabled={deleting}>
                        <Trash2 className="h-3.5 w-3.5" /> {deleting ? "Deleting..." : "Delete"}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelected(new Set())}><X className="h-3.5 w-3.5 mr-1" /> Clear</Button>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-12 w-full rounded-lg" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pl-4">
                                {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} className="h-36 rounded-lg" />)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : grouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                        <FolderOpen className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {searchQuery || filterType !== "all" ? "No media files match your filters" : "No media files downloaded yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {grouped.map((userGroup) => {
                        const userId = `user:${userGroup.ownerId}`;
                        const isUserCollapsed = collapsed.has(userId);
                        const userFileCount = userGroup.sessions.reduce((sum, s) => sum + s.senders.reduce((ss, sn) => ss + sn.files.length, 0), 0);

                        return (
                            <div key={userGroup.ownerId} className="flex flex-col gap-3">
                                {/* User Level Header */}
                                <div className="flex items-center justify-between pb-2 border-b border-border">
                                    <button className="flex items-center gap-2 hover:opacity-80 transition-opacity" onClick={() => toggleCollapse(userId)}>
                                        <ChevronIcon id={userId} />
                                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                                            <UserIcon className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-foreground leading-tight text-left">{userGroup.ownerName}</h2>
                                            <p className="text-[10px] text-muted-foreground text-left">User Account</p>
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                                        <span>{userGroup.sessions.length} Session{userGroup.sessions.length !== 1 ? "s" : ""}</span>
                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                        <span>{userFileCount} Media</span>
                                        <span className="w-1 h-1 rounded-full bg-border"></span>
                                        <span className="font-semibold">{formatFileSize(userGroup.totalSize)}</span>
                                    </div>
                                </div>

                                {!isUserCollapsed && (
                                    <div className="space-y-4 pl-2 sm:pl-4 border-l-2 border-border/30 ml-2">
                                        {userGroup.sessions.map((sessionGroup) => {
                                            const sessionKey = `session:${userGroup.ownerId}:${sessionGroup.sessionId}`;
                                            const isSessionCollapsed = collapsed.has(sessionKey);
                                            const sessionFileCount = sessionGroup.senders.reduce((sum, s) => sum + s.files.length, 0);

                                            return (
                                                <Card key={sessionGroup.sessionId} className="overflow-hidden border-border/50 shadow-sm">
                                                    {/* Session Level Header */}
                                                    <div className="bg-muted/20 px-4 py-3 flex items-center justify-between border-b border-border/50">
                                                        <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity" onClick={() => toggleCollapse(sessionKey)}>
                                                            <ChevronIcon id={sessionKey} />
                                                            <div className="h-6 w-6 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                                                <Smartphone className="h-3 w-3 text-blue-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-foreground truncate">{sessionGroup.sessionName}</p>
                                                                <p className="text-[10px] text-muted-foreground truncate">{sessionGroup.sessionId}</p>
                                                            </div>
                                                        </button>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>{sessionFileCount} Media</span>
                                                            <span className="w-1 h-1 rounded-full bg-border"></span>
                                                            <span className="font-medium text-foreground">{formatFileSize(sessionGroup.totalSize)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Senders List */}
                                                    {!isSessionCollapsed && (
                                                        <div className="divide-y divide-border/20">
                                                            {sessionGroup.senders.map((sender) => {
                                                                const senderKey = `sender:${userGroup.ownerId}:${sessionGroup.sessionId}:${sender.senderKey}`;
                                                                const isSenderCollapsed = collapsed.has(senderKey);
                                                                const allSelected = sender.files.length > 0 && sender.files.every(f => selected.has(f.name));

                                                                return (
                                                                    <div key={sender.senderKey} className="bg-background">
                                                                        {/* Sender Level Header */}
                                                                        <div className="flex items-center gap-2 px-4 py-2 hover:bg-muted/10 transition-colors">
                                                                            <button className="flex items-center gap-2 flex-1 min-w-0 text-left" onClick={() => toggleCollapse(senderKey)}>
                                                                                <ChevronIcon id={senderKey} />
                                                                                <Contact className="h-3.5 w-3.5 text-muted-foreground/70 flex-shrink-0" />
                                                                                <span className="text-xs font-medium text-foreground truncate">{sender.senderDisplay}</span>
                                                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded ml-1">
                                                                                    {sender.files.length} • {formatFileSize(sender.totalSize)}
                                                                                </span>
                                                                            </button>
                                                                            <button onClick={() => selectAllInGroup(sender.files)} className="p-1 hover:bg-muted rounded transition-colors" title={allSelected ? "Deselect All" : "Select All"}>
                                                                                {allSelected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground/40" />}
                                                                            </button>
                                                                        </div>

                                                                        {/* Files Grid */}
                                                                        {!isSenderCollapsed && (
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 px-4 pb-4 pt-1">
                                                                                {sender.files.map((file) => {
                                                                                    const isSelected = selected.has(file.name);
                                                                                    return (
                                                                                        <Card key={file.name} className={`group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 ring-primary border-primary" : "border-border/40 hover:border-border"}`} onClick={() => toggleSelect(file.name)}>
                                                                                            <CardContent className="p-0">
                                                                                                <div className={`h-24 flex items-center justify-center ${getTypeBg(file.type)} relative`}>
                                                                                                    {file.type === "image" ? (
                                                                                                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
                                                                                                    ) : (
                                                                                                        <div className="flex flex-col items-center gap-1">
                                                                                                            {getTypeIcon(file.type)}
                                                                                                            <span className="text-[9px] text-muted-foreground uppercase font-medium">{file.ext}</span>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <div className={`absolute top-1 left-1 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                                                                                        {isSelected ? <CheckSquare className="h-4 w-4 text-primary drop-shadow" /> : <Square className="h-4 w-4 text-white/80 drop-shadow" />}
                                                                                                    </div>
                                                                                                    <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                        {file.type === "image" && (
                                                                                                            <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} className="h-6 w-6 rounded bg-black/50 hover:bg-black/70 flex items-center justify-center text-white">
                                                                                                                <Eye className="h-3 w-3" />
                                                                                                            </button>
                                                                                                        )}
                                                                                                        <a href={file.url} download={file.name} onClick={(e) => e.stopPropagation()} className="h-6 w-6 rounded bg-black/50 hover:bg-black/70 flex items-center justify-center text-white">
                                                                                                            <Download className="h-3 w-3" />
                                                                                                        </a>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="p-1.5 px-2">
                                                                                                    <p className="text-[10px] font-medium text-foreground truncate" title={file.name}>{file.name}</p>
                                                                                                    <div className="flex items-center justify-between mt-1">
                                                                                                        <span className="text-[9px] text-muted-foreground font-medium">{formatFileSize(file.size)}</span>
                                                                                                        <span className="text-[8px] text-muted-foreground">{new Date(file.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </CardContent>
                                                                                        </Card>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
                    <div className="relative max-w-5xl max-h-[95vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setPreviewFile(null)} className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-1 border border-white/10 m-2">
                            <X className="h-5 w-5" />
                        </button>
                        <img src={previewFile.url} alt={previewFile.name} className="max-h-[85vh] rounded-lg object-contain shadow-2xl" />
                        <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full mt-4 flex items-center gap-4 text-xs">
                            <span className="text-white font-medium">{previewFile.name}</span>
                            <span className="text-white/60">•</span>
                            <span className="text-white/80">{formatFileSize(previewFile.size)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selected.size} file(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The selected files will be permanently removed from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
