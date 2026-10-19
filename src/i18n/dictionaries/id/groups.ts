const groups = {
    page: {
        title: "Grup",
        subtitleActive: "Kelola grup untuk sesi aktif.",
        subtitleNoSession: "Pilih sesi dari bilah atas.",
    },
    refresh: "Muat ulang",
    create: "Buat",
    searchPlaceholder: "Cari grup...",
    createDialog: {
        title: "Buat Grup Baru",
        subjectLabel: "Subjek Grup",
        subjectPlaceholder: "Grup Baru Saya",
        cancel: "Batal",
        confirm: "Buat",
    },
    loading: "Memuat grup...",
    empty: {
        matched: "Tidak ada grup yang cocok dengan kriteria.",
        noSession: "Tidak ada sesi dipilih.",
    },
    participants: "Peserta: {count}",
    toast: {
        fetchFailed: "Gagal memuat grup",
        created: "Grup dibuat",
        createFailed: "Gagal membuat grup",
    },
} as const;

export default groups;
