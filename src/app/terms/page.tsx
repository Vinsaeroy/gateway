import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale } from "lucide-react";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
    const t = await getT();
    return {
        title: `${t("legal.terms.title")} | WA-AKG`,
        description: t("legal.terms.metaDescription"),
    };
}

export default async function TermsPage() {
    const t = await getT();
    return (
        <div className="min-h-screen bg-background relative overflow-hidden py-24 selection:bg-primary/30 selection:text-primary-foreground">
            {/* Ambient background glows */}
            <div className="fixed top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="container max-w-4xl px-4 mx-auto relative z-10">

                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {t("legal.terms.backToHome")}
                </Link>

                <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Scale className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{t("legal.terms.title")}</h1>
                            <p className="text-muted-foreground mt-2">{t("legal.terms.lastUpdated", { date: new Date().toLocaleDateString() })}</p>
                        </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-p:leading-relaxed">

                        <p className="lead text-lg text-muted-foreground mb-8">
                            {t("legal.terms.intro")}
                        </p>

                        <h2 className="flex items-center gap-2 mt-8 text-2xl border-b pb-2">
                            <ShieldCheck className="h-6 w-6 text-emerald-500" />
                            {t("legal.terms.s1.title")}
                        </h2>
                        <p>
                            {t("legal.terms.s1.body")}
                        </p>
                        <ul>
                            <li><strong>{t("legal.terms.s1.yoursLabel")}</strong> {t("legal.terms.s1.yoursText")}</li>
                            <li><strong>{t("legal.terms.s1.safeLabel")}</strong> {t("legal.terms.s1.safeText")}</li>
                            <li><strong>{t("legal.terms.s1.authLabel")}</strong> {t("legal.terms.s1.authText")}</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">{t("legal.terms.s2.title")}</h2>
                        <p>
                            {t("legal.terms.s2.body")}
                        </p>
                        <ul>
                            <li>{t("legal.terms.s2.spam")}</li>
                            <li>{t("legal.terms.s2.malware")}</li>
                            <li>{t("legal.terms.s2.overload")}</li>
                        </ul>

                        <h2 className="mt-8 text-2xl border-b pb-2">{t("legal.terms.s3.title")}</h2>
                        <p>
                            {t("legal.terms.s3.body")}
                        </p>

                        <h2 className="mt-8 text-2xl border-b pb-2">{t("legal.terms.s4.title")}</h2>
                        <p>
                            {t("legal.terms.s4.body")}
                        </p>

                        <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="font-semibold mb-2">{t("legal.terms.questions")}</p>
                            <p className="text-sm text-muted-foreground mb-0">{t("legal.terms.questionsBefore")}<Link href="/docs">{t("legal.terms.questionsLink")}</Link>{t("legal.terms.questionsAfter")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
