import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale } from "lucide-react";

export const metadata = {
    title: "Terms of Service | WA-AKG",
    description: "Terms of Service and Usage Guidelines for WA-AKG.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden py-24 selection:bg-primary/30 selection:text-primary-foreground">
            {/* Ambient background glows */}
            <div className="fixed top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Scale className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Terms of Service</h1>
                            <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed">

                        <p className="lead text-lg text-muted-foreground mb-8">
                            Welcome to WA-AKG. By accessing or using our WhatsApp Gateway platform, you agree to be bound by these Terms. If you do not agree, please do not use the service.
                        </p>

                        <h2 className="flex items-center gap-2 mt-8 text-2xl border-b pb-2">
                            <ShieldCheck className="h-6 w-6 text-emerald-500" />
                            1. Data Security & Responsibility
                        </h2>
                        <p>
                            Security forms the core of our service. As a self-hosted platform, WA-AKG ensures that your data remains strictly within your own infrastructure.
                        </p>
                        <ul>
                            <li><strong>Your Data is Yours:</strong> We do not track, intercept, or sell your WhatsApp messages, contact lists, or session data. Your information is secure and not misused.</li>
                            <li><strong>Safe Usage:</strong> You are responsible for ensuring your hardware and server environments are properly secured.</li>
                            <li><strong>Authentication:</strong> You must safeguard your account credentials. Do not share your login details with unauthorized personnel.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">2. Acceptable Use Policy</h2>
                        <p>
                            When utilizing WA-AKG's API, auto-replies, and broadcasting capabilities, you agree to abide by WhatsApp's official Terms of Service and Anti-Spam policies. You agree not to:
                        </p>
                        <ul>
                            <li>Send unsolicited "spam" messages or bulk promotional campaigns to users who have not explicitly opted-in.</li>
                            <li>Use the platform to distribute malicious software, phishing links, or illegal content.</li>
                            <li>Attempt to reverse-engineer the core API or overload the service with excessive requests.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">3. Account Integrity</h2>
                        <p>
                            WA-AKG provides tools to manage multiple WhatsApp sessions. It is crucial to monitor your active devices. If you suspect unauthorized access to your gateway dashboard, immediately change your password and revoke any connected WhatsApp sessions from your physical device.
                        </p>

                        <h2 className="mt-8 text-2xl border-b pb-2">4. Disclaimers and Limitations</h2>
                        <p>
                            WA-AKG is provided "as is" and without warranties of any kind. We utilize third-party libraries (such as Baileys) to connect to WhatsApp web protocols. Changes to WhatsApp's internal systems may occasionally disrupt service. We are not liable for any account suspensions or bans imposed by WhatsApp as a result of your usage.
                        </p>

                        <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="font-semibold mb-2">Have questions about these terms?</p>
                            <p className="text-sm text-muted-foreground mb-0">Please review our <Link href="/docs">Documentation</Link> or reach out to the project maintainers for further clarification.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
