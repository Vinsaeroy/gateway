import Link from "next/link";
import { Bot } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingCards } from "@/components/landing/pricing";

export const metadata = {
    title: "Pricing | RifalosID WhatsApp Gateway",
    description: "Pilih plan yang sesuai kebutuhanmu. Mulai gratis, bayar via QRIS."
};

export default function PricingPage() {
    return (
        <div className="flex min-h-screen flex-col overflow-hidden">
            <LandingNav />

            <main className="flex-1 pt-36 pb-24">
                <section className="container px-4 md:px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
                            Pilih Plan Kamu
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Mulai gratis dengan 1.000 request/bulan. Upgrade kapan saja, bayar
                            instan pakai QRIS (KlikQRIS).
                        </p>
                    </div>

                    <PricingCards ctaHref="/dashboard/billing" />

                    <p className="text-center text-sm text-muted-foreground mt-10">
                        Butuh kuota lebih besar atau kebutuhan khusus?{" "}
                        <Link href="/docs" className="text-primary hover:underline">
                            Hubungi kami
                        </Link>
                        .
                    </p>
                </section>
            </main>

            <footer className="border-t border-border/50 bg-background/50 backdrop-blur-xl py-10">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-foreground" translate="no">
                            RifalosID
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} RifalosID
                    </p>
                </div>
            </footer>
        </div>
    );
}
