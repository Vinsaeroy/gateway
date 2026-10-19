const billing = {
    title: "Faturamento e Planos",
    subtitle: "Gerencie sua assinatura e veja o uso da sua API.",
    refresh: "Atualizar",
    currentPlan: {
        title: "Plano Atual",
        loading: "Carregando...",
        activeUntil: "· ativo até {date}",
    },
    usage: {
        daily: "Pedidos hoje",
        monthly: "Pedidos neste mês",
        loading: "Carregando uso...",
    },
    checkout: {
        title: "Pagar {plan}",
        scanHint: "Escaneie o QRIS abaixo com seu app de e-wallet / banco móvel.",
        close: "Fechar",
        priceBreakdown: "Preço do plano {price} + código único",
        waiting: "Aguardando pagamento...",
    },
    choose: {
        title: "Escolha um Plano",
        active: "Plano Ativo",
        default: "Padrão",
        upgrade: "Upgrade",
    },
    toast: {
        paymentSuccess: "Pagamento realizado! O plano {plan} está ativo 🎉",
        paymentFailed: "Pagamento {status}. Tente novamente.",
        enterpriseCustom: "O plano Enterprise é personalizado. Entre em contato com um administrador.",
        checkoutFailed: "Falha ao criar a transação",
        noQr: "O gateway não retornou um QR. Verifique a configuração do KlikQRIS.",
    },
    paymentActivated: {
        title: "Plano {plan} ativado 🎉",
        message: "Pagamento confirmado. O plano {plan} está ativo até {date}.",
    },
    payment: {
        title: "Payment Gateway (KlikQRIS)",
        description:
            "Somente SUPERADMIN. A chave de API é armazenada com segurança no servidor e usada em todas as transações de upgrade de plano.",
        enable: "Ativar pagamentos",
        enableHint: "Se desativado, o botão de upgrade do plano recusará o checkout.",
        baseUrl: "Base URL",
        merchantId: "Merchant ID (id_merchant)",
        apiKey: "API Key (x-api-key)",
        apiKeyPlaceholder: "SUA_CHAVE_API",
        apiKeyPlaceholderSaved: "Salva ({masked}) — preencha para trocar",
        apiKeyHint: "Deixe em branco para manter a chave de API salva atualmente.",
        save: "Salvar Configurações de Pagamento",
        saveOk: "Configurações de pagamento salvas",
        saveError: "Falha ao salvar",
        saveException: "Falha ao salvar as configurações de pagamento",
    },
} as const;

export default billing;
