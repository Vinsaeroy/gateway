"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "./session-provider";

export function SessionSelector() {
    const { sessions, sessionId, setSessionId, loading, refreshSessions } = useSession();
    const selectedSession = sessions.find(s => s.sessionId === sessionId);

    return (
        <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:inline">Session:</span>
            <div className="w-[140px] sm:w-[200px]">
                <Select value={sessionId} onValueChange={setSessionId} disabled={loading || sessions.length === 0}>
                    <SelectTrigger className="h-9 border border-border/60 bg-background/50 hover:bg-muted/30 transition-colors rounded-xl shadow-sm focus:ring-1 focus:ring-primary/20">
                        <SelectValue placeholder={loading ? "Loading..." : "Select Session"}>
                            {selectedSession ? (
                                <div className="flex items-center gap-2 text-left">
                                    <span className="relative flex h-2 w-2">
                                        {selectedSession.status === "CONNECTED" && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${selectedSession.status === "CONNECTED" ? "bg-emerald-500" : "bg-destructive"}`}></span>
                                    </span>
                                    <span className="truncate font-medium text-xs sm:text-sm">{selectedSession.name}</span>
                                </div>
                            ) : null}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-border/50 shadow-lg p-1">
                        {sessions.map((s) => (
                            <SelectItem key={s.sessionId} value={s.sessionId} className="rounded-lg py-2 focus:bg-muted/50 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2 flex-shrink-0">
                                        {s.status === "CONNECTED" && (
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        )}
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${s.status === "CONNECTED" ? "bg-emerald-500" : "bg-destructive"}`}></span>
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm text-foreground">{s.name}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{s.sessionId}</span>
                                    </div>
                                </div>
                            </SelectItem>
                        ))}
                        {sessions.length === 0 && !loading && (
                            <div className="py-6 px-2 text-xs text-muted-foreground text-center">
                                No connected sessions found.
                            </div>
                        )}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted/50 rounded-xl" onClick={refreshSessions} title="Refresh Sessions" disabled={loading}>
                <RefreshCw className={`h-4 w-4 text-muted-foreground hover:text-foreground ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
}
