const media = {
    title: "Gerenciador de Mídia",
    subtitle: "Gerencie os arquivos de mídia baixados",
    refresh: "Atualizar",
    stats: {
        totalSize: "Tamanho Total",
        totalFiles: "Total de Arquivos",
        images: "Imagens",
        other: "Outros",
    },
    searchPlaceholder: "Buscar por nome do arquivo, sessão, usuário ou remetente...",
    filters: {
        all: "Todos",
        image: "Imagem",
        video: "Vídeo",
        audio: "Áudio",
        document: "Documento",
    },
    selectedCount: "{count} selecionado(s)",
    delete: {
        deleting: "Excluindo...",
        button: "Excluir",
        confirmTitle: "Excluir {count} arquivo(s)?",
        confirmDescription:
            "Esta ação não pode ser desfeita. Os arquivos selecionados serão removidos permanentemente do servidor.",
        cancel: "Cancelar",
    },
    clear: "Limpar",
    sender: {
        me: "Eu (Enviado)",
        unknown: "Desconhecido",
    },
    group: {
        userAccount: "Conta do Usuário",
        sessionOne: "{count} Sessão",
        sessions: "{count} Sessões",
        mediaCount: "{count} Mídia",
    },
    empty: {
        filtered: "Nenhum arquivo de mídia corresponde aos filtros",
        none: "Nenhum arquivo de mídia baixado ainda",
    },
    selectAll: "Selecionar Tudo",
    deselectAll: "Desmarcar Tudo",
    toast: {
        loadFailed: "Falha ao carregar os arquivos de mídia",
        deleted: "{count} arquivo(s) excluído(s)",
        deletePartialFailed: "Falha ao excluir {count} arquivo(s)",
        deleteFailed: "Falha ao excluir os arquivos",
    },
} as const;

export default media;
