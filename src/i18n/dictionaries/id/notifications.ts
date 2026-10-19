const notifications = {
    page: {
        title: "Pengelola Notifikasi",
    },
    compose: {
        title: "Susun Notifikasi",
        description: "Kirim peringatan ke pengguna atau siaran ke seluruh sistem.",
    },
    form: {
        titleLabel: "Judul",
        titlePlaceholder: "mis. Pemeliharaan Sistem",
        messageLabel: "Pesan",
        messagePlaceholder: "Pesan detail...",
        typeLabel: "Jenis",
        types: {
            info: "Info",
            warning: "Peringatan",
            success: "Sukses",
            system: "Sistem",
        },
        actionLinkLabel: "Tautan Aksi (Opsional)",
        broadcastLabel: "Siarkan ke SEMUA Pengguna",
        targetUserLabel: "ID Pengguna Target",
        targetUserPlaceholder: "ID pengguna (cuid)",
    },
    send: "Kirim Notifikasi",
    preview: {
        title: "Pratinjau",
        defaultTitle: "Judul Notifikasi",
        defaultMessage: "Konten pesan notifikasi akan muncul di sini.",
        justNow: "Baru saja",
    },
    toast: {
        titleMessageRequired: "Judul dan Pesan wajib diisi",
        targetRequired: "ID pengguna target wajib diisi untuk pengiriman non-broadcast",
        sent: "Notifikasi berhasil dikirim! (Jumlah: {count})",
        sendFailed: "Gagal mengirim notifikasi",
        sendError: "Terjadi kesalahan saat mengirim notifikasi",
    },
} as const;

export default notifications;
