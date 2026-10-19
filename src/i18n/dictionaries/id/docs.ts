const docs = {
    page: {
        metaTitle: "Dokumentasi API Publik - {appName}",
        metaDescription: "Referensi API lengkap untuk WhatsApp Gateway {appName}",
        swaggerLink: "Swagger UI",
        dashboardLink: "Dashboard",
        fallback:
            "# Dokumentasi sedang tidak tersedia\n\nFile dokumentasi tidak dapat dimuat di server ini.\n\nSementara itu, kamu bisa pakai:\n\n- **[Swagger UI](/swagger)** — referensi API interaktif & uji coba endpoint\n- **[Dashboard API Docs](/dashboard/api-docs)**\n",
    },
    swagger: {
        loading: "Memuat...",
        authTitle: "Dokumentasi API WA-AKG",
        authSubtitle: "Silakan autentikasi untuk mengakses Swagger UI",
        username: "Username",
        usernamePlaceholder: "Masukkan username",
        password: "Password",
        passwordPlaceholder: "Masukkan password",
        invalidCredentials: "Kredensial tidak valid",
        accessButton: "Akses Dokumentasi",
        defaultCredentials: "Kredensial bawaan:",
        defaultUsernameLabel: "Username:",
        defaultPasswordLabel: "Password:",
        subtitle: "Dokumentasi API interaktif dengan 58+ endpoint",
        logout: "Keluar",
        loadingSpec: "Memuat dokumentasi…",
        loadFailedTitle: "Gagal memuat dokumentasi API",
        rawSpecLink: "Buka spesifikasi mentah (/api/docs)",
        errors: {
            notJson: "Respons bukan JSON (mungkin ke-redirect / error server)",
            invalidSpec: "Spesifikasi OpenAPI tidak valid",
            loadFailed: "Gagal memuat dokumentasi",
        },
    },
} as const;

export default docs;
