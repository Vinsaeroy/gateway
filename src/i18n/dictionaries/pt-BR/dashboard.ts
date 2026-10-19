const dashboard = {
    title: "Painel",
    subtitle: "Visão geral do seu gateway do WhatsApp",
    addSession: "Adicionar Sessão",
    stats: {
        totalSessions: { title: "Total de Sessões", description: "Sessões registradas" },
        connected: { title: "Conectadas", description: "Online e prontas" },
        disconnected: { title: "Desconectadas", description: "Precisa reconectar" },
        autoReply: { title: "Regras de Auto-Resposta", description: "Automações ativas" },
    },
    quickActions: {
        title: "Ações Rápidas",
        newSession: { label: "Nova Sessão", description: "Conectar um novo dispositivo" },
        sendMessage: { label: "Enviar Mensagem", description: "Abrir interface de chat" },
        botSettings: { label: "Configurações do Bot", description: "Configurar chatbot" },
        systemMonitor: { label: "Monitor do Sistema", description: "Ver métricas do servidor" },
    },
    sessions: {
        title: "Sessões",
        viewAll: "Ver todas",
        empty: {
            title: "Ainda não há sessões",
            description: "Conecte seu primeiro dispositivo do WhatsApp para começar",
            cta: "Criar Sessão",
        },
    },
} as const;

export default dashboard;
