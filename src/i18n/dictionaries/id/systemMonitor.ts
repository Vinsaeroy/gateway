const systemMonitor = {
    accessDenied: {
        title: "Akses Ditolak",
        description: "Hanya Super Admin yang dapat melihat sumber daya sistem.",
    },
    title: "Monitor Sistem",
    live: "Langsung",
    subtitle: "Metrik OS dan proses Node secara real-time.",
    uptime: "Uptime: {value}",
    cards: {
        cpuLoad: "Beban CPU",
        systemRam: "RAM Sistem",
        nodeProcess: "Proses Node.js",
        networkTraffic: "Lalu Lintas Jaringan",
        coresAverage: "Rata-rata {count} Core",
    },
    node: {
        uptimeHeap: "Uptime: {uptime} — Heap: {heap}",
    },
    network: {
        rx: "↓ RX",
        tx: "↑ TX",
        iface: "Iface: {iface} (Aktif)",
        unknown: "Tidak diketahui",
    },
    cores: {
        title: "Rincian Core CPU",
        description: "Persentase beban masing-masing core logis.",
        core: "Core {index}",
    },
    storage: {
        title: "Volume Penyimpanan",
        description: "Filesystem terpasang dan penggunaan ruang saat ini.",
        empty: "Informasi disk tidak tersedia",
    },
} as const;

export default systemMonitor;
