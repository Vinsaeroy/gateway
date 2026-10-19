"use client";

// Editor plan & pricing untuk SUPERADMIN. Mengubah harga, limit, dan benefit
// yang ditampilkan di halaman pricing + dipakai untuk pembatasan kuota API.
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RefreshCw, Save, Tag } from "lucide-react";
import { toast } from "sonner";
import { CAPABILITIES } from "@/lib/plans";
import { useTranslation } from "@/i18n/react";

interface Plan {
    id: string;
    name: string;
    price: number | null;
    durationDays: number;
    dailyLimit: number;
    monthlyLimit: number;
    maxSessions: number;
    highlight?: boolean;
    capabilities?: Record<string, boolean>;
    features: string[];
}

const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export function PlanEditorCard() {
    const { t } = useTranslation();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/settings/plans")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
                if (d?.data) setPlans(d.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const update = (idx: number, patch: Partial<Plan>) => {
        setPlans((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
    };

    const toggleCap = (idx: number, capId: string, val: boolean) => {
        setPlans((prev) =>
            prev.map((p, i) =>
                i === idx ? { ...p, capabilities: { ...(p.capabilities || {}), [capId]: val } } : p
            )
        );
    };

    const save = async () => {
        setSaving(true);
        try {
            const body: Record<string, Partial<Plan>> = {};
            for (const p of plans) {
                body[p.id] = {
                    name: p.name,
                    price: p.price,
                    durationDays: p.durationDays,
                    dailyLimit: p.dailyLimit,
                    monthlyLimit: p.monthlyLimit,
                    maxSessions: p.maxSessions,
                    highlight: p.highlight,
                    capabilities: p.capabilities,
                    features: p.features,
                };
            }
            const res = await fetch("/api/settings/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) toast.success(t("plans.editor.saveOk"));
            else toast.error(t("plans.editor.saveError"));
        } catch {
            toast.error(t("plans.editor.saveException"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" /> {t("plans.editor.title")}
                </CardTitle>
                <CardDescription>
                    {t("plans.editor.description")}{" "}
                    <b>-1</b> {t("plans.editor.legend.unlimited")}; {t("plans.editor.legend.priceLabel")}{" "}
                    <b>{t("plans.editor.legend.empty")}</b> {t("plans.editor.legend.custom")}; <b>0</b>{" "}
                    {t("plans.editor.legend.free")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading && <p className="text-sm text-muted-foreground">{t("plans.editor.loading")}</p>}

                {plans.map((p, idx) => (
                    <div key={p.id} className="rounded-lg border border-border/60 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold">{p.id}</span>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                {t("plans.editor.mostPopular")}
                                <Switch
                                    checked={!!p.highlight}
                                    onCheckedChange={(c) => update(idx, { highlight: c })}
                                />
                            </label>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                            <div className="grid gap-1">
                                <Label className="text-xs">{t("plans.editor.fields.name")}</Label>
                                <input className={inputClass} value={p.name}
                                    onChange={(e) => update(idx, { name: e.target.value })} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">{t("plans.editor.fields.price")}</Label>
                                <input className={inputClass} type="number" value={p.price ?? ""}
                                    onChange={(e) => update(idx, { price: e.target.value === "" ? null : Number(e.target.value) })} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">{t("plans.editor.fields.duration")}</Label>
                                <input className={inputClass} type="number" value={p.durationDays}
                                    onChange={(e) => update(idx, { durationDays: Number(e.target.value) })} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">{t("plans.editor.fields.dailyLimit")}</Label>
                                <input className={inputClass} type="number" value={p.dailyLimit}
                                    onChange={(e) => update(idx, { dailyLimit: Number(e.target.value) })} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">{t("plans.editor.fields.monthlyLimit")}</Label>
                                <input className={inputClass} type="number" value={p.monthlyLimit}
                                    onChange={(e) => update(idx, { monthlyLimit: Number(e.target.value) })} />
                            </div>
                            <div className="grid gap-1">
                                <Label className="text-xs">{t("plans.editor.fields.maxSessions")}</Label>
                                <input className={inputClass} type="number" value={p.maxSessions}
                                    onChange={(e) => update(idx, { maxSessions: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <Label className="text-xs">{t("plans.editor.fields.capabilities")}</Label>
                            <div className="grid sm:grid-cols-2 gap-2 rounded-md border border-border/50 p-3">
                                {CAPABILITIES.map((cap) => (
                                    <label key={cap.id} className="flex items-center justify-between gap-2 text-sm">
                                        <span>{t(`plans.capabilities.${cap.id}`)}</span>
                                        <Switch
                                            checked={p.capabilities?.[cap.id] !== false}
                                            onCheckedChange={(c) => toggleCap(idx, cap.id, c)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-1">
                            <Label className="text-xs">{t("plans.editor.fields.features")}</Label>
                            <textarea
                                className={`${inputClass} h-24 py-2`}
                                value={(p.features || []).join("\n")}
                                onChange={(e) => update(idx, { features: e.target.value.split("\n") })}
                            />
                        </div>
                    </div>
                ))}

                <Button onClick={save} disabled={saving || loading}>
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    {t("plans.editor.save")}
                </Button>
            </CardContent>
        </Card>
    );
}
