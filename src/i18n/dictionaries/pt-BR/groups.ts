const groups = {
    page: {
        title: "Grupos",
        subtitleActive: "Gerencie os grupos da sessão ativa.",
        subtitleNoSession: "Selecione uma sessão na barra superior.",
    },
    refresh: "Atualizar",
    create: "Criar",
    searchPlaceholder: "Buscar grupos...",
    createDialog: {
        title: "Criar novo grupo",
        subjectLabel: "Assunto do grupo",
        subjectPlaceholder: "Meu novo grupo",
        cancel: "Cancelar",
        confirm: "Criar",
    },
    loading: "Carregando grupos...",
    empty: {
        matched: "Nenhum grupo encontrado que corresponda aos critérios.",
        noSession: "Nenhuma sessão selecionada.",
    },
    participants: "Participantes: {count}",
    toast: {
        fetchFailed: "Falha ao buscar grupos",
        created: "Grupo criado",
        createFailed: "Falha ao criar grupo",
    },
} as const;

export default groups;
