import Link from "next/link";
import { ArrowLeft, Lock, Shield } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | WA-AKG",
    description: "Privacy Policy and Data Handling for WA-AKG.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background relative overflow-hidden py-24 selection:bg-primary/30 selection:text-primary-foreground">
            {/* Ambient background glows */}
            <div className="fixed top-0 right-1/4 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Home
                </Link>

                <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Shield className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
                            <p className="text-muted-foreground mt-2">Effective Date: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed">

                        <p className="lead text-lg text-muted-foreground mb-8">
                            At WA-AKG, we believe that your data is your property. This Privacy Policy details the strict boundaries regarding how information is handled when using our open-source, self-hosted WhatsApp Gateway.
                        </p>

                        <h2 className="flex items-center gap-2 mt-8 text-2xl border-b pb-2">
                            <Lock className="h-6 w-6 text-blue-500" />
                            1. Zero-Tracking Architecture
                        </h2>
                        <p>
                            Because WA-AKG is designed to be <strong>self-hosted</strong>, all core data processing occurs exclusively on the hardware where you deploy the application.
                        </p>
                        <ul>
                            <li><strong>No Centralized Telemetry:</strong> The creators of WA-AKG do not receive telemetry, analytics, or usage reports about your WhatsApp interactions.</li>
                            <li><strong>Absolute Data Ownership:</strong> Your contacts, messages, schedules, and auto-replies remain in your own database. We cannot and will not access it.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">2. Data We Process Locally</h2>
                        <p>
                            When you deploy the gateway, the application running on your server interacts with:
                        </p>
                        <ul>
                            <li><strong>Authentication Credentials:</strong> Passwords you create for the dashboard are securely hashed using bcrypt before being stored in your local database.</li>
                            <li><strong>WhatsApp Sessions:</strong> WA-AKG acts as a bridge to WhatsApp Web. The session tokens (keys) necessary to maintain this connection are stored locally on your server.</li>
                            <li><strong>Communication Logs:</strong> Messages sent and received via the gateway are logged within your local database to provide you with historical data and webhook functionality.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">3. Protecting Your Information</h2>
                        <p>
                            While WA-AKG is built with modern security practices, the ultimate safety of your data depends on your hosting environment. We strongly recommend:
                        </p>
                        <ul>
                            <li>Deploying the application behind a reverse proxy with enforced <strong>SSL/TLS encryption</strong> (HTTPS).</li>
                            <li>Securing the host server with firewalls and SSH key authentication.</li>
                            <li>Keeping the underlying operating system and Node.js environment constantly updated.</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">4. Third-Party Integrations</h2>
                        <p>
                            WA-AKG utilizes the <code>@whiskeysockets/baileys</code> library to communicate directly with WhatsApp's servers. By using this gateway, your server will establish a direct web-socket connection to WhatsApp. Please be aware that your use of WhatsApp is still subject to Meta's Privacy Policy.
                        </p>

                        <div className="mt-12 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="font-semibold mb-2">Need Further Details?</p>
                            <p className="text-sm text-muted-foreground mb-0">If you have specific questions about data handling or wish to audit the code, please visit our <Link href="https://github.com/vinsaeroy/WA-AKG">GitHub Repository</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
