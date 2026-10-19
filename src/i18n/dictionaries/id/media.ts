const media = {
    title: "Kelola Media",
    subtitle: "Kelola file media yang sudah diunduh",
    refresh: "Muat Ulang",
    stats: {
        totalSize: "Total Ukuran",
        totalFiles: "Total File",
        images: "Gambar",
        other: "Lainnya",
    },
    searchPlaceholder: "Cari berdasarkan nama file, sesi, pengguna, atau pengirim...",
    filters: {
        all: "Semua",
        image: "Gambar",
        video: "Video",
        audio: "Audio",
        document: "Dokumen",
    },
    selectedCount: "{count} dipilih",
    delete: {
        deleting: "Menghapus...",
        button: "Hapus",
        confirmTitle: "Hapus {count} file?",
        confirmDescription:
            "Tindakan ini tidak dapat dibatalkan. File yang dipilih akan dihapus permanen dari server.",
        cancel: "Batal",
    },
    clear: "Bersihkan",
    sender: {
        me: "Saya (Terkirim)",
        unknown: "Tidak diketahui",
    },
    group: {
        userAccount: "Akun Pengguna",
        sessionOne: "{count} Sesi",
        sessions: "{count} Sesi",
        mediaCount: "{count} Media",
    },
    empty: {
        filtered: "Tidak ada file media yang cocok dengan filter",
        none: "Belum ada file media yang diunduh",
    },
    selectAll: "Pilih Semua",
    deselectAll: "Batalkan Pilihan Semua",
    toast: {
        loadFailed: "Gagal memuat file media",
        deleted: "{count} file dihapus",
        deletePartialFailed: "Gagal menghapus {count} file",
        deleteFailed: "Gagal menghapus file",
    },
} as const;

export default media;
