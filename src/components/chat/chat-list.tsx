"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, Search, MessageCircle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { getChatsStatus } from "@/app/dashboard/chat/actions";

interface ChatContact {
    jid: string;
    name: string | null;
    notify: string | null;
    profilePic: string | null;
    lastMessage?: {
        content: string | null;
        timestamp: string;
        type: string;
    }
}

interface ChatListProps {
    sessionId: string;
    onSelectChat: (jid: string, name?: string) => void;
    selectedJid?: string;
}

export function ChatList({ sessionId, onSelectChat, selectedJid }: ChatListProps) {
    const [chats, setChats] = useState<ChatContact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [newChatNumber, setNewChatNumber] = useState("");
    
    // Track JIDs in a ref for reliable real-time updates without depending on state closure
    const jidsInList = useRef<Set<string>>(new Set());

    const fetchChats = async () => {
        try {
            const rawChats = await getChatsStatus(sessionId);
            
            // Deduplicate by JID - keep the one with the latest message
            const chatMap = new Map<string, ChatContact>();
            rawChats.forEach((c: any) => {
                const existing = chatMap.get(c.jid);
                if (!existing || (c.lastMessage?.timestamp && (!existing.lastMessage?.timestamp || new Date(c.lastMessage.timestamp) > new Date(existing.lastMessage.timestamp)))) {
                    chatMap.set(c.jid, c);
                }
            });
            setChats(Array.from(chatMap.values()));
        } catch (error) {
            console.error("Failed to load chats via Server Action", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            fetchChats();

            const socket = io({
                path: "/api/socket/io",
                addTrailingSlash: false,
            });

            socket.on("connect", () => {
                socket.emit("join-session", sessionId);
            });

            socket.on("message.update", async (newMessages: any[]) => {
                let shouldFetchAll = false;

                setChats((prevChats) => {
                    const updatedChats = [...prevChats];
                    let needsReorder = false;

                    newMessages.forEach(msg => {
                        const messageJid = msg.remoteJid;
                        const chatIndex = updatedChats.findIndex(c => c.jid === messageJid);
                        
                        if (chatIndex !== -1) {
                            updatedChats[chatIndex] = {
                                ...updatedChats[chatIndex],
                                lastMessage: {
                                    content: msg.content,
                                    timestamp: msg.timestamp,
                                    type: msg.type
                                }
                            };
                            needsReorder = true;
                        } else if (!jidsInList.current.has(messageJid)) {
                            // Message from a JID not in our current list
                            shouldFetchAll = true;
                        }
                    });

                    if (needsReorder) {
                        updatedChats.sort((a, b) => {
                            const tA = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : 0;
                            const tB = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : 0;
                            return tB - tA;
                        });
                    }

                    return updatedChats;
                });

                if (shouldFetchAll) {
                    await fetchChats();
                }
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [sessionId]);

    // Update the JID tracking ref whenever the chats list changes
    useEffect(() => {
        jidsInList.current = new Set(chats.map(c => c.jid));
    }, [chats]);

    // Filter chats based on search query
    const filteredChats = useMemo(() => {
        if (!searchQuery.trim()) return chats;
        const q = searchQuery.toLowerCase();
        return chats.filter(chat => {
            const name = (chat.name || chat.notify || "").toLowerCase();
            const jid = chat.jid.toLowerCase();
            return name.includes(q) || jid.includes(q);
        });
    }, [chats, searchQuery]);

    const getContactDisplayName = (chat: ChatContact): string => {
        return chat.name || chat.notify || chat.jid.split('@')[0];
    };

    const getMessagePreview = (chat: ChatContact): string => {
        if (!chat.lastMessage?.content) return "No messages yet";
        const content = chat.lastMessage.content;
        if (chat.lastMessage.type !== "TEXT") {
            return `📎 ${chat.lastMessage.type.charAt(0) + chat.lastMessage.type.slice(1).toLowerCase()}`;
        }
        return content.length > 45 ? content.slice(0, 45) + "…" : content;
    };

    const getTimeLabel = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const handleStartNewChat = () => {
        if (!newChatNumber) return;
        let clean = newChatNumber.replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.substring(1);
        const jid = `${clean}@s.whatsapp.net`;
        onSelectChat(jid);
        setIsNewChatOpen(false);
        setNewChatNumber("");
    };

    if (loading) {
        return (
            <div className="p-3 space-y-3">
                <Skeleton className="h-9 w-full rounded-lg" />
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-3.5 w-28" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-3 pt-3 pb-2 space-y-2 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base text-foreground">Chats</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => setIsNewChatOpen(!isNewChatOpen)}
                    >
                        {isNewChatOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <MessageSquarePlus className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-sm bg-muted/50 border-0 rounded-lg focus-visible:ring-1"
                    />
                </div>

                {/* New Chat Form */}
                {isNewChatOpen && (
                    <div className="p-2.5 bg-muted/30 rounded-lg space-y-2 border border-border/40">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Phone Number</Label>
                        <div className="flex gap-1.5">
                            <Input
                                placeholder="628123456789"
                                value={newChatNumber}
                                onChange={(e) => setNewChatNumber(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleStartNewChat()}
                                className="h-8 text-sm"
                            />
                            <Button size="sm" className="h-8 px-3" onClick={handleStartNewChat}>Go</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto styled-scrollbar">
                {filteredChats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {searchQuery ? "No chats match your search" : "No chats yet"}
                        </p>
                    </div>
                ) : (
                    filteredChats.map((chat) => {
                        const displayName = getContactDisplayName(chat);
                        const isSelected = selectedJid === chat.jid;
                        return (
                            <button
                                key={chat.jid}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 border-b border-border/20 overflow-hidden",
                                    isSelected
                                        ? "bg-primary/8 border-l-2 border-l-primary"
                                        : "hover:bg-muted/40 border-l-2 border-l-transparent"
                                )}
                                onClick={() => onSelectChat(chat.jid, displayName)}
                            >
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={chat.profilePic || ""} />
                                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                                        {displayName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex justify-between items-baseline gap-2 overflow-hidden">
                                        <h4 className={cn(
                                            "text-sm truncate",
                                            isSelected ? "font-semibold text-primary" : "font-medium text-foreground"
                                        )}>
                                            {displayName}
                                        </h4>
                                        {chat.lastMessage && (
                                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                                                {getTimeLabel(chat.lastMessage.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                                        {getMessagePreview(chat)}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
