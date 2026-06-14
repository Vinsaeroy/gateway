import Link from "next/link";
import {
  ArrowRight, Bot, Zap, Shield, Globe, MessageSquare, Clock, Code, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingCards } from "@/components/landing/pricing";
import { links, SITE_NAME } from "@/lib/site";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden selection:bg-primary/30">
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden flex items-center justify-center min-h-[90vh]">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: "2s" }} />

          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto">
              <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-foreground/80">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                WhatsApp Gateway siap pakai
                <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                  <span className="block text-foreground pb-2">Next-Gen WhatsApp</span>
                  <span className="text-gradient block pb-2">Gateway Engine.</span>
                </h1>
                <p className="mx-auto max-w-2xl text-muted-foreground text-lg sm:text-xl leading-relaxed">
                  Solusi lengkap untuk mengelola sesi WhatsApp, auto-reply pintar, dan integrasi via REST API yang andal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-4 w-full sm:w-auto px-4">
                <Link href={links.dashboard} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 rounded-full text-base sm:text-lg shadow-2xl shadow-primary/30 group">
                    Enter Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button size="lg" variant="glass" className="w-full h-14 px-8 rounded-full text-base sm:text-lg">
                    Lihat Harga
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-32 relative">
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/30 border-y border-border" />
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6 text-foreground">Engineered for Scale</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Fitur lengkap dalam antarmuka yang cepat dan rapi.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <FeatureCard icon={<Zap className="h-6 w-6 text-amber-500" />} title="Instant API & Webhooks" description="Kirim pesan, media, dan tangani event masuk secara instan via REST API." />
              <FeatureCard icon={<MessageSquare className="h-6 w-6 text-blue-500" />} title="Smart Auto Replies" description="Auto-reply berbasis keyword untuk otomasi layanan pelanggan 24/7." />
              <FeatureCard icon={<Clock className="h-6 w-6 text-purple-500" />} title="Precision Scheduler" description="Jadwalkan pesan untuk dikirim nanti. Cocok untuk campaign & pengingat." />
              <FeatureCard icon={<Shield className="h-6 w-6 text-emerald-500" />} title="Secure & Private" description="Arsitektur self-hosted menjaga data dan sesi sepenuhnya milikmu." />
              <FeatureCard icon={<Code className="h-6 w-6 text-rose-500" />} title="Developer Experience" description="Dibangun dengan TypeScript dan dokumentasi Swagger lengkap." />
              <FeatureCard icon={<Globe className="h-6 w-6 text-cyan-500" />} title="Multi-Session" description="Kelola banyak nomor WhatsApp dari satu dashboard terpadu." />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 relative">
          <div className="container px-4 md:px-6 relative z-10 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6 text-foreground">Harga Sederhana &amp; Transparan</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Mulai gratis, upgrade kapan saja. Pembayaran cepat via QRIS.
              </p>
            </div>
            <PricingCards />
            <p className="text-center text-sm text-muted-foreground mt-8">
              Semua plan termasuk akses REST API. Limit dihitung per request API.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-xl py-12 relative z-10">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground" translate="no">{SITE_NAME}</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href={links.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span translate="no">{SITE_NAME}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative p-8 glass-panel rounded-[2rem] hover-lift overflow-hidden">
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-background/50 backdrop-blur-md shadow-sm border border-border group-hover:scale-110 transition-transform duration-500 ease-out">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-foreground tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
