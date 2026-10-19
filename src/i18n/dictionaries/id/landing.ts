const landing = {
    meta: {
        title: "RifalosID | WhatsApp Gateway Premium",
        description:
            "Dashboard self-hosted yang powerful untuk mengelola sesi WhatsApp, jadwal, dan auto-reply kamu. Dibangun untuk bisnis modern.",
        ogDescription:
            "WhatsApp Gateway self-hosted dengan dukungan Multi-device, Auto-reply, dan integrasi API.",
    },
    nav: {
        features: "Fitur",
        pricing: "Harga",
        docs: "API & Docs",
        github: "GitHub",
        signIn: "Masuk",
        dashboard: "Dashboard",
        toggleMenu: "Buka/tutup menu",
    },
    hero: {
        release: "Rilis {version} sudah live",
        titleLine1: "WhatsApp Gateway",
        titleLine2: "untuk bisnis modern.",
        subtitle:
            "Kelola banyak sesi WhatsApp, auto-reply pintar, broadcast terjadwal, dan integrasi REST API — semua dalam satu dashboard yang cepat dan elegan.",
        ctaPrimary: "Mulai Sekarang",
        ctaSecondary: "Lihat Dokumentasi",
    },
    mock: {
        activeSessions: "Sesi Aktif",
        todayMessages: "Pesan Hari Ini",
        contacts: "Kontak",
    },
    stats: {
        uptime: "Uptime",
        apiLatency: "Latensi API",
        deviceSupport: "Dukungan Device",
        automation: "Otomasi",
    },
    features: {
        badge: "Fitur Unggulan",
        heading: "Dirancang untuk skala",
        subheading: "Fitur lengkap yang dikemas dalam antarmuka yang indah dan performan.",
        items: {
            apiWebhooks: {
                title: "API & Webhook Instan",
                description:
                    "Kirim pesan, media, dan tangani event masuk secara real-time lewat REST API yang andal.",
            },
            autoReply: {
                title: "Auto Reply Pintar",
                description:
                    "Buat balasan otomatis berbasis kata kunci untuk melayani pelanggan 24/7 tanpa lelah.",
            },
            scheduler: {
                title: "Scheduler Presisi",
                description:
                    "Jadwalkan pesan untuk dikirim di waktu tertentu. Sempurna untuk kampanye dan pengingat.",
            },
            security: {
                title: "Aman & Privat",
                description:
                    "Arsitektur self-hosted memastikan data dan sesi Anda sepenuhnya dalam kendali Anda.",
            },
            developer: {
                title: "Developer Experience",
                description:
                    "Dibangun dengan TypeScript, dokumentasi Swagger lengkap, dan typing yang ketat.",
            },
            multiSession: {
                title: "Multi-Session",
                description:
                    "Hubungkan, pantau, dan kontrol banyak nomor WhatsApp dari satu dashboard terpadu.",
            },
        },
    },
    pricingSection: {
        badge: "Harga",
        heading: "Sederhana & Transparan",
        subheading:
            "Mulai gratis, upgrade kapan saja. Pembayaran cepat via QRIS (KlikQRIS).",
        footnote: "Semua plan termasuk akses REST API. Limit dihitung per request API.",
    },
    tech: {
        heading: "Dibangun dengan teknologi standar industri",
    },
    cta: {
        heading: "Siap otomasi WhatsApp bisnis Anda?",
        subheading: "Buat akun gratis dalam hitungan menit. Tanpa kartu kredit, langsung pakai.",
        button: "Mulai Gratis Sekarang",
    },
    footer: {
        privacy: "Privasi",
        terms: "Ketentuan",
        docs: "API & Docs",
        rights: "Semua hak dilindungi.",
    },
} as const;

export default landing;
