const apiDocs = {
    title: "API Documentation",
    subtitle: "Complete reference for all {count} API endpoints.",
    loading: "Loading...",
    openSwagger: "Open Swagger UI",
    docsAlert: {
        title: "📘 Project Documentation Available",
        before: "For a deep dive into the",
        architecture: "Project Architecture",
        schema: "Database Schema",
        and: "and",
        routing: "Frontend Routing",
        referTo: "please refer to the",
        link: "Master Project Documentation",
        fileIn: "file in your codebase.",
    },
    quickLinks: {
        title: "Quick Links",
        swaggerUi: "Swagger UI",
        swaggerDesc: "Interactive API testing",
        openApiSpec: "OpenAPI Spec",
        openApiDesc: "JSON specification",
        baseUrl: "Base URL",
    },
    filters: {
        search: "Search",
        searchPlaceholder: "Search endpoints...",
        category: "Category",
        all: "All",
    },
    table: {
        method: "Method",
        endpoint: "Endpoint",
        params: "Params",
        description: "Description",
        category: "Category",
        empty: "No endpoints found matching your criteria",
    },
    stats: {
        total: "Total Endpoints",
        categories: "Categories",
        post: "POST Endpoints",
        get: "GET Endpoints",
    },
} as const;

export default apiDocs;
