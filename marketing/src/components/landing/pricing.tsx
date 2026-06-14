import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS, PLAN_ORDER, formatIDR } from "@/lib/plans";
import { links } from "@/lib/site";

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto items-stretch">
      {PLAN_ORDER.map((id) => {
        const plan = PLANS[id];
        const isFree = plan.price === 0;
        const isCustom = plan.price === null;

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-[2rem] glass-panel hover-lift overflow-hidden ${
              plan.highlight ? "ring-2 ring-primary shadow-2xl shadow-primary/20" : "border border-border"
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 flex items-center gap-1 rounded-bl-2xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Populer
              </div>
            )}

            <h3 className="text-xl font-bold text-foreground tracking-tight">{plan.name}</h3>

            <div className="mt-4 mb-1 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-foreground">{formatIDR(plan.price)}</span>
              {!isFree && !isCustom && <span className="text-muted-foreground text-sm mb-1">/bulan</span>}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              {plan.monthlyLimit < 0
                ? "Request tanpa batas"
                : `${plan.monthlyLimit.toLocaleString("id-ID")} request / bulan`}
            </p>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                  <Check className="h-5 w-5 text-primary shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href={isCustom ? links.docs : isFree ? links.register : links.billing} className="mt-auto">
              <Button className="w-full rounded-full h-12" variant={plan.highlight ? "default" : "glass"}>
                {isFree ? "Mulai Gratis" : isCustom ? "Hubungi Kami" : `Pilih ${plan.name}`}
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
