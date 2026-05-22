"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, ArrowLeft, Phone, MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image as ImageIcon, FileText, Music, Sticker as StickerIcon, Video, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { getChatMessages, sendChatMessage, sendMediaMessage } from "@/app/dashboard/chat/actions";

interface Message {
    keyId: string;
    content: string;
    fromMe: boolean;
    timestamp: string;
    type: string;
    status: string;
    pushName?: string;
    mediaUrl?: string;
    remoteJid?: string;
}

interface ChatWindowProps {
    sessionId: string;
    jid: string;
    name?: string;
    onBack?: () => void;
}

export function ChatWindow({ sessionId, jid, name, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadType, setUploadType] = useState<string>("image");
    const [isDragging, setIsDragging] = useState(false);

    const scrollToBottom = (smooth = true) => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const data = await getChatMessages(sessionId, jid);
            setMessages((data as any) || []);
            setTimeout(() => scrollToBottom(false), 100);
        } catch (error) {
            console.error("Failed to load messages via Server Action", error);
        }
    }

    useEffect(() => {
        setMessages([]);
        fetchMessages();

        const newSocket = io({
            path: "/api/socket/io",
            addTrailingSlash: false,
        });

        newSocket.on("connect", () => {
            newSocket.emit("join-session", sessionId);
        });

        const normalizedJid = jid.endsWith("@c.us") ? jid.replace("@c.us", "@s.whatsapp.net") : jid;

        newSocket.on("message.update", (newMessages: Message[]) => {
            setMessages((prev) => {
                const combined = [...prev, ...newMessages.filter(m => 
                    m.remoteJid === normalizedJid || prev.some(p => p.remoteJid === m.remoteJid)
                )];
                const unique = Array.from(new Map(combined.map(m => [m.keyId, m])).values());
                return unique.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [sessionId, jid]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        try {
            await sendChatMessage(sessionId, jid, newMessage);
            setNewMessage("");
            // Give Baileys time to fire messages.upsert and save to DB
            setTimeout(() => fetchMessages(), 800);
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to send message");
        }
    };

    const processFileUpload = async (file: File, explicitType?: string) => {
        const formData = new FormData();
        formData.append("file", file);

        let type = explicitType;
        if (!type || type === '*') {
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';
            else type = 'document';
        }

        formData.append("type", type);
        formData.append("sessionId", sessionId);
        formData.append("jid", jid);

        try {
            toast.info(`Sending ${file.name}...`);
            await sendMediaMessage(formData);
            toast.success("Sent!");
            setTimeout(() => fetchMessages(), 800);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to send media");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await processFileUpload(file, uploadType);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            // Process the first file for now
            await processFileUpload(files[0]);
        }
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            toast.info("Downloading file...");
            const response = await fetch(url);
            if (!response.ok) throw new Error("File not found or unreachable");
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Download failed! Ensure the file URL is accessible.");
        }
    };

    const triggerUpload = (type: string) => {
        setUploadType(type);
        if (fileInputRef.current) {
            fileInputRef.current.accept = type === 'image' ? "image/*" : type === 'video' ? "video/*" : type === 'audio' ? "audio/*" : type === 'sticker' ? "image/*" : "*/*";
            fileInputRef.current.click();
        }
    };

    // Group messages by date
    const getDateLabel = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const displayName = name || jid.split('@')[0];

    return (
        <div 
            className="flex flex-col h-full bg-muted/20 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag & Drop Overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary flex items-center justify-center flex-col gap-3 rounded-lg m-2">
                    <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                        <Paperclip className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-lg font-semibold text-primary">Drop files to send here</p>
                </div>
            )}

            {/* Header */}
            <div className="px-3 py-2.5 border-b bg-background/80 backdrop-blur-sm flex items-center gap-3 flex-shrink-0 z-10">
                {onBack && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden flex-shrink-0 text-muted-foreground hover:text-foreground" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <Avatar className="h-9 w-9 flex-shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary">
                        {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{displayName}</h3>
                    <p className="text-[10px] text-muted-foreground truncate">{jid}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 styled-scrollbar relative z-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.04) 1px, transparent 0)`,
                backgroundSize: '24px 24px'
            }}>
                <div className="space-y-1.5 max-w-3xl mx-auto">
                    {messages.map((msg, idx) => {
                        // Show date separator
                        const showDate = idx === 0 || getDateLabel(msg.timestamp) !== getDateLabel(messages[idx - 1].timestamp);

                        return (
                            <div key={msg.keyId}>
                                {showDate && (
                                    <div className="flex justify-center my-3">
                                        <span className="text-[10px] font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-border/30">
                                            {getDateLabel(msg.timestamp)}
                                        </span>
                                    </div>
                                )}
                                <div className={cn("flex", msg.fromMe ? "justify-end" : "justify-start")}>
                                    <div
                                        className={cn(
                                            "max-w-[80%] sm:max-w-[70%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap shadow-sm",
                                            msg.fromMe
                                                ? "bg-primary text-primary-foreground rounded-br-md"
                                                : "bg-background border border-border/40 rounded-bl-md"
                                        )}
                                    >
                                        {/* Sender Name (group messages) */}
                                        {!msg.fromMe && jid.endsWith("@g.us") && msg.pushName && (
                                            <span className="text-[10px] font-semibold text-primary block mb-0.5">
                                                {msg.pushName}
                                            </span>
                                        )}

                                        {/* Media */}
                                        {msg.type === 'IMAGE' && msg.mediaUrl && (
                                            <div className="relative group/media mb-1.5">
                                                <img src={msg.mediaUrl} alt="Image" className="rounded-lg max-h-60 object-cover w-full cursor-pointer hover:opacity-95 transition-opacity" />
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `IMAGE-${msg.keyId}.jpg`)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {msg.type === 'VIDEO' && msg.mediaUrl && (
                                            <div className="relative group/media mb-1.5">
                                                <video src={msg.mediaUrl} controls className="rounded-lg max-h-60 w-full" />
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm z-10"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `VIDEO-${msg.keyId}.mp4`)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {msg.type === 'AUDIO' && msg.mediaUrl && (
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <audio src={msg.mediaUrl} controls className="h-8 max-w-[200px]" />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `AUDIO-${msg.keyId}.mp3`)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {msg.type === 'STICKER' && msg.mediaUrl && (
                                            <div className="relative group/media mb-1">
                                                <img src={msg.mediaUrl} alt="Sticker" className="rounded-lg max-h-32 object-contain" />
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                                    onClick={() => handleDownload(msg.mediaUrl!, `STICKER-${msg.keyId}.webp`)}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                        {msg.type !== 'TEXT' && msg.type !== 'IMAGE' && msg.type !== 'STICKER' && msg.type !== 'VIDEO' && msg.type !== 'AUDIO' && (
                                            <div className={cn(
                                                "flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg mb-1 text-xs",
                                                msg.fromMe ? "bg-white/15" : "bg-muted/50"
                                            )}>
                                                <div className="flex items-center gap-2 truncate">
                                                    <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="font-medium truncate">{msg.type} Message</span>
                                                </div>
                                                {msg.mediaUrl && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 rounded-full flex-shrink-0"
                                                        onClick={() => handleDownload(msg.mediaUrl!, `${msg.type}-${msg.keyId}`)}
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {/* Content + Time */}
                                        <div className="flex items-end gap-2">
                                            <span className="flex-1">{msg.content}</span>
                                            <span className={cn(
                                                "text-[9px] flex-shrink-0 leading-none translate-y-0.5",
                                                msg.fromMe ? "text-primary-foreground/60" : "text-muted-foreground"
                                            )}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="px-3 py-2.5 bg-background/80 backdrop-blur-sm border-t flex-shrink-0">
                <div className="flex items-center gap-2 max-w-3xl mx-auto">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground">
                                <Paperclip className="h-4.5 w-4.5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-1.5" side="top" align="start">
                            <div className="flex flex-col gap-0.5">
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('image')}>
                                    <ImageIcon className="h-3.5 w-3.5 text-blue-500" /> Image
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('video')}>
                                    <Video className="h-3.5 w-3.5 text-purple-500" /> Video
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('audio')}>
                                    <Music className="h-3.5 w-3.5 text-orange-500" /> Audio
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('document')}>
                                    <FileText className="h-3.5 w-3.5 text-emerald-500" /> Document
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 h-8 text-xs" onClick={() => triggerUpload('sticker')}>
                                    <StickerIcon className="h-3.5 w-3.5 text-pink-500" /> Sticker
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        className="flex-1 h-9 rounded-full bg-muted/40 border-border/30 text-sm focus-visible:ring-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        size="icon"
                        className="h-9 w-9 rounded-full flex-shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
