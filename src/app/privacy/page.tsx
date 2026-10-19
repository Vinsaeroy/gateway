import Link from "next/link";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
    const t = await getT();
    return {
        title: `${t("legal.privacy.title")} | WA-AKG`,
        description: t("legal.privacy.metaDescription"),
    };
}

export default async function PrivacyPage() {
    const t = await getT();
    return (
        <div className="min-h-screen bg-background relative overflow-hidden py-24 selection:bg-primary/30 selection:text-primary-foreground">
            {/* Ambient background glows */}
            <div className="fixed top-0 right-1/4 translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {t("legal.privacy.backToHome")}
                </Link>

                <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Shield className="h-8 w-8 text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{t("legal.privacy.title")}</h1>
                            <p className="text-muted-foreground mt-2">{t("legal.privacy.effectiveDate", { date: new Date().toLocaleDateString() })}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed">

                        <p className="lead text-lg text-muted-foreground mb-8">
                            {t("legal.privacy.intro")}
                        </p>

                        <h2 className="flex items-center gap-2 mt-8 text-2xl border-b pb-2">
                            <Lock className="h-6 w-6 text-blue-500" />
                            {t("legal.privacy.s1.title")}
                        </h2>
                        <p>
                            {t("legal.privacy.s1.bodyBefore")}<strong>{t("legal.privacy.s1.bodyStrong")}</strong>{t("legal.privacy.s1.bodyAfter")}
                        </p>
                        <ul>
                            <li><strong>{t("legal.privacy.s1.noTelemetryLabel")}</strong> {t("legal.privacy.s1.noTelemetryText")}</li>
                            <li><strong>{t("legal.privacy.s1.ownershipLabel")}</strong> {t("legal.privacy.s1.ownershipText")}</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">{t("legal.privacy.s2.title")}</h2>
                        <p>
                            {t("legal.privacy.s2.body")}
                        </p>
                        <ul>
                            <li><strong>{t("legal.privacy.s2.credentialsLabel")}</strong> {t("legal.privacy.s2.credentialsText")}</li>
                            <li><strong>{t("legal.privacy.s2.sessionsLabel")}</strong> {t("legal.privacy.s2.sessionsText")}</li>
                            <li><strong>{t("legal.privacy.s2.logsLabel")}</strong> {t("legal.privacy.s2.logsText")}</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">{t("legal.privacy.s3.title")}</h2>
                        <p>
                            {t("legal.privacy.s3.body")}
                        </p>
                        <ul>
                            <li>{t("legal.privacy.s3.proxyBefore")}<strong>{t("legal.privacy.s3.proxyStrong")}</strong>{t("legal.privacy.s3.proxyAfter")}</li>
                            <li>{t("legal.privacy.s3.firewall")}</li>
                            <li>{t("legal.privacy.s3.updates")}</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">{t("legal.privacy.s4.title")}</h2>
                        <p>
                            {t("legal.privacy.s4.bodyBefore")}<code>@whiskeysockets/baileys</code>{t("legal.privacy.s4.bodyAfter")}
                        </p>

                        <div className="mt-12 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                            <p className="font-semibold mb-2">{t("legal.privacy.needDetails")}</p>
                            <p className="text-sm text-muted-foreground mb-0">{t("legal.privacy.needDetailsBefore")}<Link href="https://github.com/vinsaeroy/WA-AKG">{t("legal.privacy.needDetailsLink")}</Link>{t("legal.privacy.needDetailsAfter")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
