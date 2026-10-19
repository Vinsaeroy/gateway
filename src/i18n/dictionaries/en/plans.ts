const plans = {
    capabilities: {
        autoReply: "Auto Reply",
        broadcast: "Broadcast",
        autoBroadcast: "Auto Broadcast",
        scheduler: "Scheduler / Scheduled Messages",
        webhook: "Webhook & API Events",
        jpm: "JPM SW GC",
        sticker: "Sticker Maker",
    },
    popular: "Popular",
    price: {
        free: "Free",
        custom: "Custom",
        perMonth: "/month",
    },
    limits: {
        unlimitedRequests: "Unlimited requests",
        requestsPerMonth: "{count} requests / month",
    },
    cta: {
        startFree: "Start Free",
        contactUs: "Contact Us",
        choose: "Choose {name}",
    },
    landing: {
        swipeHint: "← swipe to see other plans →",
    },
    editor: {
        title: "Plan & Pricing",
        description:
            "SUPERADMIN only. Set the price, limits, and benefits of each plan. Changes appear immediately on the pricing page and are used for API quota enforcement.",
        legend: {
            unlimited: "= unlimited",
            priceLabel: "price",
            empty: "empty",
            custom: "= custom",
            free: "= free.",
        },
        loading: "Loading plans…",
        mostPopular: "Most Popular",
        fields: {
            name: "Name",
            price: "Price / month (IDR, empty = custom)",
            duration: "Duration (days)",
            dailyLimit: "Limit / day (-1 = unlimited)",
            monthlyLimit: "Limit / month (-1 = unlimited)",
            maxSessions: "Max sessions (-1 = unlimited)",
            capabilities: "Features (on/off) — shown as benefits + access control",
            features: "Additional benefits (free text, one per line)",
        },
        save: "Save Plan & Pricing",
        saveOk: "Plan configuration saved. The pricing page updates immediately.",
        saveError: "Failed to save plan configuration",
        saveException: "Error saving plan configuration",
    },
} as const;

export default plans;
