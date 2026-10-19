const systemMonitor = {
    accessDenied: {
        title: "Access Denied",
        description: "Only Super Admins can view system resources.",
    },
    title: "System Monitor",
    live: "Live",
    subtitle: "Real-time OS and Node process metrics.",
    uptime: "Uptime: {value}",
    cards: {
        cpuLoad: "CPU Load",
        systemRam: "System RAM",
        nodeProcess: "Node.js Process",
        networkTraffic: "Network Traffic",
        coresAverage: "{count} Cores Average",
    },
    node: {
        uptimeHeap: "Uptime: {uptime} — Heap: {heap}",
    },
    network: {
        rx: "↓ RX",
        tx: "↑ TX",
        iface: "Iface: {iface} (Active)",
        unknown: "Unknown",
    },
    cores: {
        title: "CPU Cores Breakdown",
        description: "Individual load percentage for each logical core.",
        core: "Core {index}",
    },
    storage: {
        title: "Storage Volumes",
        description: "Mounted filesystems and current space usage.",
        empty: "No disk information available",
    },
} as const;

export default systemMonitor;
