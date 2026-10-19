const contacts = {
    page: {
        title: "Kontak",
        subtitle: "Kelola dan lihat kontak tersimpan Anda.",
    },
    list: {
        title: "Daftar Kontak",
        total: "Total: {total} kontak ditemukan",
    },
    perPagePlaceholder: "Per halaman",
    perPageOption: "{limit} / halaman",
    showAll: "Tampilkan Semua",
    searchPlaceholder: "Cari kontak...",
    table: {
        image: "Gambar",
        name: "Nama / Pushname",
        jid: "JID (ID)",
        phone: "Telepon / Alt",
    },
    loading: "Memuat...",
    empty: "Tidak ada kontak ditemukan.",
    unknown: "Tidak diketahui",
    pagination: {
        previous: "Sebelumnya",
        next: "Berikutnya",
        pageOf: "Halaman {page} dari {totalPages}",
    },
} as const;

export default contacts;
