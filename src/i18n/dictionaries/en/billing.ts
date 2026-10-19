const billing = {
    title: "Billing & Plan",
    subtitle: "Manage your subscription and view your API usage.",
    refresh: "Refresh",
    currentPlan: {
        title: "Current Plan",
        loading: "Loading...",
        activeUntil: "· active until {date}",
    },
    usage: {
        daily: "Requests today",
        monthly: "Requests this month",
        loading: "Loading usage...",
    },
    checkout: {
        title: "Pay {plan}",
        scanHint: "Scan the QRIS below with your e-wallet / mobile banking app.",
        close: "Close",
        priceBreakdown: "Plan price {price} + unique code",
        waiting: "Waiting for payment...",
    },
    choose: {
        title: "Choose a Plan",
        active: "Active Plan",
        default: "Default",
        upgrade: "Upgrade",
    },
    toast: {
        paymentSuccess: "Payment successful! The {plan} plan is now active 🎉",
        paymentFailed: "Payment {status}. Please try again.",
        enterpriseCustom: "The Enterprise plan is custom. Please contact an admin.",
        checkoutFailed: "Failed to create transaction",
        noQr: "The gateway did not return a QR code. Check the KlikQRIS configuration.",
    },
    paymentActivated: {
        title: "Plan {plan} activated 🎉",
        message: "Payment confirmed. The {plan} plan is active until {date}.",
    },
    payment: {
        title: "Payment Gateway (KlikQRIS)",
        description:
            "SUPERADMIN only. The API key is stored securely on the server and used for all plan upgrade transactions.",
        enable: "Enable payments",
        enableHint: "If disabled, the plan upgrade button will reject checkout.",
        baseUrl: "Base URL",
        merchantId: "Merchant ID (id_merchant)",
        apiKey: "API Key (x-api-key)",
        apiKeyPlaceholder: "YOUR_API_KEY",
        apiKeyPlaceholderSaved: "Saved ({masked}) — fill in to replace",
        apiKeyHint: "Leave empty to keep the currently saved API key.",
        save: "Save Payment Settings",
        saveOk: "Payment settings saved",
        saveError: "Failed to save",
        saveException: "Failed to save payment settings",
    },
} as const;

export default billing;
