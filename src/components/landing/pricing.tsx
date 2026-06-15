import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_ORDER, formatIDR, CAPABILITIES } from "@/lib/plans";
import { getMergedPlans } from "@/lib/plans-store";

export async function PricingCards({ ctaHref = "/dashboard/billing" }: { ctaHref?: string }) {
    const all = await getMergedPlans();
    return (
        <div className="relative">
            {/* Mobile: geser ke samping (snap scroll). Desktop: grid. */}
            <div
                className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-7xl mx-auto items-stretch
                           overflow-x-auto md:overflow-visible snap-x snap-mandatory
                           px-5 md:px-0 pb-5 md:pb-0 -mx-1 md:mx-auto
                           [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
                {PLAN_ORDER.map((id) => {
                    const plan = all[id];
                    const isFree = plan.price === 0;
                    const isCustom = plan.price === null;

                    // Benefit = fitur aktif (dari toggle) + benefit teks tambahan.
                    const capBenefits = CAPABILITIES.filter((c) => plan.capabilities?.[c.id]).map((c) => c.label);
                    const benefits = [...capBenefits, ...(plan.features || [])];

                return (
                    <div
                        key={plan.id}
                        className={`relative flex flex-col p-7 sm:p-8 rounded-[1.75rem] glass-panel hover-lift overflow-hidden
                            snap-center shrink-0 md:shrink w-[82%] sm:w-[360px] md:w-auto ${
                            plan.highlight
                                ? "ring-2 ring-primary shadow-2xl shadow-primary/20"
                                : "border border-border"
                        }`}
                    >
                        {plan.highlight && (
                            <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-2xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                                <Sparkles className="h-3.5 w-3.5" /> Populer
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-foreground tracking-tight">{plan.name}</h3>

                        <div className="mt-4 mb-1 flex items-end gap-1">
                            <span className="text-4xl font-extrabold text-foreground">
                                {formatIDR(plan.price)}
                            </span>
                            {!isFree && !isCustom && (
                                <span className="text-muted-foreground text-sm mb-1">/bulan</span>
                            )}
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                            {plan.monthlyLimit < 0
                                ? "Request tanpa batas"
                                : `${plan.monthlyLimit.toLocaleString("id-ID")} request / bulan`}
                        </p>

                        <ul className="space-y-3 mb-8 flex-1">
                            {benefits.map((f, i) => (
                                <li key={`${f}-${i}`} className="flex items-start gap-3 text-sm text-foreground/80">
                                    <Check className="h-5 w-5 text-primary shrink-0" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>

                        <Link href={isCustom ? "/docs" : ctaHref} className="mt-auto">
                            <Button
                                className="w-full rounded-full h-12"
                                variant={plan.highlight ? "default" : "glass"}
                            >
                                {isFree ? "Mulai Gratis" : isCustom ? "Hubungi Kami" : `Pilih ${plan.name}`}
                            </Button>
                        </Link>
                    </div>
                );
            })}
            </div>

            {/* Hint geser di mobile */}
            <p className="md:hidden text-center text-xs text-muted-foreground mt-1">← geser untuk lihat plan lain →</p>
        </div>
    );
}
