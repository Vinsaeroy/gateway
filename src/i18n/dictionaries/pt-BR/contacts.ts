const contacts = {
    page: {
        title: "Contatos",
        subtitle: "Gerencie e visualize seus contatos salvos.",
    },
    list: {
        title: "Lista de contatos",
        total: "Total: {total} contatos encontrados",
    },
    perPagePlaceholder: "Por página",
    perPageOption: "{limit} / página",
    showAll: "Mostrar todos",
    searchPlaceholder: "Buscar contatos...",
    table: {
        image: "Imagem",
        name: "Nome / Pushname",
        jid: "JID (ID)",
        phone: "Telefone / Alt",
    },
    loading: "Carregando...",
    empty: "Nenhum contato encontrado.",
    unknown: "Desconhecido",
    pagination: {
        previous: "Anterior",
        next: "Próxima",
        pageOf: "Página {page} de {totalPages}",
    },
} as const;

export default contacts;
