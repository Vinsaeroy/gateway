const plans = {
    capabilities: {
        autoReply: "Auto Resposta",
        broadcast: "Broadcast",
        autoBroadcast: "Auto Broadcast",
        scheduler: "Agendador / Mensagens Agendadas",
        webhook: "Webhook & API Events",
        jpm: "JPM SW GC",
        sticker: "Criador de Adesivos",
    },
    popular: "Popular",
    price: {
        free: "Grátis",
        custom: "Sob medida",
        perMonth: "/mês",
    },
    limits: {
        unlimitedRequests: "Pedidos ilimitados",
        requestsPerMonth: "{count} pedidos / mês",
    },
    cta: {
        startFree: "Começar Grátis",
        contactUs: "Fale Conosco",
        choose: "Escolher {name}",
    },
    landing: {
        swipeHint: "← deslize para ver outros planos →",
    },
    editor: {
        title: "Planos e Preços",
        description:
            "Somente SUPERADMIN. Defina o preço, os limites e os benefícios de cada plano. As alterações aparecem imediatamente na página de preços e são usadas na limitação da cota da API.",
        legend: {
            unlimited: "= ilimitado",
            priceLabel: "preço",
            empty: "vazio",
            custom: "= sob medida",
            free: "= grátis.",
        },
        loading: "Carregando planos…",
        mostPopular: "Mais Popular",
        fields: {
            name: "Nome",
            price: "Preço / mês (IDR, vazio = sob medida)",
            duration: "Duração (dias)",
            dailyLimit: "Limite / dia (-1 = ilimitado)",
            monthlyLimit: "Limite / mês (-1 = ilimitado)",
            maxSessions: "Máx. de sessões (-1 = ilimitado)",
            capabilities: "Recursos (on/off) — viram benefícios + controle de acesso",
            features: "Benefícios adicionais (texto livre, um por linha)",
        },
        save: "Salvar Planos e Preços",
        saveOk: "Configuração dos planos salva. A página de preços é atualizada imediatamente.",
        saveError: "Falha ao salvar a configuração dos planos",
        saveException: "Erro ao salvar a configuração dos planos",
    },
} as const;

export default plans;
