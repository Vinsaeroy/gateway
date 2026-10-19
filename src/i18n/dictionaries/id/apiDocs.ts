const apiDocs = {
    title: "Dokumentasi API",
    subtitle: "Referensi lengkap untuk semua {count} endpoint API.",
    loading: "Memuat...",
    openSwagger: "Buka Swagger UI",
    docsAlert: {
        title: "📘 Dokumentasi Proyek Tersedia",
        before: "Untuk penjelasan mendalam mengenai",
        architecture: "Arsitektur Proyek",
        schema: "Skema Database",
        and: "dan",
        routing: "Routing Frontend",
        referTo: "silakan lihat",
        link: "Dokumentasi Proyek Utama",
        fileIn: "di basis kode Anda.",
    },
    quickLinks: {
        title: "Tautan Cepat",
        swaggerUi: "Swagger UI",
        swaggerDesc: "Pengujian API interaktif",
        openApiSpec: "Spesifikasi OpenAPI",
        openApiDesc: "Spesifikasi JSON",
        baseUrl: "URL Dasar",
    },
    filters: {
        search: "Cari",
        searchPlaceholder: "Cari endpoint...",
        category: "Kategori",
        all: "Semua",
    },
    table: {
        method: "Metode",
        endpoint: "Endpoint",
        params: "Parameter",
        description: "Deskripsi",
        category: "Kategori",
        empty: "Tidak ada endpoint yang cocok dengan kriteria Anda",
    },
    stats: {
        total: "Total Endpoint",
        categories: "Kategori",
        post: "Endpoint POST",
        get: "Endpoint GET",
    },
} as const;

export default apiDocs;
