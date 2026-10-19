const billing = {
    title: "Billing & Plan",
    subtitle: "Kelola langganan dan lihat pemakaian API kamu.",
    refresh: "Muat ulang",
    currentPlan: {
        title: "Plan Saat Ini",
        loading: "Memuat...",
        activeUntil: "· aktif s/d {date}",
    },
    usage: {
        daily: "Request hari ini",
        monthly: "Request bulan ini",
        loading: "Memuat pemakaian...",
    },
    checkout: {
        title: "Bayar {plan}",
        scanHint: "Scan QRIS di bawah pakai aplikasi e-wallet / mobile banking.",
        close: "Tutup",
        priceBreakdown: "Harga plan {price} + kode unik",
        waiting: "Menunggu pembayaran...",
    },
    choose: {
        title: "Pilih Plan",
        active: "Plan Aktif",
        default: "Default",
        upgrade: "Upgrade",
    },
    toast: {
        paymentSuccess: "Pembayaran berhasil! Plan {plan} aktif 🎉",
        paymentFailed: "Pembayaran {status}. Silakan coba lagi.",
        enterpriseCustom: "Plan Enterprise bersifat custom. Silakan hubungi admin.",
        checkoutFailed: "Gagal membuat transaksi",
        noQr: "Gateway tidak mengembalikan QR. Cek konfigurasi KlikQRIS.",
    },
    paymentActivated: {
        title: "Plan {plan} aktif 🎉",
        message: "Pembayaran dikonfirmasi. Plan {plan} aktif sampai {date}.",
    },
    payment: {
        title: "Payment Gateway (KlikQRIS)",
        description:
            "Khusus SUPERADMIN. API key disimpan aman di server dan dipakai untuk semua transaksi upgrade plan.",
        enable: "Aktifkan pembayaran",
        enableHint: "Kalau mati, tombol upgrade plan akan menolak checkout.",
        baseUrl: "Base URL",
        merchantId: "Merchant ID (id_merchant)",
        apiKey: "API Key (x-api-key)",
        apiKeyPlaceholder: "API_KEY_ANDA",
        apiKeyPlaceholderSaved: "Tersimpan ({masked}) — isi untuk ganti",
        apiKeyHint: "Kosongkan kalau tidak ingin mengubah API key yang sudah tersimpan.",
        save: "Simpan Pengaturan Pembayaran",
        saveOk: "Pengaturan pembayaran disimpan",
        saveError: "Gagal menyimpan",
        saveException: "Gagal menyimpan pengaturan pembayaran",
    },
} as const;

export default billing;
