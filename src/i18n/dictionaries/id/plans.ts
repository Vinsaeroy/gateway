const plans = {
    capabilities: {
        autoReply: "Auto Reply",
        broadcast: "Broadcast",
        autoBroadcast: "Auto Broadcast",
        scheduler: "Scheduler / Pesan Terjadwal",
        webhook: "Webhook & API Events",
        jpm: "JPM SW GC",
        sticker: "Sticker Maker",
    },
    popular: "Populer",
    price: {
        free: "Gratis",
        custom: "Custom",
        perMonth: "/bulan",
    },
    limits: {
        unlimitedRequests: "Request tanpa batas",
        requestsPerMonth: "{count} request / bulan",
    },
    cta: {
        startFree: "Mulai Gratis",
        contactUs: "Hubungi Kami",
        choose: "Pilih {name}",
    },
    landing: {
        swipeHint: "← geser untuk lihat plan lain →",
    },
    editor: {
        title: "Plan & Pricing",
        description:
            "Khusus SUPERADMIN. Atur harga, limit, dan benefit tiap plan. Perubahan langsung tampil di halaman pricing dan dipakai untuk pembatasan kuota API.",
        legend: {
            unlimited: "= unlimited",
            priceLabel: "harga",
            empty: "kosong",
            custom: "= custom",
            free: "= gratis.",
        },
        loading: "Memuat plan…",
        mostPopular: "Paling Populer",
        fields: {
            name: "Nama",
            price: "Harga / bulan (IDR, kosong = custom)",
            duration: "Durasi (hari)",
            dailyLimit: "Limit / hari (-1 = unlimited)",
            monthlyLimit: "Limit / bulan (-1 = unlimited)",
            maxSessions: "Maks sesi (-1 = unlimited)",
            capabilities: "Fitur (on/off) — jadi benefit + kontrol akses",
            features: "Benefit tambahan (teks bebas, satu per baris)",
        },
        save: "Simpan Plan & Pricing",
        saveOk: "Konfigurasi plan disimpan. Halaman pricing langsung ikut berubah.",
        saveError: "Gagal menyimpan konfigurasi plan",
        saveException: "Error menyimpan konfigurasi plan",
    },
} as const;

export default plans;
