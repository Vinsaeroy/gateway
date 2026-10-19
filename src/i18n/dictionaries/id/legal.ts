const legal = {
    privacy: {
        backToHome: "Kembali ke Beranda",
        title: "Kebijakan Privasi",
        metaDescription: "Kebijakan Privasi dan Penanganan Data WA-AKG.",
        effectiveDate: "Berlaku sejak: {date}",
        intro:
            "Di WA-AKG, kami percaya bahwa data kamu adalah milikmu. Kebijakan Privasi ini menjelaskan batasan ketat mengenai bagaimana informasi ditangani saat menggunakan WhatsApp Gateway open-source, self-hosted kami.",
        s1: {
            title: "1. Arsitektur Tanpa Pelacakan",
            bodyBefore: "Karena WA-AKG dirancang ",
            bodyStrong: "self-hosted",
            bodyAfter:
                ", semua pemrosesan data inti berlangsung secara eksklusif di perangkat keras tempat kamu men-deploy aplikasi.",
            noTelemetryLabel: "Tanpa Telemetri Terpusat:",
            noTelemetryText:
                "Para pembuat WA-AKG tidak menerima telemetri, analitik, atau laporan penggunaan tentang interaksi WhatsApp kamu.",
            ownershipLabel: "Kepemilikan Data Absolut:",
            ownershipText:
                "Kontak, pesan, jadwal, dan auto-reply kamu tetap berada di database milikmu sendiri. Kami tidak bisa dan tidak akan mengaksesnya.",
        },
        s2: {
            title: "2. Data yang Kami Proses Secara Lokal",
            body: "Saat kamu men-deploy gateway, aplikasi yang berjalan di server kamu berinteraksi dengan:",
            credentialsLabel: "Kredensial Autentikasi:",
            credentialsText:
                "Password yang kamu buat untuk dashboard di-hash dengan aman menggunakan bcrypt sebelum disimpan di database lokal kamu.",
            sessionsLabel: "Sesi WhatsApp:",
            sessionsText:
                "WA-AKG bertindak sebagai jembatan ke WhatsApp Web. Token sesi (keys) yang diperlukan untuk mempertahankan koneksi ini disimpan secara lokal di server kamu.",
            logsLabel: "Log Komunikasi:",
            logsText:
                "Pesan yang dikirim dan diterima melalui gateway dicatat di database lokal kamu untuk menyediakan data historis dan fungsionalitas webhook.",
        },
        s3: {
            title: "3. Melindungi Informasi Kamu",
            body:
                "Meskipun WA-AKG dibangun dengan praktik keamanan modern, keamanan akhir data kamu sangat bergantung pada lingkungan hosting kamu. Kami sangat menyarankan:",
            proxyBefore:
                "Men-deploy aplikasi di belakang reverse proxy dengan ",
            proxyStrong: "enkripsi SSL/TLS",
            proxyAfter: " (HTTPS) yang diterapkan.",
            firewall:
                "Mengamankan server host dengan firewall dan autentikasi kunci SSH.",
            updates:
                "Selalu memperbarui sistem operasi dan lingkungan Node.js yang mendasarinya.",
        },
        s4: {
            title: "4. Integrasi Pihak Ketiga",
            bodyBefore: "WA-AKG memakai pustaka ",
            bodyAfter:
                " untuk berkomunikasi langsung dengan server WhatsApp. Dengan menggunakan gateway ini, server kamu akan membuat koneksi web-socket langsung ke WhatsApp. Harap diperhatikan bahwa penggunaan WhatsApp kamu tetap tunduk pada Kebijakan Privasi Meta.",
        },
        needDetails: "Butuh Detail Lebih Lanjut?",
        needDetailsBefore:
            "Jika kamu punya pertanyaan spesifik tentang penanganan data atau ingin mengaudit kodenya, silakan kunjungi ",
        needDetailsLink: "Repositori GitHub",
        needDetailsAfter: " kami.",
    },
    terms: {
        backToHome: "Kembali ke Beranda",
        title: "Syarat Layanan",
        metaDescription: "Syarat Layanan dan Pedoman Penggunaan WA-AKG.",
        lastUpdated: "Terakhir diperbarui: {date}",
        intro:
            "Selamat datang di WA-AKG. Dengan mengakses atau menggunakan platform WhatsApp Gateway kami, kamu setuju untuk terikat oleh Syarat ini. Jika kamu tidak setuju, mohon jangan gunakan layanan ini.",
        s1: {
            title: "1. Keamanan Data & Tanggung Jawab",
            body:
                "Keamanan merupakan inti dari layanan kami. Sebagai platform self-hosted, WA-AKG memastikan data kamu tetap sepenuhnya di dalam infrastruktur milikmu sendiri.",
            yoursLabel: "Data Kamu Milikmu:",
            yoursText:
                "Kami tidak melacak, menyadap, atau menjual pesan WhatsApp, daftar kontak, atau data sesi kamu. Informasi kamu aman dan tidak disalahgunakan.",
            safeLabel: "Penggunaan yang Aman:",
            safeText:
                "Kamu bertanggung jawab memastikan perangkat keras dan lingkungan server kamu teramankan dengan baik.",
            authLabel: "Autentikasi:",
            authText:
                "Kamu harus menjaga kerahasiaan kredensial akun kamu. Jangan bagikan detail login kamu kepada pihak yang tidak berwenang.",
        },
        s2: {
            title: "2. Kebijakan Penggunaan yang Wajar",
            body:
                "Saat memanfaatkan API, auto-reply, dan kemampuan broadcast WA-AKG, kamu setuju untuk mematuhi Syarat Layanan resmi dan kebijakan Anti-Spam WhatsApp. Kamu setuju untuk tidak:",
            spam: 'Mengirim pesan "spam" yang tidak diminta atau kampanye promosi massal ke pengguna yang belum secara eksplisit memberikan izin.',
            malware:
                "Memakai platform untuk menyebarkan perangkat lunak berbahaya, tautan phishing, atau konten ilegal.",
            overload:
                "Mencoba mereverse-engineer API inti atau membebani layanan dengan permintaan berlebihan.",
        },
        s3: {
            title: "3. Integritas Akun",
            body:
                "WA-AKG menyediakan alat untuk mengelola banyak sesi WhatsApp. Sangat penting untuk memantau perangkat aktif kamu. Jika kamu mencurigai akses tidak sah ke dashboard gateway kamu, segera ganti password dan cabut semua sesi WhatsApp yang terhubung dari perangkat fisikmu.",
        },
        s4: {
            title: "4. Penafian dan Keterbatasan",
            body:
                'WA-AKG disediakan "sebagaimana adanya" tanpa jaminan apa pun. Kami memakai pustaka pihak ketiga (seperti Baileys) untuk terhubung ke protokol web WhatsApp. Perubahan pada sistem internal WhatsApp dapat sesekali mengganggu layanan. Kami tidak bertanggung jawab atas penangguhan atau pemblokiran akun apa pun yang diberlakukan WhatsApp akibat penggunaan kamu.',
        },
        questions: "Punya pertanyaan tentang syarat ini?",
        questionsBefore: "Silakan baca ",
        questionsLink: "Dokumentasi",
        questionsAfter:
            " kami atau hubungi para pengelola proyek untuk klarifikasi lebih lanjut.",
    },
} as const;

export default legal;
