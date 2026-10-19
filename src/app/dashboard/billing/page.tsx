"use client";

import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Check, Sparkles, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { useTranslation } from "@/i18n/react";
import { intlLocale } from "@/i18n/config";
import { formatCurrency, formatNumber } from "@/i18n/format";

interface UsageData {
    plan: PlanId;
    planName: string;
    planExpiresAt: string | null;
    dayCount: number;
    monthCount: number;
    dailyLimit: number;
    monthlyLimit: number;
    dailyRemaining: number;
    monthlyRemaining: number;
}

interface CheckoutData {
    paymentId: string;
    plan: PlanId;
    planName: string;
    amount: number;
    totalAmount?: number | null;
    qrString: string | null;
    qrImageUrl: string | null;
    expiresAt: string | null;
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
    const { locale } = useTranslation();
    const unlimited = limit < 0;
    const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">
                    {formatNumber(used, locale)} / {unlimited ? "∞" : formatNumber(limit, locale)}
                </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${unlimited ? 4 : pct}%` }}
                />
            </div>
        </div>
    );
}

export default function BillingPage() {
    const { t, locale } = useTranslation();
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkout, setCheckout] = useState<CheckoutData | null>(null);
    const [buying, setBuying] = useState<PlanId | null>(null);
    const [polling, setPolling] = useState(false);

    const loadUsage = useCallback(async () => {
        try {
            const res = await fetch("/api/usage");
            const json = await res.json();
            if (json.status) setUsage(json.data);
        } catch {
            /* ignore */
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsage();
    }, [loadUsage]);

    // Polling status pembayaran
    useEffect(() => {
        if (!checkout) return;
        setPolling(true);
        let active = true;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/billing/status/${checkout.paymentId}`);
                const json = await res.json();
                if (!active) return;
                const status = json?.data?.paymentStatus;
                if (status === "PAID") {
                    clearInterval(interval);
                    setPolling(false);
                    toast.success(t("billing.toast.paymentSuccess", { plan: checkout.planName }));
                    setCheckout(null);
                    loadUsage();
                } else if (["EXPIRED", "FAILED", "CANCELLED"].includes(status)) {
                    clearInterval(interval);
                    setPolling(false);
                    toast.error(t("billing.toast.paymentFailed", { status }));
                    setCheckout(null);
                }
            } catch {
                /* ignore */
            }
        }, 4000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [checkout, loadUsage, t]);

    const handleBuy = async (plan: PlanId) => {
        const cfg = PLANS[plan];
        if (plan === "FREE") return;
        if (cfg.price === null) {
            toast.info(t("billing.toast.enterpriseCustom"));
            return;
        }
        setBuying(plan);
        try {
            const res = await fetch("/api/billing/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan })
            });
            const json = await res.json();
            if (!json.status) {
                toast.error(json.message || t("billing.toast.checkoutFailed"));
                return;
            }
            if (!json.data.qrString && !json.data.qrImageUrl) {
                toast.error(t("billing.toast.noQr"));
                return;
            }
            setCheckout(json.data);
        } catch (e: any) {
            toast.error(e?.message || t("billing.toast.checkoutFailed"));
        } finally {
            setBuying(null);
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{t("billing.title")}</h1>
                <p className="text-muted-foreground">{t("billing.subtitle")}</p>
            </div>

            {/* Current plan + usage */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t("billing.currentPlan.title")}</CardTitle>
                        <CardDescription>
                            {loading ? t("billing.currentPlan.loading") : `${usage?.planName || "Free"}`}
                            {usage?.planExpiresAt
                                ? t("billing.currentPlan.activeUntil", {
                                      date: new Date(usage.planExpiresAt).toLocaleDateString(intlLocale[locale])
                                  })
                                : ""}
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadUsage} disabled={loading} aria-label={t("billing.refresh")}>
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-5">
                    {usage ? (
                        <>
                            <UsageBar label={t("billing.usage.daily")} used={usage.dayCount} limit={usage.dailyLimit} />
                            <UsageBar label={t("billing.usage.monthly")} used={usage.monthCount} limit={usage.monthlyLimit} />
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">{t("billing.usage.loading")}</p>
                    )}
                </CardContent>
            </Card>

            {/* Checkout / QR panel */}
            {checkout && (
                <Card className="border-primary">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{t("billing.checkout.title", { plan: checkout.planName })}</CardTitle>
                            <CardDescription>
                                {t("billing.checkout.scanHint")}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setCheckout(null)} aria-label={t("billing.checkout.close")}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="bg-white p-4 rounded-2xl">
                            {checkout.qrString ? (
                                <QRCodeSVG value={checkout.qrString} size={240} />
                            ) : checkout.qrImageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={checkout.qrImageUrl} alt="QRIS" width={240} height={240} />
                            ) : null}
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{formatCurrency(checkout.totalAmount ?? checkout.amount, locale)}</p>
                            {checkout.totalAmount && checkout.totalAmount !== checkout.amount && (
                                <p className="text-xs text-muted-foreground">
                                    {t("billing.checkout.priceBreakdown", { price: formatCurrency(checkout.amount, locale) })}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 mt-1">
                                {polling && <Loader2 className="h-4 w-4 animate-spin" />}
                                {t("billing.checkout.waiting")}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Plans */}
            <div>
                <h2 className="text-lg font-semibold mb-4">{t("billing.choose.title")}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {PLAN_ORDER.map((id) => {
                        const plan = PLANS[id];
                        const isCurrent = usage?.plan === id;
                        const isFree = plan.price === 0;
                        const isCustom = plan.price === null;
                        return (
                            <div
                                key={id}
                                className={`relative flex flex-col p-6 rounded-2xl border ${plan.highlight ? "ring-2 ring-primary" : "border-border"}`}
                            >
                                {plan.highlight && (
                                    <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-xl bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
                                        <Sparkles className="h-3 w-3" /> {t("plans.popular")}
                                    </div>
                                )}
                                <h3 className="font-bold">{plan.name}</h3>
                                <div className="mt-2 mb-3">
                                    <span className="text-2xl font-extrabold">
                                        {isCustom ? t("plans.price.custom") : isFree ? t("plans.price.free") : formatCurrency(plan.price ?? 0, locale)}
                                    </span>
                                    {!isFree && !isCustom && (
                                        <span className="text-muted-foreground text-xs">{t("plans.price.perMonth")}</span>
                                    )}
                                </div>
                                <ul className="space-y-2 mb-5 flex-1">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-start gap-2 text-xs text-foreground/80">
                                            <Check className="h-4 w-4 text-primary shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full"
                                    variant={plan.highlight ? "default" : "outline"}
                                    disabled={isCurrent || isFree || buying !== null}
                                    onClick={() => handleBuy(id)}
                                >
                                    {buying === id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : isCurrent ? (
                                        t("billing.choose.active")
                                    ) : isFree ? (
                                        t("billing.choose.default")
                                    ) : isCustom ? (
                                        t("plans.cta.contactUs")
                                    ) : (
                                        t("billing.choose.upgrade")
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
