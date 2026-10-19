const sticker = {
    title: "Pembuat Stiker",
    config: {
        title: "Konfigurasi Pembuatan",
        description: "Unggah gambar dan konfigurasikan meta stiker.",
        targetLabel: "Nomor Tujuan",
        fileLabel: "File Gambar",
        uploadHint: "Klik untuk mengunggah",
        uploadHintSuffix: "atau seret dan lepas",
        showAdvanced: "Tampilkan Opsi Lanjutan",
        hideAdvanced: "Sembunyikan Opsi Lanjutan",
        packName: "Nama Pack",
        author: "Penulis",
        quality: "Kualitas (1-100)",
        type: "Tipe",
        typeFull: "Penuh",
        typeCrop: "Potong",
        typeCircle: "Lingkaran",
        send: "Kirim Stiker",
    },
    preview: {
        title: "Pratinjau",
        description: "Begini tampilan gambar Anda.",
        alt: "Pratinjau",
        empty: "Belum ada gambar dipilih",
    },
    toast: {
        fillAllFields: "Harap isi semua kolom",
        sent: "Stiker terkirim!",
        sendFailed: "Gagal mengirim stiker",
        sendError: "Terjadi kesalahan saat mengirim stiker",
    },
} as const;

export default sticker;
