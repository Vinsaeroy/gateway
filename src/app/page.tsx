import Link from "next/link";
import { ArrowRight, Bot, Github, Zap, Shield, Globe, MessageSquare, Clock, Code, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      {/* Navbar - Floating Glass */}
      <header className="fixed top-4 inset-x-4 md:inset-x-auto md:top-6 md:left-1/2 md:-translate-x-1/2 z-50 md:w-full md:max-w-5xl transition-all duration-300">
        <div className="glass rounded-full px-4 md:px-8 h-14 md:h-16 flex items-center justify-between mx-auto shadow-lg shadow-black/5 dark:shadow-black/20 border border-white/40 dark:border-white/10">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl shrink-0">
            <div className="relative flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-primary text-white shadow-inner">
              <Bot className="h-5 w-5 md:h-6 md:w-6" />
              <div className="absolute inset-0 rounded-full bg-primary blur-md -z-10 opacity-50 animate-pulse-glow" />
            </div>
            <span className="text-foreground tracking-tight" translate="no">RifalosID</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 md:gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">API & Docs</Link>
            <Link href="https://github.com/vinsaeroy/WA-AKG" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" /> GitHub
            </Link>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/auth/login">
              <Button size="sm" className="rounded-full px-5 md:px-6 bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden flex items-center justify-center min-h-[90vh]">
          {/* Animated Ambient Elements */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[30rem] h-[30rem] bg-blue-500/20 dark:bg-blue-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-10 max-w-[5xl] mx-auto">

              <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-foreground/80 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <span className="relative flex h-2 w-2 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Release {version} is live
                <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
              </div>

              <div className="space-y-6">
                <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl w-full">
                  <span className="block text-foreground pb-2">Next-Gen WhatsApp</span>
                  <span className="text-gradient block pb-2">Gateway Engine.</span>
                </h1>
                <p className="mx-auto max-w-[42rem] text-muted-foreground text-lg sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                  The complete open-source solution for managing WhatsApp sessions, orchestrating smart auto-replies, and integrating via a robust REST API.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 w-full sm:w-auto px-4">
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full h-14 px-8 rounded-full text-base sm:text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 group">
                    Enter Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/docs" className="w-full sm:w-auto">
                  <Button size="lg" variant="glass" className="w-full h-14 px-8 rounded-full text-base sm:text-lg transition-all hover:bg-white/40 dark:hover:bg-white/10">
                    Read Documentation
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 relative">
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/30 border-y border-border" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6 text-foreground">Engineered for Scale</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Carefully crafted features packaged in a gorgeous, performant interface.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-amber-500" />}
                title="Instant API & Webhooks"
                description="Send messages, media, and handle incoming events instantly via our robust REST API."
              />
              <FeatureCard
                icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
                title="Smart Auto Replies"
                description="Set up intelligent, keyword-based auto-replies to automate customer interactions 24/7."
              />
              <FeatureCard
                icon={<Clock className="h-6 w-6 text-purple-500" />}
                title="Precision Scheduler"
                description="Schedule targeted messages for future delivery. Perfect for campaigns and reminders."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-emerald-500" />}
                title="Secure & Private"
                description="Self-hosted architecture guarantees your data and sessions stay entirely under your control."
              />
              <FeatureCard
                icon={<Code className="h-6 w-6 text-rose-500" />}
                title="Developer Experience"
                description="Built on TypeScript with comprehensive Swagger documentation and strict typing."
              />
              <FeatureCard
                icon={<Globe className="h-6 w-6 text-cyan-500" />}
                title="Multi-Session Mastery"
                description="Connect, monitor, and control multiple distinct WhatsApp numbers from one unified dashboard."
              />
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-24 relative overflow-hidden">
          <div className="container px-4 md:px-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-12">Built with Industry Standards</p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 hover:opacity-100 transition-opacity duration-500">
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-foreground shadow-[0_0_10px_currentColor]"></div>Next.js</span>
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_currentColor]"></div>TypeScript</span>
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_currentColor]"></div>Baileys</span>
              <span className="text-xl md:text-2xl font-bold flex items-center gap-3 text-foreground tracking-tight"><div className="h-3 w-3 rounded-full bg-teal-500 shadow-[0_0_10px_currentColor]"></div>Prisma</span>
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
              <Link href="https://github.com/vinsaeroy/WA-AKG" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span translate="no">RifalosID</span>. Released under MIT.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group relative p-8 glass-panel rounded-[2rem] hover-lift overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex p-4 rounded-2xl bg-background/50 backdrop-blur-md shadow-sm border border-border group-hover:scale-110 transition-transform duration-500 ease-out">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-foreground tracking-tight">{title}</h3>
        <p className="text-muted-foreground text-base leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}

