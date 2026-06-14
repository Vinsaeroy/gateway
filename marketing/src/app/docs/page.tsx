import Link from "next/link";
import { Bot, ArrowRight, KeyRound, Send, Gauge } from "lucide-react";
import { LandingNav } from "@/components/landing/landing-nav";
import { Button } from "@/components/ui/button";
import { DASHBOARD_URL, links, SITE_NAME } from "@/lib/site";

export const metadata = {
  title: `API Docs | ${SITE_NAME}`,
  description: "Panduan singkat REST API WA-AKG: autentikasi, kirim pesan, dan limit."
};

const API = `${DASHBOARD_URL}/api`;

function Code({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-slate-900 text-slate-100 text-sm p-4 overflow-x-auto border border-slate-800">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />

      <main className="flex-1 pt-36 pb-24">
        <div className="container max-w-3xl mx-auto px-4 md:px-6">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-3">
              Dokumentasi API
            </h1>
            <p className="text-muted-foreground text-lg">
              Panduan singkat untuk mulai. Dokumentasi interaktif lengkap (Swagger) ada di dashboard.
            </p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Link href="/swagger">
                <Button className="rounded-full">
                  Buka Swagger Interaktif <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={links.dashboard}>
                <Button variant="glass" className="rounded-full">Dapatkan API Key</Button>
              </Link>
            </div>
          </div>

          <section className="space-y-10">
            {/* Base URL */}
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2 text-foreground">Base URL</h2>
              <Code>{API}</Code>
            </div>

            {/* Auth */}
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> Autentikasi
              </h2>
              <p className="text-muted-foreground mb-3">
                Setiap request menyertakan header <code className="font-mono">X-API-Key</code>.
                Ambil API key dari dashboard (menu Webhooks &amp; API).
              </p>
              <Code>{`X-API-Key: wag_xxxxxxxxxxxxxxxxxxxxxxxx`}</Code>
            </div>

            {/* Send message */}
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" /> Kirim Pesan
              </h2>
              <p className="text-muted-foreground mb-3">
                Kirim teks ke sebuah JID lewat sesi yang sudah terhubung.
              </p>
              <Code>{`curl -X POST "${API}/messages/{sessionId}/{jid}/send" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "message": { "text": "Halo dari WA-AKG!" } }'`}</Code>
              <p className="text-muted-foreground mt-4 mb-2 text-sm">Contoh dengan JavaScript (fetch):</p>
              <Code>{`await fetch("${API}/messages/mysession/628123456789@s.whatsapp.net/send", {
  method: "POST",
  headers: {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ message: { text: "Halo!" } })
});`}</Code>
            </div>

            {/* Rate limit */}
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-2 text-foreground flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" /> Rate Limit
              </h2>
              <p className="text-muted-foreground mb-3">
                Limit request dihitung per plan (harian &amp; bulanan). Kalau habis,
                API membalas <code className="font-mono">429</code> dengan header
                <code className="font-mono"> X-RateLimit-Remaining-*</code>.
                Cek pemakaian via <code className="font-mono">GET /usage</code>.
              </p>
              <Link href="/pricing" className="text-primary hover:underline text-sm font-medium">
                Lihat limit tiap plan →
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-background/50 backdrop-blur-xl py-10">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground" translate="no">{SITE_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {SITE_NAME}</p>
        </div>
      </footer>
    </div>
  );
}
