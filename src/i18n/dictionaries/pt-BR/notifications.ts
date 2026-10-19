const notifications = {
    page: {
        title: "Gerenciador de notificações",
    },
    compose: {
        title: "Compor notificação",
        description: "Envie alertas para usuários ou transmissões para todo o sistema.",
    },
    form: {
        titleLabel: "Título",
        titlePlaceholder: "ex.: Manutenção do sistema",
        messageLabel: "Mensagem",
        messagePlaceholder: "Mensagem detalhada...",
        typeLabel: "Tipo",
        types: {
            info: "Informação",
            warning: "Aviso",
            success: "Sucesso",
            system: "Sistema",
        },
        actionLinkLabel: "Link de ação (opcional)",
        broadcastLabel: "Transmitir para TODOS os usuários",
        targetUserLabel: "ID do usuário de destino",
        targetUserPlaceholder: "ID do usuário (cuid)",
    },
    send: "Enviar notificação",
    preview: {
        title: "Prévia",
        defaultTitle: "Título da notificação",
        defaultMessage: "O conteúdo da notificação aparecerá aqui.",
        justNow: "Agora mesmo",
    },
    toast: {
        titleMessageRequired: "Título e mensagem são obrigatórios",
        targetRequired: "O ID do usuário de destino é obrigatório para envio não broadcast",
        sent: "Notificação enviada com sucesso! (Contagem: {count})",
        sendFailed: "Falha ao enviar notificação",
        sendError: "Erro ao enviar notificação",
    },
} as const;

export default notifications;
