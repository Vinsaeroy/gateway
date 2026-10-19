const apiDocs = {
    title: "Documentação da API",
    subtitle: "Referência completa de todos os {count} endpoints da API.",
    loading: "Carregando...",
    openSwagger: "Abrir Swagger UI",
    docsAlert: {
        title: "📘 Documentação do Projeto Disponível",
        before: "Para um aprofundamento na",
        architecture: "Arquitetura do Projeto",
        schema: "Esquema do Banco de Dados",
        and: "e",
        routing: "Roteamento do Frontend",
        referTo: "consulte o",
        link: "Documento Principal do Projeto",
        fileIn: "no seu código-fonte.",
    },
    quickLinks: {
        title: "Links Rápidos",
        swaggerUi: "Swagger UI",
        swaggerDesc: "Testes interativos da API",
        openApiSpec: "Especificação OpenAPI",
        openApiDesc: "Especificação JSON",
        baseUrl: "URL Base",
    },
    filters: {
        search: "Buscar",
        searchPlaceholder: "Buscar endpoints...",
        category: "Categoria",
        all: "Todos",
    },
    table: {
        method: "Método",
        endpoint: "Endpoint",
        params: "Parâmetros",
        description: "Descrição",
        category: "Categoria",
        empty: "Nenhum endpoint encontrado com os critérios informados",
    },
    stats: {
        total: "Total de Endpoints",
        categories: "Categorias",
        post: "Endpoints POST",
        get: "Endpoints GET",
    },
} as const;

export default apiDocs;
