const users = {
    title: "Manajemen Pengguna",
    subtitle: "Kelola pengguna dan peran",
    loading: "Memuat...",
    addUser: "Tambah Pengguna",
    form: {
        editTitle: "Ubah Pengguna",
        newTitle: "Pengguna Baru",
        name: "Nama",
        email: "Email",
        password: "Kata Sandi",
        newPassword: "Kata Sandi Baru (kosongkan untuk mempertahankan)",
        role: "Peran",
        plan: "Paket",
        planHint:
            "Ubah paket pengguna ini. Masa aktif memakai durasi default paket (FREE = tanpa batas).",
        cancel: "Batal",
        update: "Simpan",
        create: "Buat",
    },
    roles: {
        SUPERADMIN: "Super Admin",
        OWNER: "Owner",
        STAFF: "Staff",
    },
    plans: {
        FREE: "Free",
        STANDARD: "Standard",
        PRO: "Pro",
        ENTERPRISE: "Enterprise",
    },
    card: {
        fallbackName: "Pengguna",
        planLabel: "Paket: {plan}",
        planUntil: "· s.d. {date}",
        sessions: "{count} Sesi",
        joined: "Bergabung {date}",
        edit: "Ubah",
        delete: "Hapus",
    },
    dialog: {
        title: "Apakah Anda yakin?",
        description:
            "Tindakan ini tidak dapat dibatalkan. Pengguna akan dihapus permanen dan datanya dihapus dari server kami.",
        cancel: "Batal",
        continue: "Lanjutkan",
    },
    toast: {
        unauthorized: "Tidak berwenang. Hanya Super Admin yang dapat melihat pengguna.",
        updated: "Pengguna diperbarui",
        created: "Pengguna dibuat",
        operationFailed: "Operasi gagal",
        deleted: "Pengguna dihapus",
        deleteRejected: "Gagal menghapus",
        deleteFailed: "Gagal menghapus pengguna",
    },
} as const;

export default users;
