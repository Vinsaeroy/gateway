const settings = {
    title: "Pengaturan",
    subtitle: "Konfigurasi sistem global. Hanya SuperAdmin yang dapat mengubah pengaturan.",
    viewOnlyTitle: "Mode Hanya Melihat",
    viewOnlyDesc: "Hanya Superadmin yang dapat mengubah pengaturan sistem. Anda dapat melihat pengaturan saat ini tetapi tidak dapat mengubahnya.",

    appConfigTitle: "Konfigurasi Aplikasi",
    appConfigDesc: "Pengaturan global untuk branding aplikasi dan kontrol akses.",

    appName: "Nama Aplikasi",
    appNameHint: "Mengubah nama di sidebar dan judul browser.",
    timezone: "Zona Waktu",
    timezoneHint: "Scheduler akan menggunakan zona waktu ini.",
    logoUrl: "URL Logo",
    logoUrlHint: "URL untuk logo dashboard utama.",
    faviconUrl: "URL Favicon",
    faviconUrlHint: "URL untuk ikon tab browser.",

    enableRegistration: "Aktifkan Pendaftaran Pengguna",
    enableRegistrationDesc: "Izinkan pengguna baru mendaftar akun. Matikan agar platform tetap privat.",

    language: "Bahasa",
    languageHint: "Bahasa antarmuka untuk seluruh sistem. Muat ulang untuk menerapkan ke mana-mana.",
    languageSelect: "Pilih bahasa",

    saveConfig: "Simpan Konfigurasi",
    saveSystemOk: "Pengaturan sistem diperbarui. Muat ulang untuk melihat perubahan.",
    saveSystemFail: "Gagal memperbarui pengaturan sistem",
    saveSystemError: "Terjadi kesalahan saat menyimpan pengaturan sistem",

    updatesTitle: "Pembaruan Sistem",
    updatesDesc: "Periksa versi terbaru dari GitHub.",
    checkUpdates: "Periksa Pembaruan",
    checkUpdatesOk: "Pemeriksaan selesai!",
    checkUpdatesFail: "Gagal memeriksa pembaruan",
    checkUpdatesError: "Terjadi kesalahan saat memeriksa pembaruan",
} as const;

export default settings;
