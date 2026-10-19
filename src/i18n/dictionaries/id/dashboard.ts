const dashboard = {
    title: "Dasbor",
    subtitle: "Ringkasan gateway WhatsApp Anda",
    addSession: "Tambah Sesi",
    stats: {
        totalSessions: { title: "Total Sesi", description: "Sesi terdaftar" },
        connected: { title: "Terhubung", description: "Online & siap" },
        disconnected: { title: "Terputus", description: "Perlu koneksi ulang" },
        autoReply: { title: "Aturan Balas Otomatis", description: "Otomasi aktif" },
    },
    quickActions: {
        title: "Aksi Cepat",
        newSession: { label: "Sesi Baru", description: "Hubungkan perangkat baru" },
        sendMessage: { label: "Kirim Pesan", description: "Buka antarmuka chat" },
        botSettings: { label: "Pengaturan Bot", description: "Konfigurasi chatbot" },
        systemMonitor: { label: "Monitor Sistem", description: "Lihat metrik server" },
    },
    sessions: {
        title: "Sesi",
        viewAll: "Lihat semua",
        empty: {
            title: "Belum ada sesi",
            description: "Hubungkan perangkat WhatsApp pertama Anda untuk memulai",
            cta: "Buat Sesi",
        },
    },
} as const;

export default dashboard;
