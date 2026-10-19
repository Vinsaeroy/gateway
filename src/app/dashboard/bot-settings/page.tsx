"use client";

import { useState, useEffect } from "react";
import { useSession as useSessionProvider } from "@/components/dashboard/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Save, AlertCircle, Bot, X, Plus, ShieldCheck, Zap, UserCheck, MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { useTranslation } from "@/i18n/react";

export default function BotSettingsPage() {
    const { sessionId } = useSessionProvider();
    const { t } = useTranslation();

    const [botConfig, setBotConfig] = useState({
        enabled: true,
        botName: "WA-AKG Bot",
        prefix: "#",
        enableSticker: true,
        enableVideoSticker: true,
        maxStickerDuration: 10,
        enablePing: true,
        enableUptime: true,
        removeBgApiKey: "",
        botMode: "OWNER",
        autoReplyMode: "ALL",
        antiSpamEnabled: false,
        spamLimit: 5,
        spamInterval: 10,
        spamDelayMin: 1000,
        spamDelayMax: 3000,

        // New fields
        welcomeMessage: "",
        autoRead: false,
        alwaysOnline: false,
        botAllowedJids: [] as string[],
        botBlockedJids: [] as string[],
        autoReplyAllowedJids: [] as string[],
        autoReplyBlockedJids: [] as string[],

        // Anti-Link
        antiLinkMode: "OFF" as "OFF" | "INVITE" | "ALL",
        antiLinkAction: "DELETE" as "DELETE" | "KICK",
        antiLinkLimit: 3,
        antiLinkScope: "ALL" as "ALL" | "SPECIFIC",
        antiLinkGroups: [] as string[],
    });
    const [botLoading, setBotLoading] = useState(false);

    const [newJid, setNewJid] = useState("");

    const [privacyConfig, setPrivacyConfig] = useState({
        ghostMode: false,
        antiDelete: false,
        readReceipts: true,
    });
    const [privacyLoading, setPrivacyLoading] = useState(false);
    const [groupsList, setGroupsList] = useState<Array<{ jid: string; subject: string | null }>>([]);
    const [groupSearch, setGroupSearch] = useState("");
    const [groupsRefreshing, setGroupsRefreshing] = useState(false);

    const fetchGroupsList = async (forceRefresh = false) => {
        if (!sessionId) return;
        try {
            if (forceRefresh) setGroupsRefreshing(true);
            const url = `/api/groups/${sessionId}${forceRefresh ? "?refresh=1" : ""}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.status) {
                setGroupsList(
                    (data.data || []).map((g: any) => ({ jid: g.jid, subject: g.subject || null }))
                );
            }
            if (forceRefresh) toast.success(t("botSettings.toasts.groupsRefreshed"));
        } catch {
            if (forceRefresh) toast.error(t("botSettings.toasts.groupsRefreshFail"));
        } finally {
            if (forceRefresh) setGroupsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!sessionId) return;
        fetchGroupsList();

        fetch(`/api/sessions/${sessionId}/bot-config`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setBotConfig(prev => ({
                        ...prev,
                        ...data,
                        removeBgApiKey: data.removeBgApiKey || "",
                        prefix: data.prefix || "#",
                        welcomeMessage: data.welcomeMessage || "",
                        botAllowedJids: data.botAllowedJids || [],
                        botBlockedJids: data.botBlockedJids || [],
                        autoReplyAllowedJids: data.autoReplyAllowedJids || [],
                        autoReplyBlockedJids: data.autoReplyBlockedJids || [],
                        antiLinkGroups: data.antiLinkGroups || [],
                    }));
                }
            })
            .catch(() => { });

        fetch(`/api/sessions/${sessionId}/settings`)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setPrivacyConfig({
                        ghostMode: data.config?.ghostMode || false,
                        antiDelete: data.config?.antiDelete || false,
                        readReceipts: data.config?.readReceipts ?? true
                    });
                }
            })
            .catch(() => { });
    }, [sessionId]);

    const handleSaveBot = async () => {
        if (!sessionId) return;
        setBotLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/bot-config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(botConfig)
            });

            if (res.ok) {
                toast.success(t("botSettings.toasts.botSaved"));
            } else {
                toast.error(t("botSettings.toasts.botSaveFail"));
            }
        } catch (e) {
            console.error(e);
            toast.error(t("botSettings.toasts.botSaveError"));
        } finally {
            setBotLoading(false);
        }
    };

    const handleSavePrivacy = async () => {
        if (!sessionId) return;
        setPrivacyLoading(true);
        try {
            const res = await fetch(`/api/sessions/${sessionId}/settings`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    config: {
                        ghostMode: privacyConfig.ghostMode,
                        antiDelete: privacyConfig.antiDelete,
                        readReceipts: privacyConfig.readReceipts
                    }
                })
            });

            if (res.ok) {
                toast.success(t("botSettings.toasts.privacySaved"));
            } else {
                const data = await res.json().catch(() => ({}));
                toast.error(data.message || t("botSettings.toasts.privacySaveFail"));
            }
        } catch (e) {
            console.error(e);
            toast.error(t("botSettings.toasts.privacySaveError"));
        } finally {
            setPrivacyLoading(false);
        }
    };

    const addJid = (listName: 'botAllowedJids' | 'botBlockedJids' | 'autoReplyAllowedJids' | 'autoReplyBlockedJids') => {
        if (!newJid || !newJid.trim()) return;
        let formatted = newJid.trim();
        if (!formatted.includes('@')) formatted += '@s.whatsapp.net';

        if (!botConfig[listName].includes(formatted)) {
            setBotConfig(prev => ({
                ...prev,
                [listName]: [...prev[listName], formatted]
            }));
        }
        setNewJid("");
    };

    const removeJid = (listName: 'botAllowedJids' | 'botBlockedJids' | 'autoReplyAllowedJids' | 'autoReplyBlockedJids', jid: string) => {
        setBotConfig(prev => ({
            ...prev,
            [listName]: prev[listName].filter(item => item !== jid)
        }));
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{t("botSettings.title")}</h2>
                    <p className="text-muted-foreground text-sm mt-1">{t("botSettings.subtitle")}</p>
                </div>

                {/* Bot Mode & Access Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            {t("botSettings.mode.title")}
                        </CardTitle>
                        <CardDescription>{t("botSettings.mode.description")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                            {/* Master toggle — when off, ALL bot features (commands, auto-reply) are paused */}
                            <div className="flex items-center justify-between gap-4 rounded-lg border p-3 bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label htmlFor="bot-enabled" className="text-sm font-semibold cursor-pointer">
                                        {t("botSettings.mode.enabledLabel")}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t("botSettings.mode.enabledDesc")}
                                    </p>
                                </div>
                                <Switch
                                    id="bot-enabled"
                                    checked={botConfig.enabled}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, enabled: c }))}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>{t("botSettings.mode.nameLabel")}</Label>
                                <Input
                                    placeholder="WA-AKG Bot"
                                    value={botConfig.botName}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, botName: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">{t("botSettings.mode.nameDesc")}</p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>{t("botSettings.mode.prefixLabel")}</Label>
                                    <Input
                                        className="max-w-[100px]"
                                        placeholder="#"
                                        maxLength={3}
                                        value={botConfig.prefix}
                                        onChange={(e) => setBotConfig(prev => ({ ...prev, prefix: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">{t("botSettings.mode.prefixDesc")}</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>{t("botSettings.mode.modeLabel")}</Label>
                                    <Select
                                        value={botConfig.botMode}
                                        onValueChange={(v: any) => setBotConfig(prev => ({ ...prev, botMode: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("botSettings.mode.modePlaceholder")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">{t("botSettings.mode.modeAll")}</SelectItem>
                                            <SelectItem value="OWNER">{t("botSettings.mode.modeOwner")}</SelectItem>
                                            <SelectItem value="SPECIFIC">{t("botSettings.mode.modeSpecific")}</SelectItem>
                                            <SelectItem value="BLACKLIST">{t("botSettings.mode.modeBlacklist")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">{t("botSettings.mode.modeDesc")}</p>
                                </div>
                            </div>

                            {(botConfig.botMode === 'SPECIFIC' || botConfig.botMode === 'BLACKLIST') && (
                                <div className="space-y-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <Label className="flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        {botConfig.botMode === 'SPECIFIC' ? t("botSettings.mode.whitelisted") : t("botSettings.mode.blacklisted")}
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="628123456789@s.whatsapp.net"
                                            value={newJid}
                                            onChange={(e) => setNewJid(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids')}
                                        />
                                        <Button variant="outline" size="icon" onClick={() => addJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids')}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(botConfig.botMode === 'SPECIFIC' ? botConfig.botAllowedJids : botConfig.botBlockedJids).map(jid => (
                                            <div key={jid} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium">
                                                {jid}
                                                <button onClick={() => removeJid(botConfig.botMode === 'SPECIFIC' ? 'botAllowedJids' : 'botBlockedJids', jid)} className="text-muted-foreground hover:text-destructive transition-colors">
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                        {(botConfig.botMode === 'SPECIFIC' ? botConfig.botAllowedJids : botConfig.botBlockedJids).length === 0 && (
                                            <p className="text-xs text-muted-foreground italic">{t("botSettings.mode.noNumbers")}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-ping" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">{t("botSettings.mode.pingLabel")}</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">{t("botSettings.mode.pingDesc", { prefix: botConfig.prefix })}</span>
                                    </Label>
                                    <Switch id="enable-ping" checked={botConfig.enablePing}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enablePing: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-uptime" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">{t("botSettings.mode.uptimeLabel")}</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">{t("botSettings.mode.uptimeDesc", { prefix: botConfig.prefix })}</span>
                                    </Label>
                                    <Switch id="enable-uptime" checked={botConfig.enableUptime}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableUptime: c }))} />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t("botSettings.mode.save")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Automation & Presence Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-yellow-500" />
                                {t("botSettings.automation.title")}
                            </CardTitle>
                            <CardDescription>{t("botSettings.automation.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="always-online" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">{t("botSettings.automation.alwaysOnlineLabel")}</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">{t("botSettings.automation.alwaysOnlineDesc")}</span>
                                    </Label>
                                    <Switch id="always-online" checked={botConfig.alwaysOnline}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, alwaysOnline: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="auto-read" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">{t("botSettings.automation.autoReadLabel")}</span>
                                        <span className="font-normal text-[10px] text-muted-foreground">{t("botSettings.automation.autoReadDesc")}</span>
                                    </Label>
                                    <Switch id="auto-read" checked={botConfig.autoRead}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, autoRead: c }))} />
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-border/50 pt-4">
                                <Label className="flex items-center gap-2">
                                    <MessageSquarePlus className="h-4 w-4 text-primary" />
                                    {t("botSettings.automation.welcomeLabel")}
                                </Label>
                                <Textarea
                                    placeholder={t("botSettings.automation.welcomePlaceholder")}
                                    className="min-h-[100px]"
                                    value={botConfig.welcomeMessage}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                                />
                                <p className="text-[10px] text-muted-foreground">{t("botSettings.automation.welcomeHint")}</p>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t("botSettings.automation.save")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media & Stickers Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("botSettings.media.title")}</CardTitle>
                            <CardDescription>{t("botSettings.media.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-sticker" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">{t("botSettings.media.imageToSticker")}</span>
                                        <span className="font-normal text-xs text-muted-foreground">{t("botSettings.media.imageToStickerDesc")}</span>
                                    </Label>
                                    <Switch id="enable-sticker" checked={botConfig.enableSticker}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableSticker: c }))} />
                                </div>
                                <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
                                    <Label htmlFor="enable-video-sticker" className="flex flex-col space-y-1 cursor-pointer">
                                        <span className="font-medium">{t("botSettings.media.videoToSticker")}</span>
                                        <span className="font-normal text-xs text-muted-foreground">{t("botSettings.media.videoToStickerDesc")}</span>
                                    </Label>
                                    <Switch id="enable-video-sticker" checked={botConfig.enableVideoSticker}
                                        onCheckedChange={c => setBotConfig(prev => ({ ...prev, enableVideoSticker: c }))} />
                                </div>
                            </div>

                            <div className="grid gap-2 border-t border-border/50 pt-4">
                                <Label>{t("botSettings.media.maxDuration")} <strong>{botConfig.maxStickerDuration}s</strong></Label>
                                <Slider
                                    value={[botConfig.maxStickerDuration]}
                                    onValueChange={([v]) => setBotConfig(prev => ({ ...prev, maxStickerDuration: v }))}
                                    min={3}
                                    max={30}
                                    step={1}
                                />
                                <p className="text-xs text-muted-foreground">{t("botSettings.media.maxDurationDesc")}</p>
                            </div>

                            <div className="grid gap-2 border-t border-border/50 pt-4">
                                <Label>{t("botSettings.media.removeBgLabel")}</Label>
                                <Input
                                    type="password"
                                    placeholder={t("botSettings.media.removeBgPlaceholder")}
                                    value={botConfig.removeBgApiKey || ""}
                                    onChange={(e) => setBotConfig(prev => ({ ...prev, removeBgApiKey: e.target.value }))}
                                />
                                <p className="text-xs text-muted-foreground">{t("botSettings.media.removeBgDescA")}<code className="bg-muted px-1 rounded">nobg</code>{t("botSettings.media.removeBgDescB")}</p>
                            </div>

                            <div className="pt-2">
                                <Button className="w-full sm:w-auto" onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t("botSettings.media.save")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anti-Ban Protection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                {t("botSettings.protection.title")}
                            </CardTitle>
                            <CardDescription>
                                {t("botSettings.protection.descriptionA")}<strong>{t("botSettings.protection.descriptionB")}</strong>{t("botSettings.protection.descriptionC")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg bg-orange-500/5 border-orange-500/20">
                                <Label htmlFor="anti-spam" className="flex flex-col space-y-1">
                                    <span className="font-semibold text-orange-700 dark:text-orange-400">{t("botSettings.protection.enableLabel")}</span>
                                    <span className="font-normal text-xs text-muted-foreground">{t("botSettings.protection.enableDesc")}</span>
                                </Label>
                                <Switch id="anti-spam" checked={botConfig.antiSpamEnabled}
                                    onCheckedChange={c => setBotConfig(prev => ({ ...prev, antiSpamEnabled: c }))} />
                            </div>

                            {botConfig.antiSpamEnabled && (
                                <div className="grid gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                    {/* How it works */}
                                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
                                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">{t("botSettings.protection.howItWorks")}</p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {t("botSettings.protection.howS1")}
                                            <strong>{t("botSettings.protection.howThreshold")}</strong>
                                            {t("botSettings.protection.howS2")}
                                            <strong>{t("botSettings.protection.howTimeWindow")}</strong>
                                            {t("botSettings.protection.howS3")}
                                            <strong>{t("botSettings.protection.howDelayed")}</strong>
                                            {t("botSettings.protection.howS4")}
                                            <strong>{t("botSettings.protection.howMin")}</strong>
                                            {t("botSettings.protection.howS5")}
                                            <strong>{t("botSettings.protection.howMax")}</strong>
                                            {t("botSettings.protection.howS6")}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <strong>{t("botSettings.protection.exampleStrong")}</strong>
                                            {t("botSettings.protection.exampleA")}
                                            <strong>{botConfig.spamLimit}</strong>
                                            {t("botSettings.protection.exampleB")}
                                            <strong>{botConfig.spamInterval}s</strong>
                                            {t("botSettings.protection.exampleC", {
                                                limit: botConfig.spamLimit,
                                                interval: botConfig.spamInterval,
                                                next: botConfig.spamLimit + 1,
                                                delayMin: botConfig.spamDelayMin,
                                                delayMax: botConfig.spamDelayMax,
                                            })}
                                        </p>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="font-semibold">{t("botSettings.protection.thresholdLabel")}</Label>
                                            <Input
                                                type="number"
                                                value={botConfig.spamLimit}
                                                onChange={e => setBotConfig(prev => ({ ...prev, spamLimit: parseInt(e.target.value) || 1 }))}
                                                min={1}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t("botSettings.protection.thresholdDesc")}
                                                <span className="text-orange-600 dark:text-orange-400">{t("botSettings.protection.thresholdDescStrong")}</span>
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="font-semibold">{t("botSettings.protection.windowLabel")}</Label>
                                            <Input
                                                type="number"
                                                value={botConfig.spamInterval}
                                                onChange={e => setBotConfig(prev => ({ ...prev, spamInterval: parseInt(e.target.value) || 1 }))}
                                                min={1}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t("botSettings.protection.windowDesc")}
                                                <span className="text-orange-600 dark:text-orange-400">{t("botSettings.protection.windowDescStrong")}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label className="font-semibold">{t("botSettings.protection.minDelayLabel")}</Label>
                                            <Input
                                                type="number"
                                                value={botConfig.spamDelayMin}
                                                onChange={e => setBotConfig(prev => ({ ...prev, spamDelayMin: parseInt(e.target.value) || 0 }))}
                                                min={0}
                                                step={100}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t("botSettings.protection.minDelayDesc")}
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="font-semibold">{t("botSettings.protection.maxDelayLabel")}</Label>
                                            <Input
                                                type="number"
                                                value={botConfig.spamDelayMax}
                                                onChange={e => setBotConfig(prev => ({ ...prev, spamDelayMax: parseInt(e.target.value) || 0 }))}
                                                min={0}
                                                step={100}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {t("botSettings.protection.maxDelayDesc")}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                                        <p className="text-xs text-muted-foreground">
                                            ⚠️ <strong>{t("botSettings.protection.recTitle")}</strong>{t("botSettings.protection.recA")}<strong>5</strong>{t("botSettings.protection.recB")}<strong>10s</strong>{t("botSettings.protection.recC")}<strong>1000–3000ms</strong>{t("botSettings.protection.recD")}<strong>3</strong>{t("botSettings.protection.recE")}<strong>2000–5000ms</strong>.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t("botSettings.protection.save")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Anti-Link (Group) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("botSettings.antiLink.title")}</CardTitle>
                            <CardDescription>
                                {t("botSettings.antiLink.description")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>{t("botSettings.antiLink.modeLabel")}</Label>
                                    <Select
                                        value={botConfig.antiLinkMode}
                                        onValueChange={(v) =>
                                            setBotConfig((p) => ({ ...p, antiLinkMode: v as any }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OFF">{t("botSettings.antiLink.modeOff")}</SelectItem>
                                            <SelectItem value="INVITE">{t("botSettings.antiLink.modeInvite")}</SelectItem>
                                            <SelectItem value="ALL">{t("botSettings.antiLink.modeAll")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        <code>INVITE</code>{t("botSettings.antiLink.hintBlocks")}<code>chat.whatsapp.com/...</code>{t("botSettings.antiLink.hintBetween")}<code>ALL</code>{t("botSettings.antiLink.hintAny")}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label>{t("botSettings.antiLink.actionLabel")}</Label>
                                    <Select
                                        value={botConfig.antiLinkAction}
                                        onValueChange={(v) =>
                                            setBotConfig((p) => ({ ...p, antiLinkAction: v as any }))
                                        }
                                        disabled={botConfig.antiLinkMode === "OFF"}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DELETE">{t("botSettings.antiLink.actionDelete")}</SelectItem>
                                            <SelectItem value="KICK">{t("botSettings.antiLink.actionKick")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {botConfig.antiLinkAction === "KICK" && botConfig.antiLinkMode !== "OFF" && (
                                <div className="grid gap-2 max-w-[200px]">
                                    <Label>{t("botSettings.antiLink.warnLimit")}</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={botConfig.antiLinkLimit}
                                        onChange={(e) =>
                                            setBotConfig((p) => ({
                                                ...p,
                                                antiLinkLimit: Math.max(1, Math.min(10, Number(e.target.value) || 3)),
                                            }))
                                        }
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t("botSettings.antiLink.warnLimitDesc")}
                                    </p>
                                </div>
                            )}

                            {/* Scope: ALL groups vs SPECIFIC */}
                            {botConfig.antiLinkMode !== "OFF" && (
                                <div className="grid gap-2">
                                    <Label>{t("botSettings.antiLink.applyTo")}</Label>
                                    <Select
                                        value={botConfig.antiLinkScope}
                                        onValueChange={(v) =>
                                            setBotConfig((p) => ({ ...p, antiLinkScope: v as any }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">{t("botSettings.antiLink.scopeAll")}</SelectItem>
                                            <SelectItem value="SPECIFIC">{t("botSettings.antiLink.scopeSpecific")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Group picker — only when scope=SPECIFIC */}
                            {botConfig.antiLinkMode !== "OFF" && botConfig.antiLinkScope === "SPECIFIC" && (
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <Label>{t("botSettings.antiLink.activeGroups", { count: botConfig.antiLinkGroups.length })}</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fetchGroupsList(true)}
                                            disabled={groupsRefreshing}
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${groupsRefreshing ? "animate-spin" : ""}`} />
                                            {t("botSettings.antiLink.refresh")}
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder={t("botSettings.antiLink.searchPlaceholder")}
                                        value={groupSearch}
                                        onChange={(e) => setGroupSearch(e.target.value)}
                                    />
                                    <div className="max-h-56 overflow-y-auto border rounded-lg p-2 space-y-1 bg-muted/20">
                                        {groupsList.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-3">
                                                {t("botSettings.antiLink.noGroups")}
                                            </p>
                                        ) : (
                                            groupsList
                                                .filter((g) =>
                                                    !groupSearch ||
                                                    (g.subject || g.jid).toLowerCase().includes(groupSearch.toLowerCase())
                                                )
                                                .map((g) => {
                                                    const checked = botConfig.antiLinkGroups.includes(g.jid);
                                                    return (
                                                        <label
                                                            key={g.jid}
                                                            className={`flex items-center gap-2 p-2 rounded cursor-pointer text-sm hover:bg-muted ${checked ? "bg-primary/10 border border-primary/30" : ""}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    setBotConfig((p) => ({
                                                                        ...p,
                                                                        antiLinkGroups: e.target.checked
                                                                            ? [...p.antiLinkGroups, g.jid]
                                                                            : p.antiLinkGroups.filter((x) => x !== g.jid),
                                                                    }));
                                                                }}
                                                                className="shrink-0"
                                                            />
                                                            <span className="truncate">{g.subject || g.jid}</span>
                                                        </label>
                                                    );
                                                })
                                        )}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground border-l-2 border-amber-500/50 pl-3 py-1 bg-amber-500/5 rounded">
                                {t("botSettings.antiLink.adminNote")}
                            </p>

                            <div className="pt-2">
                                <Button onClick={handleSaveBot} disabled={botLoading || !sessionId}>
                                    {botLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t("botSettings.antiLink.save")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Privacy & Utility */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("botSettings.privacy.title")}</CardTitle>
                            <CardDescription>{t("botSettings.privacy.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="ghost-mode" className="flex flex-col space-y-1">
                                    <span>{t("botSettings.privacy.ghostLabel")}</span>
                                    <span className="font-normal text-xs text-muted-foreground">{t("botSettings.privacy.ghostDesc")}</span>
                                </Label>
                                <Switch id="ghost-mode" checked={privacyConfig.ghostMode}
                                    onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, ghostMode: c }))} />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="anti-delete" className="flex flex-col space-y-1">
                                    <span>{t("botSettings.privacy.antiDeleteLabel")}</span>
                                    <span className="font-normal text-xs text-muted-foreground">{t("botSettings.privacy.antiDeleteDesc")}</span>
                                </Label>
                                <Switch id="anti-delete" checked={privacyConfig.antiDelete}
                                    onCheckedChange={c => setPrivacyConfig(prev => ({ ...prev, antiDelete: c }))} />
                            </div>

                            <div className="pt-4">
                                <Button onClick={handleSavePrivacy} disabled={privacyLoading || !sessionId}>
                                    {privacyLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {t("botSettings.privacy.save")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SessionGuard>
        );
    }
