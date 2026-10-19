const docs = {
    page: {
        metaTitle: "Documentação da API Pública - {appName}",
        metaDescription: "Referência completa da API para o WhatsApp Gateway {appName}",
        swaggerLink: "Swagger UI",
        dashboardLink: "Dashboard",
        fallback:
            "# Documentação indisponível\n\nO arquivo de documentação não pôde ser carregado neste servidor.\n\nEnquanto isso, você pode usar:\n\n- **[Swagger UI](/swagger)** — referência interativa da API e testes de endpoints\n- **[Documentação da API no Dashboard](/dashboard/api-docs)**\n",
    },
    swagger: {
        loading: "Carregando...",
        authTitle: "Documentação da API WA-AKG",
        authSubtitle: "Autentique-se para acessar a Swagger UI",
        username: "Usuário",
        usernamePlaceholder: "Digite o usuário",
        password: "Senha",
        passwordPlaceholder: "Digite a senha",
        invalidCredentials: "Credenciais inválidas",
        accessButton: "Acessar Documentação",
        defaultCredentials: "Credenciais padrão:",
        defaultUsernameLabel: "Usuário:",
        defaultPasswordLabel: "Senha:",
        subtitle: "Documentação interativa da API com mais de 58 endpoints",
        logout: "Sair",
        loadingSpec: "Carregando documentação…",
        loadFailedTitle: "Falha ao carregar a documentação da API",
        rawSpecLink: "Abrir especificação bruta (/api/docs)",
        errors: {
            notJson: "A resposta não é JSON (possivelmente redirecionada ou erro do servidor)",
            invalidSpec: "Especificação OpenAPI inválida",
            loadFailed: "Falha ao carregar a documentação",
        },
    },
} as const;

export default docs;
