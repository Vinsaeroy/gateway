const docs = {
    page: {
        metaTitle: "Public API Documentation - {appName}",
        metaDescription: "Complete API reference for {appName} WhatsApp Gateway",
        swaggerLink: "Swagger UI",
        dashboardLink: "Dashboard",
        fallback:
            "# Documentation unavailable\n\nThe documentation file could not be loaded on this server.\n\nIn the meantime, you can use:\n\n- **[Swagger UI](/swagger)** — interactive API reference & endpoint testing\n- **[Dashboard API Docs](/dashboard/api-docs)**\n",
    },
    swagger: {
        loading: "Loading...",
        authTitle: "WA-AKG API Documentation",
        authSubtitle: "Please authenticate to access Swagger UI",
        username: "Username",
        usernamePlaceholder: "Enter username",
        password: "Password",
        passwordPlaceholder: "Enter password",
        invalidCredentials: "Invalid credentials",
        accessButton: "Access Documentation",
        defaultCredentials: "Default credentials:",
        defaultUsernameLabel: "Username:",
        defaultPasswordLabel: "Password:",
        subtitle: "Interactive API documentation with 58+ endpoints",
        logout: "Logout",
        loadingSpec: "Loading documentation…",
        loadFailedTitle: "Failed to load API documentation",
        rawSpecLink: "Open raw specification (/api/docs)",
        errors: {
            notJson: "Response is not JSON (possibly redirected or a server error)",
            invalidSpec: "Invalid OpenAPI specification",
            loadFailed: "Failed to load documentation",
        },
    },
} as const;

export default docs;
