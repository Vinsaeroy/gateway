// Salinan ringkas dari plans config dashboard. Hanya data tampilan (pure TS).
// Kalau ubah harga/limit, sinkronkan dengan src/lib/plans.ts di app utama.

export type PlanId = "FREE" | "STANDARD" | "PRO" | "ENTERPRISE";

export interface PlanConfig {
  id: PlanId;
  name: string;
  price: number | null;
  durationDays: number;
  dailyLimit: number;
  monthlyLimit: number;
  maxSessions: number;
  highlight?: boolean;
  features: string[];
}

export const PLANS: Record<PlanId, PlanConfig> = {
  FREE: {
    id: "FREE",
    name: "Free",
    price: 0,
    durationDays: 0,
    dailyLimit: 100,
    monthlyLimit: 1000,
    maxSessions: 1,
    features: [
      "1 sesi WhatsApp",
      "100 request / hari",
      "1.000 request / bulan",
      "Auto-reply dasar",
      "Akses REST API",
      "Komunitas support"
    ]
  },
  STANDARD: {
    id: "STANDARD",
    name: "Standard",
    price: 50000,
    durationDays: 30,
    dailyLimit: 1000,
    monthlyLimit: 20000,
    maxSessions: 3,
    highlight: true,
    features: [
      "3 sesi WhatsApp",
      "1.000 request / hari",
      "20.000 request / bulan",
      "Auto-reply + scheduler",
      "Webhook event",
      "Email support"
    ]
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: 150000,
    durationDays: 30,
    dailyLimit: 5000,
    monthlyLimit: 100000,
    maxSessions: 10,
    features: [
      "10 sesi WhatsApp",
      "5.000 request / hari",
      "100.000 request / bulan",
      "Semua fitur Standard",
      "Auto broadcast",
      "Priority support"
    ]
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: null,
    durationDays: 30,
    dailyLimit: -1,
    monthlyLimit: -1,
    maxSessions: -1,
    features: [
      "Sesi WhatsApp unlimited",
      "Request unlimited",
      "Semua fitur Pro",
      "SLA & dedicated server",
      "Onboarding khusus",
      "Dedicated support"
    ]
  }
};

export const PLAN_ORDER: PlanId[] = ["FREE", "STANDARD", "PRO", "ENTERPRISE"];

export function formatIDR(amount: number | null): string {
  if (amount === null) return "Custom";
  if (amount === 0) return "Gratis";
  return "Rp" + amount.toLocaleString("id-ID");
}
