"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/react";

import { useSession } from "@/components/dashboard/session-provider";
import { SessionGuard } from "@/components/dashboard/session-guard";

export default function StickerPage() {
    const { sessionId } = useSession();
    const { t } = useTranslation();
    const [target, setTarget] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Advanced options
    const [pack, setPack] = useState("");
    const [author, setAuthor] = useState("");
    const [quality, setQuality] = useState(50);
    const [type, setType] = useState("full");
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Ambil nama aplikasi (dari Settings) sebagai default pack/author — tidak hardcode.
    useEffect(() => {
        fetch("/api/settings/system")
            .then((r) => r.json())
            .then((res) => {
                const appName = res?.data?.appName || "Sticker";
                setPack((prev) => prev || appName);
                setAuthor((prev) => prev || appName);
            })
            .catch(() => {
                setPack((prev) => prev || "Sticker");
                setAuthor((prev) => prev || "Sticker");
            });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSend = async () => {
        if (!sessionId || !target || !file) return toast.error(t("sticker.toast.fillAllFields"));

        const jid = target.includes('@') ? target : `${target}@s.whatsapp.net`;
        const encodedJid = encodeURIComponent(jid);

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("pack", pack);
            formData.append("author", author);
            formData.append("quality", quality.toString());
            formData.append("type", type);

            const res = await fetch(`/api/messages/${sessionId}/${encodedJid}/sticker`, {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                toast.success(t("sticker.toast.sent"));
                setFile(null);
                setPreview(null);
                setTarget("");
            } else {
                const err = await res.json();
                toast.error(err.error || t("sticker.toast.sendFailed"));
            }
        } catch (e) {
            console.error(e);
            toast.error(t("sticker.toast.sendError"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SessionGuard>
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{t("sticker.title")}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("sticker.config.title")}</CardTitle>
                            <CardDescription>{t("sticker.config.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t("sticker.config.targetLabel")}</Label>
                                <Input
                                    placeholder="628123456789"
                                    value={target}
                                    onChange={e => setTarget(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t("sticker.config.fileLabel")}</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="w-8 h-8 mb-2 text-gray-500" />
                                            <p className="text-sm text-gray-500"><span className="font-semibold">{t("sticker.config.uploadHint")}</span> {t("sticker.config.uploadHintSuffix")}</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full">
                                    {showAdvanced ? t("sticker.config.hideAdvanced") : t("sticker.config.showAdvanced")}
                                </Button>
                            </div>

                            {showAdvanced && (
                                <div className="space-y-4 border p-4 rounded-md bg-slate-50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                            <Label>{t("sticker.config.packName")}</Label>
                                            <Input value={pack} onChange={e => setPack(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("sticker.config.author")}</Label>
                                            <Input value={author} onChange={e => setAuthor(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="space-y-2">
                                            <Label>{t("sticker.config.quality")}</Label>
                                            <Input type="number" min={1} max={100} value={quality} onChange={e => setQuality(parseInt(e.target.value))} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t("sticker.config.type")}</Label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                value={type}
                                                onChange={e => setType(e.target.value)}
                                            >
                                                <option value="full">{t("sticker.config.typeFull")}</option>
                                                <option value="crop">{t("sticker.config.typeCrop")}</option>
                                                <option value="circle">{t("sticker.config.typeCircle")}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button className="w-full" onClick={handleSend} disabled={loading || !sessionId || !file}>
                                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    {t("sticker.config.send")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t("sticker.preview.title")}</CardTitle>
                            <CardDescription>{t("sticker.preview.description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center h-[300px] bg-slate-100/50 rounded-lg m-6 mt-0">
                            {preview ? (
                                <div className="relative w-64 h-64 flex items-center justify-center">
                                    <img src={preview} alt={t("sticker.preview.alt")} className={`max-w-full max-h-full object-contain shadow-lg ${type === 'circle' ? 'rounded-full' : 'rounded-none'}`} />
                                    {/* Mock overlay for crop if needed, but styling is enough for now */}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>{t("sticker.preview.empty")}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </SessionGuard>
    );
}
