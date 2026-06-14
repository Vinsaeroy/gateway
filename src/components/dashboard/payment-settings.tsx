"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Kartu pengaturan payment gateway KlikQRIS — HANYA dirender untuk SUPERADMIN.
// API key disimpan di server (DB) & tidak pernah ditampilkan utuh.
export function PaymentSettingsCard() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [keySet, setKeySet] = useState(false);
    const [keyMasked, setKeyMasked] = useState<string | null>(null);
    const [form, setForm] = useState({
        klikqrisBaseUrl: "https://klikqris.com/api",
        klikqrisMerchantId: "",
        klikqrisApiKey: "", // kosong = jangan ubah
        klikqrisEnabled: false
    });

    const load = () => {
        setLoading(true);
        fetch("/api/settings/payment")
            .then((r) => r.json())
            .then((res) => {
                if (res.status && res.data) {
                    setForm((f) => ({
                        ...f,
                        klikqrisBaseUrl: res.data.klikqrisBaseUrl || "https://klikqris.com/api",
                        klikqrisMerchantId: res.data.klikqrisMerchantId || "",
                        klikqrisEnabled: !!res.data.klikqrisEnabled,
                        klikqrisApiKey: ""
                    }));
                    setKeySet(!!res.data.klikqrisApiKeySet);
                    setKeyMasked(res.data.klikqrisApiKeyMasked || null);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const save = async () => {
        setSaving(true);
        try {
            const payload: any = {
                klikqrisBaseUrl: form.klikqrisBaseUrl,
                klikqrisMerchantId: form.klikqrisMerchantId,
                klikqrisEnabled: form.klikqrisEnabled
            };
            // hanya kirim apiKey kalau admin mengetik yang baru
            if (form.klikqrisApiKey.trim() !== "") payload.klikqrisApiKey = form.klikqrisApiKey.trim();

            const res = await fetch("/api/settings/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok && data.status) {
                toast.success("Pengaturan pembayaran disimpan");
                setForm((f) => ({ ...f, klikqrisApiKey: "" }));
                load();
            } else {
                toast.error(data.message || "Gagal menyimpan");
            }
        } catch {
            toast.error("Gagal menyimpan pengaturan pembayaran");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Gateway (KlikQRIS)
                </CardTitle>
                <CardDescription>
                    Khusus SUPERADMIN. API key disimpan aman di server dan dipakai untuk semua
                    transaksi upgrade plan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                        <Label>Aktifkan pembayaran</Label>
                        <p className="text-xs text-muted-foreground">
                            Kalau mati, tombol upgrade plan akan menolak checkout.
                        </p>
                    </div>
                    <Switch
                        checked={form.klikqrisEnabled}
                        onCheckedChange={(v) => setForm((f) => ({ ...f, klikqrisEnabled: v }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Base URL</Label>
                    <Input
                        value={form.klikqrisBaseUrl}
                        onChange={(e) => setForm((f) => ({ ...f, klikqrisBaseUrl: e.target.value }))}
                        placeholder="https://klikqris.com/api"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Merchant ID (id_merchant)</Label>
                    <Input
                        value={form.klikqrisMerchantId}
                        onChange={(e) => setForm((f) => ({ ...f, klikqrisMerchantId: e.target.value }))}
                        placeholder="MERCHANT_ID_ANDA"
                    />
                </div>

                <div className="space-y-2">
                    <Label>API Key (x-api-key)</Label>
                    <Input
                        type="password"
                        value={form.klikqrisApiKey}
                        onChange={(e) => setForm((f) => ({ ...f, klikqrisApiKey: e.target.value }))}
                        placeholder={keySet ? `Tersimpan (${keyMasked || "••••"}) — isi untuk ganti` : "API_KEY_ANDA"}
                    />
                    <p className="text-xs text-muted-foreground">
                        Kosongkan kalau tidak ingin mengubah API key yang sudah tersimpan.
                    </p>
                </div>

                <Button onClick={save} disabled={saving || loading} className="w-full">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Pengaturan Pembayaran
                </Button>
            </CardContent>
        </Card>
    );
}
