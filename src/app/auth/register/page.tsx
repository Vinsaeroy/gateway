'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Bot, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import Link from 'next/link';
import { useTranslation } from "@/i18n/react";

const buildFormSchema = (t: (key: string) => string) =>
    z.object({
        name: z.string().min(2, t("auth.register.errors.nameMin")),
        email: z.string().email(t("auth.register.errors.email")),
        password: z.string().min(6, t("auth.register.errors.passwordMin")),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t("auth.register.errors.passwordMismatch"),
        path: ["confirmPassword"],
    });

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const formSchema = buildFormSchema(t);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t("auth.register.errors.registerFailed"));
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message || t("auth.register.errors.unexpected"));
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background relative overflow-hidden">
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="glass-panel p-10 rounded-3xl flex flex-col items-center text-center max-w-sm animate-in zoom-in duration-500">
                    <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                        <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">{t("auth.register.successTitle")}</h2>
                    <p className="text-muted-foreground">{t("auth.register.successRedirect")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen relative overflow-hidden bg-background py-12">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/4 w-[40rem] h-[40rem] bg-emerald-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="relative flex h-16 w-16 mb-4 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-primary text-white shadow-lg shadow-primary/30 hover:scale-105 transition-transform cursor-pointer">
                        <Bot className="h-8 w-8" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("auth.register.title")}</h1>
                    <p className="text-muted-foreground mt-2">{t("auth.register.subtitle")}</p>
                </div>

                <div className="glass-panel rounded-3xl p-8 shadow-2xl shadow-black/5 dark:shadow-black/40">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-medium animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/80">{t("auth.register.nameLabel")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("auth.register.namePlaceholder")}
                                                className="h-12 px-4 rounded-xl bg-background/50 border-white/20 dark:border-white/10 focus-visible:ring-primary/50 transition-all font-medium"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/80">{t("auth.register.emailLabel")}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t("auth.register.emailPlaceholder")}
                                                className="h-12 px-4 rounded-xl bg-background/50 border-white/20 dark:border-white/10 focus-visible:ring-primary/50 transition-all font-medium"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/80">{t("auth.register.passwordLabel")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="h-12 px-4 pr-12 rounded-xl bg-background/50 border-white/20 dark:border-white/10 focus-visible:ring-primary/50 transition-all font-medium"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    tabIndex={-1}
                                                    aria-label={showPassword ? t("auth.register.hidePassword") : t("auth.register.showPassword")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/80">{t("auth.register.confirmPasswordLabel")}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirm ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="h-12 px-4 pr-12 rounded-xl bg-background/50 border-white/20 dark:border-white/10 focus-visible:ring-primary/50 transition-all font-medium"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                    tabIndex={-1}
                                                    aria-label={showConfirm ? t("auth.register.hidePassword") : t("auth.register.showPassword")}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 mt-4"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("auth.register.creating")}</>
                                ) : (
                                    <>{t("auth.register.submit")} <ArrowRight className="ml-2 h-5 w-5" /></>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-xs text-center text-muted-foreground leading-relaxed">
                        {t("auth.register.termsNotice.before")}<Link href="/terms" className="underline hover:text-foreground">{t("auth.register.termsNotice.terms")}</Link>{t("auth.register.termsNotice.and")}<Link href="/privacy" className="underline hover:text-foreground">{t("auth.register.termsNotice.privacy")}</Link>{t("auth.register.termsNotice.after")}
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    {t("auth.register.alreadyHaveAccount")}{" "}
                    <Link href="/auth/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                        {t("auth.register.signIn")}
                    </Link>
                </div>
            </div>
        </div>
    );
}
