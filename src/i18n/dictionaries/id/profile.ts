const profile = {
    title: "Profil WhatsApp",
    subtitle: "Kelola kehadiran akun WhatsApp Anda langsung dari dasbor.",
    noSession: {
        title: "Tidak Ada Sesi Terpilih",
        description: "Pilih sesi WhatsApp aktif dari bilah samping untuk mengelola profilnya.",
    },
    picture: {
        title: "Foto Profil",
        change: "Ganti Foto",
        remove: "Hapus Foto",
    },
    info: {
        title: "Info Profil",
        description: "Perbarui identitas WhatsApp Anda dan bagian Tentang.",
        nameLabel: "Nama WhatsApp (Pushname)",
        namePlaceholder: "Masukkan nama profil",
        save: "Simpan",
        nameHint: "Ini adalah nama yang terlihat oleh kontak Anda.",
        aboutLabel: "Tentang",
        aboutPlaceholder: "Tersedia",
        charCount: "{count}/139 karakter",
        updateAbout: "Perbarui Tentang",
        aboutHint: "Perbarui bagian 'Tentang' WhatsApp Anda.",
    },
    toasts: {
        loadFailed: "Gagal memuat profil",
        loadError: "Terjadi kesalahan saat memuat profil",
        nameUpdated: "Nama profil berhasil diperbarui",
        nameUpdateFailed: "Gagal memperbarui nama profil",
        nameUpdateError: "Terjadi kesalahan saat memperbarui nama profil",
        statusUpdated: "Tentang/status berhasil diperbarui",
        statusUpdateFailed: "Gagal memperbarui status",
        statusUpdateError: "Terjadi kesalahan saat memperbarui status",
        pictureUpdated: "Foto profil berhasil diperbarui",
        pictureUploadFailed: "Gagal mengunggah foto",
        pictureUploadError: "Terjadi kesalahan saat mengunggah foto",
        pictureRemoved: "Foto profil berhasil dihapus",
        pictureRemoveFailed: "Gagal menghapus foto",
        pictureRemoveError: "Terjadi kesalahan saat menghapus foto",
    },
} as const;

export default profile;
