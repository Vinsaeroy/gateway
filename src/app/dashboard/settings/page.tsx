"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RefreshCw, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PaymentSettingsCard } from "@/components/dashboard/payment-settings";
import { PlanEditorCard } from "@/components/dashboard/plan-editor";
import { useTranslation } from "@/i18n/react";
import { locales, localeLabels, type Locale } from "@/i18n/config";

export default function SettingsPage() {
    const { data: authSession } = useSession();
    const { t } = useTranslation();
    const isSuperAdmin = (authSession?.user as any)?.role === "SUPERADMIN";

    const [systemConfig, setSystemConfig] = useState({
        appName: "WA-AKG",
        logoUrl: "",
        timezone: "Asia/Jakarta",
        language: "en" as Locale,
        enableRegistration: true
    });
    const [systemLoading, setSystemLoading] = useState(false);
    const [timezones, setTimezones] = useState<string[]>(["UTC", "Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]);

    useEffect(() => {
        try {
            if (typeof Intl !== "undefined" && Intl.supportedValuesOf) {
                const list = Intl.supportedValuesOf("timeZone");
                if (!list.includes("UTC")) {
                    list.push("UTC");
                }
                list.sort();
                setTimezones(list);
            }
        } catch (e) {
            console.error("Failed to load timezones dynamically", e);
        }
    }, []);

    useEffect(() => {
        fetch('/api/settings/system')
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(responseData => {
                const data = responseData?.data;
                if (data && !responseData.error) {
                    setSystemConfig({
                        appName: data.appName || "WA-AKG",
                        logoUrl: data.logoUrl || "",
                        // @ts-ignore
                        faviconUrl: data.faviconUrl || "/favicon.ico",
                        timezone: data.timezone || "Asia/Jakarta",
                        language: data.language || "en",
                        enableRegistration: data.enableRegistration !== undefined ? data.enableRegistration : true
                    });
                }
            })
            .catch(() => { });
    }, []);

    const handleSaveSystem = async () => {
        setSystemLoading(true);
        try {
            const res = await fetch('/api/settings/system', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(systemConfig)
            });

            if (res.ok) {
                toast.success(t("settings.saveSystemOk"));
            } else {
                toast.error(t("settings.saveSystemFail"));
            }
        } catch (e) {
            console.error(e);
            toast.error(t("settings.saveSystemError"));
        } finally {
            setSystemLoading(false);
        }
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
                <p className="text-muted-foreground text-sm mt-1">{t("settings.subtitle")}</p>
            </div>

            {!isSuperAdmin && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-900">{t("settings.viewOnlyTitle")}</p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    {t("settings.viewOnlyDesc")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* System Configuration (Global) */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle className="text-xl">{t("settings.appConfigTitle")}</CardTitle>
                    <CardDescription>{t("settings.appConfigDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t("settings.appName")}</Label>
                            <input
                                className={inputClass}
                                placeholder="WA-AKG"
                                value={systemConfig.appName}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, appName: e.target.value }))}
                                disabled={!isSuperAdmin}
                            />
                            <p className="text-xs text-muted-foreground">{t("settings.appNameHint")}</p>
                        </div>

                        <div className="grid gap-2">
                            <Label>{t("settings.timezone")}</Label>
                            <select
                                className={inputClass}
                                value={systemConfig.timezone}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, timezone: e.target.value }))}
                                disabled={!isSuperAdmin}
                            >
                                {timezones.map((tz) => (
                                    <option key={tz} value={tz}>
                                        {tz}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">{t("settings.timezoneHint")}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t("settings.logoUrl")}</Label>
                            <input
                                className={inputClass}
                                placeholder="https://example.com/logo.png"
                                value={systemConfig.logoUrl}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                                disabled={!isSuperAdmin}
                            />
                            <p className="text-xs text-muted-foreground">{t("settings.logoUrlHint")}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>{t("settings.faviconUrl")}</Label>
                            <input
                                className={inputClass}
                                placeholder="/favicon.ico"
                                value={(systemConfig as any).faviconUrl || ""}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, faviconUrl: e.target.value }))}
                                disabled={!isSuperAdmin}
                            />
                            <p className="text-xs text-muted-foreground">{t("settings.faviconUrlHint")}</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>{t("settings.language")}</Label>
                            <select
                                className={inputClass}
                                value={systemConfig.language}
                                onChange={(e) => setSystemConfig(prev => ({ ...prev, language: e.target.value as Locale }))}
                                disabled={!isSuperAdmin}
                            >
                                {locales.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {localeLabels[loc]}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">{t("settings.languageHint")}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <Label htmlFor="enable-registration" className="flex flex-col space-y-1 min-w-0 flex-1">
                            <span>{t("settings.enableRegistration")}</span>
                            <span className="font-normal text-xs text-muted-foreground">{t("settings.enableRegistrationDesc")}</span>
                        </Label>
                        <Switch
                            id="enable-registration"
                            checked={systemConfig.enableRegistration}
                            onCheckedChange={c => setSystemConfig(prev => ({ ...prev, enableRegistration: c }))}
                            disabled={!isSuperAdmin}
                        />
                    </div>

                    <div className="pt-2">
                        <Button onClick={handleSaveSystem} disabled={systemLoading || !isSuperAdmin}>
                            {systemLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            {t("settings.saveConfig")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Gateway — SUPERADMIN only */}
            {isSuperAdmin && <PaymentSettingsCard />}

            {/* Plan & Pricing editor — SUPERADMIN only */}
            {isSuperAdmin && <PlanEditorCard />}

            {/* System Updates */}
            <Card>
                <CardHeader>
                    <CardTitle>{t("settings.updatesTitle")}</CardTitle>
                    <CardDescription>{t("settings.updatesDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                            setSystemLoading(true);
                            try {
                                const res = await fetch("/api/system/check-updates", { method: "POST" });
                                const data = await res.json();
                                if (data.status) {
                                    toast.success(data.message || t("settings.checkUpdatesOk"));
                                } else {
                                    toast.error(data.message || t("settings.checkUpdatesFail"));
                                }
                            } catch (e) {
                                toast.error(t("settings.checkUpdatesError"));
                            } finally {
                                setSystemLoading(false);
                            }
                        }}
                        disabled={systemLoading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${systemLoading ? 'animate-spin' : ''}`} />
                        {t("settings.checkUpdates")}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
