const systemMonitor = {
    accessDenied: {
        title: "Acesso Negado",
        description: "Apenas superadministradores podem ver os recursos do sistema.",
    },
    title: "Monitor do Sistema",
    live: "Ao vivo",
    subtitle: "Métricas em tempo real do SO e do processo Node.",
    uptime: "Tempo ativo: {value}",
    cards: {
        cpuLoad: "Carga da CPU",
        systemRam: "RAM do Sistema",
        nodeProcess: "Processo Node.js",
        networkTraffic: "Tráfego de Rede",
        coresAverage: "Média de {count} Núcleos",
    },
    node: {
        uptimeHeap: "Tempo ativo: {uptime} — Heap: {heap}",
    },
    network: {
        rx: "↓ RX",
        tx: "↑ TX",
        iface: "Iface: {iface} (Ativo)",
        unknown: "Desconhecido",
    },
    cores: {
        title: "Detalhamento dos Núcleos da CPU",
        description: "Porcentagem de carga de cada núcleo lógico.",
        core: "Núcleo {index}",
    },
    storage: {
        title: "Volumes de Armazenamento",
        description: "Sistemas de arquivos montados e uso atual de espaço.",
        empty: "Nenhuma informação de disco disponível",
    },
} as const;

export default systemMonitor;
