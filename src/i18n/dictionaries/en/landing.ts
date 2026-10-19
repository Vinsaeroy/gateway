const landing = {
    meta: {
        title: "RifalosID | Premium WhatsApp Gateway",
        description:
            "A powerful, self-hosted dashboard to manage your WhatsApp sessions, schedules, and auto-replies. Built for modern businesses.",
        ogDescription:
            "Self-hosted WhatsApp Gateway with Multi-device support, Auto-replies, and API integration.",
    },
    nav: {
        features: "Features",
        pricing: "Pricing",
        docs: "API & Docs",
        github: "GitHub",
        signIn: "Sign In",
        dashboard: "Dashboard",
        toggleMenu: "Toggle menu",
    },
    hero: {
        release: "Release {version} is now live",
        titleLine1: "WhatsApp Gateway",
        titleLine2: "for modern businesses.",
        subtitle:
            "Manage multiple WhatsApp sessions, smart auto-replies, scheduled broadcasts, and REST API integration — all in one fast, elegant dashboard.",
        ctaPrimary: "Get Started",
        ctaSecondary: "View Documentation",
    },
    mock: {
        activeSessions: "Active Sessions",
        todayMessages: "Messages Today",
        contacts: "Contacts",
    },
    stats: {
        uptime: "Uptime",
        apiLatency: "API Latency",
        deviceSupport: "Device Support",
        automation: "Automation",
    },
    features: {
        badge: "Featured Capabilities",
        heading: "Designed to scale",
        subheading: "Full-featured, packed into a beautiful and high-performance interface.",
        items: {
            apiWebhooks: {
                title: "Instant API & Webhooks",
                description:
                    "Send messages, media, and handle incoming events in real time through a reliable REST API.",
            },
            autoReply: {
                title: "Smart Auto Reply",
                description:
                    "Build keyword-based automatic replies to serve customers 24/7 without getting tired.",
            },
            scheduler: {
                title: "Precise Scheduler",
                description:
                    "Schedule messages to be sent at a specific time. Perfect for campaigns and reminders.",
            },
            security: {
                title: "Secure & Private",
                description:
                    "A self-hosted architecture keeps your data and sessions fully under your control.",
            },
            developer: {
                title: "Developer Experience",
                description:
                    "Built with TypeScript, complete Swagger documentation, and strict typing.",
            },
            multiSession: {
                title: "Multi-Session",
                description:
                    "Connect, monitor, and control multiple WhatsApp numbers from one unified dashboard.",
            },
        },
    },
    pricingSection: {
        badge: "Pricing",
        heading: "Simple & Transparent",
        subheading:
            "Start for free, upgrade anytime. Fast payments via QRIS (KlikQRIS).",
        footnote: "All plans include REST API access. Limits are counted per API request.",
    },
    tech: {
        heading: "Built with industry-standard technology",
    },
    cta: {
        heading: "Ready to automate your business WhatsApp?",
        subheading: "Create a free account in minutes. No credit card, ready to use.",
        button: "Start Free Now",
    },
    footer: {
        privacy: "Privacy",
        terms: "Terms",
        docs: "API & Docs",
        rights: "All rights reserved.",
    },
} as const;

export default landing;
