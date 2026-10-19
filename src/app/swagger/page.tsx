"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useTranslation } from "@/i18n/react";

export default function ApiDocsPage() {
    const { t } = useTranslation();
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [spec, setSpec] = useState<any>(null);
    const [specError, setSpecError] = useState("");
    const [specLoading, setSpecLoading] = useState(false);

    useEffect(() => {
        // Suppress Swagger UI legacy lifecycle warnings (ModelCollapse)
        const originalWarn = console.warn;
        console.warn = (...args) => {
            if (typeof args[0] === 'string' &&
                args[0].includes('UNSAFE_componentWillReceiveProps') &&
                args[0].includes('ModelCollapse')) {
                return;
            }
            originalWarn(...args);
        };

        // Check if already authorized via session storage
        const isAuth = sessionStorage.getItem("swagger_auth") === "true";
        if (isAuth) {
            setAuthorized(true);
        }
        setLoading(false);

        return () => {
            console.warn = originalWarn;
        };
    }, []);

    // Ambil spesifikasi sendiri supaya bisa menangani error (anti halaman blank).
    useEffect(() => {
        if (!authorized) return;
        let active = true;
        setSpecLoading(true);
        setSpecError("");
        fetch("/api/docs", { headers: { Accept: "application/json" } })
            .then(async (res) => {
                const ct = res.headers.get("content-type") || "";
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                if (!ct.includes("application/json"))
                    throw new Error(t("docs.swagger.errors.notJson"));
                return res.json();
            })
            .then((json) => {
                if (!active) return;
                if (!json || typeof json !== "object" || !json.openapi)
                    throw new Error(t("docs.swagger.errors.invalidSpec"));
                setSpec(json);
            })
            .catch((e) => {
                if (!active) return;
                setSpecError(e?.message || t("docs.swagger.errors.loadFailed"));
            })
            .finally(() => {
                if (active) setSpecLoading(false);
            });
        return () => {
            active = false;
        };
    }, [authorized]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic auth - compare with env variables or hardcoded (for demo)
        const validUsername = process.env.NEXT_PUBLIC_SWAGGER_USERNAME || "admin";
        const validPassword = process.env.NEXT_PUBLIC_SWAGGER_PASSWORD || "admin123";

        if (username === validUsername && password === validPassword) {
            sessionStorage.setItem("swagger_auth", "true");
            setAuthorized(true);
            setError("");
        } else {
            setError(t("docs.swagger.invalidCredentials"));
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("swagger_auth");
        setAuthorized(false);
        setUsername("");
        setPassword("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-gray-600">{t("docs.swagger.loading")}</div>
            </div>
        );
    }

    if (!authorized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {t("docs.swagger.authTitle")}
                        </h1>
                        <p className="text-gray-600 text-sm">
                            {t("docs.swagger.authSubtitle")}
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("docs.swagger.username")}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder={t("docs.swagger.usernamePlaceholder")}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t("docs.swagger.password")}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder={t("docs.swagger.passwordPlaceholder")}
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            {t("docs.swagger.accessButton")}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>{t("docs.swagger.defaultCredentials")}</p>
                        <p className="font-mono mt-1">
                            {t("docs.swagger.defaultUsernameLabel")} <span className="font-semibold">admin</span> |
                            {" "}{t("docs.swagger.defaultPasswordLabel")} <span className="font-semibold">admin123</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{t("docs.swagger.authTitle")}</h1>
                        <p className="text-blue-100 text-sm mt-1">
                            {t("docs.swagger.subtitle")}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        {t("docs.swagger.logout")}
                    </button>
                </div>
            </div>

            <div className="container mx-auto">
                {specLoading && (
                    <div className="p-10 text-center text-gray-600">{t("docs.swagger.loadingSpec")}</div>
                )}
                {specError && (
                    <div className="m-6 p-5 rounded-lg border border-red-200 bg-red-50 text-red-700">
                        <p className="font-semibold mb-1">{t("docs.swagger.loadFailedTitle")}</p>
                        <p className="text-sm mb-3">{specError}</p>
                        <a
                            href="/api/docs"
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium underline hover:text-red-900"
                        >
                            {t("docs.swagger.rawSpecLink")}
                        </a>
                    </div>
                )}
                {spec && !specError && <SwaggerUI spec={spec} />}
            </div>
        </div>
    );
}
