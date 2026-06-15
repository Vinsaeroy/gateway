import Link from "next/link";
import { ArrowRight, Bot, Zap, Shield, Globe, MessageSquare, Clock, Code, ChevronRight, Sparkles, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingCards } from "@/components/landing/pricing";
import fs from "fs";
import path from "path";

export const metadata = {
  title: "RifalosID | Premium WhatsApp Gateway",
  description: "A powerful, self-hosted dashboard to manage your WhatsApp sessions, schedules, and auto-replies. Built for modern businesses.",
  openGraph: {
    title: "RifalosID | Premium WhatsApp Gateway",
    description: "Self-hosted WhatsApp Gateway with Multi-device support, Auto-replies, and API integration.",
    type: "website",
  },
};

export default function Home() {
  const packagePath = path.join(process.cwd(), "package.json");
  let version = "v1.2.0";
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    version = `v${packageJson.version}`;
  } catch (error) {
    console.error("Failed to read package.json", error);
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      <LandingNav />

      <main className="flex-1">
        {/* ============ HERO ============ */}
        <section className="relative pt-36 pb-28 lg:pt-44 lg:pb-36 overflow-hidden">
          {/* Grid + ambient orbs */}
          <div className="absolute inset-0 bg-grid pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-float pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[34rem] h-[34rem] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[120px] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Release {version} sudah live
                <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
              </div>

              <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] animate-in fade-in slide-in-from-bottom-6 duration-700">
                <span className="block text-foreground pb-1">WhatsApp Gateway</span>
                <span className="text-gradient-animate block pb-2">untuk bisnis modern.</span>
              </h1>

              <p className="mx-auto max-w-2xl text-muted-foreground text-lg sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                Kelola banyak sesi WhatsApp, auto-reply pintar, broadcast terjadwal, dan integrasi REST API — semua dalam satu dashboard yang cepat dan elegan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto px-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 rounded-full text-base shadow-2xl shadow-primary/30 hover:shadow-primary/40 group">
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/docs" className="w-full sm:w-auto">
                  <Button size="lg" variant="glass" className="w-full h-14 px-8 rounded-full text-base transition-all hover:bg-white/40 dark:hover:bg-white/10">
                    Lihat Dokumentasi
                  </Button>
                </Link>
              </div>
            </div>

            {/* Dashboard preview mockup */}
            <div className="relative mt-16 lg:mt-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
              <div className="absolute -inset-x-8 -top-8 bottom-0 bg-gradient-to-t from-primary/20 to-transparent blur-3xl -z-10" />
              <div className="glow-border glass rounded-3xl p-2 shadow-2xl shadow-black/10 dark:shadow-black/40">
                <div className="rounded-2xl overflow-hidden border border-border bg-background/60">
                  {/* Fake window bar */}
                  <div className="flex items-center gap-2 px-4 h-10 border-b border-border bg-muted/40">
                    <span className="h-3 w-3 rounded-full bg-red-400/70" />
                    <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                    <span className="ml-3 text-xs text-muted-foreground font-mono">app.rifalosid.com/dashboard</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-5 sm:p-7">
                    <MockStat icon={<Activity className="h-4 w-4 text-emerald-500" />} label="Sesi Aktif" value="12" />
                    <MockStat icon={<MessageSquare className="h-4 w-4 text-blue-500" />} label="Pesan Hari Ini" value="8,420" />
                    <MockStat icon={<Users className="h-4 w-4 text-purple-500" />} label="Kontak" value="3,191" />
                    <div className="col-span-3 h-28 sm:h-36 rounded-xl bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent border border-border flex items-end gap-1.5 p-4">
                      {[40, 65, 35, 80, 55, 95, 60, 75, 45, 88, 70, 50].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-emerald-400/60" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STATS BAR ============ */}
        <section className="relative border-y border-border bg-muted/30">
          <div className="container px-4 md:px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
              <StatItem value="99.9%" label="Uptime" />
              <StatItem value="<200ms" label="Latensi API" />
              <StatItem value="Multi" label="Device Support" />
              <StatItem value="24/7" label="Otomasi" />
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section id="features" className="py-28 lg:py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-primary mb-5">
                <Sparkles className="h-4 w-4" /> Fitur Unggulan
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-5 text-foreground">Dirancang untuk skala</h2>
              <p className="text-muted-foreground text-lg">
                Fitur lengkap yang dikemas dalam antarmuka yang indah dan performan.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-amber-500" />}
                title="API & Webhook Instan"
                description="Kirim pesan, media, dan tangani event masuk secara real-time lewat REST API yang andal."
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
                title="Auto Reply Pintar"
                description="Buat balasan otomatis berbasis kata kunci untuk melayani pelanggan 24/7 tanpa lelah."
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6 text-purple-500" />}
                title="Scheduler Presisi"
                description="Jadwalkan pesan untuk dikirim di waktu tertentu. Sempurna untuk kampanye dan pengingat."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-emerald-500" />}
                title="Aman & Privat"
                description="Arsitektur self-hosted memastikan data dan sesi Anda sepenuhnya dalam kendali Anda."
              />
              <FeatureCard
                icon={<Code className="h-6 w-6 text-rose-500" />}
                title="Developer Experience"
                description="Dibangun dengan TypeScript, dokumentasi Swagger lengkap, dan typing yang ketat."
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6 text-cyan-500" />}
                title="Multi-Session"
                description="Hubungkan, pantau, dan kontrol banyak nomor WhatsApp dari satu dashboard terpadu."
              />
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="py-28 lg:py-32 relative">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-14 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-primary mb-5">
                <Sparkles className="h-4 w-4" /> Harga
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-5 text-foreground">Sederhana &amp; Transparan</h2>
              <p className="text-muted-foreground text-lg">
                Mulai gratis, upgrade kapan saja. Pembayaran cepat via QRIS (KlikQRIS).
              </p>
            </div>
            <PricingCards ctaHref="/auth/login" />
            <p className="text-center text-sm text-muted-foreground mt-8">
              Semua plan termasuk akses REST API. Limit dihitung per request API.
            </p>
          </div>
        </section>

        {/* ============ TECH STACK ============ */}
        <section className="py-20 relative overflow-hidden">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10">Dibangun dengan teknologi standar industri</p>
            <div className="flex flex-wrap justify-center gap-10 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-foreground shadow-[0_0_10px_currentColor]" />Next.js</span>
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_currentColor]" />TypeScript</span>
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_currentColor]" />Baileys</span>
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-teal-500 shadow-[0_0_10px_currentColor]" />Prisma</span>
            </div>
          </div>
        </section>

        {/* ============ CTA BANNER ============ */}
        <section className="py-20 relative">
          <div className="container px-4 md:px-6">
            <div className="glow-border relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-blue-500/10 to-transparent border border-border px-8 py-16 md:px-16 md:py-20 text-center max-w-5xl mx-auto">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl">
                  Siap otomasi WhatsApp bisnis Anda?
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl">
                  Buat akun gratis dalam hitungan menit. Tanpa kartu kredit, langsung pakai.
                </p>
                <Link href="/auth/login">
                  <Button size="lg" className="h-14 px-10 rounded-full text-base shadow-2xl shadow-primary/30 hover:shadow-primary/40 group">
                    Mulai Gratis Sekarang
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
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
              <span className="text-xl font-bold text-foreground" translate="no">RifalosID</span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">API &amp; Docs</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span translate="no">RifalosID</span>. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MockStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">{value}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-extrabold text-gradient tracking-tight">{value}</span>
      <span className="text-sm text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group relative p-7 glass-panel glow-border rounded-[1.75rem] hover-lift shimmer overflow-hidden">
      <div className="relative z-10">
        <div className="mb-5 inline-flex p-3.5 rounded-2xl bg-background/60 backdrop-blur-md shadow-sm border border-border group-hover:scale-110 transition-transform duration-500 ease-out">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2.5 text-foreground tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-[0.95rem] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
