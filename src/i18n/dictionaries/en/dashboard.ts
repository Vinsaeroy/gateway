const dashboard = {
    title: "Dashboard",
    subtitle: "Overview of your WhatsApp gateway",
    addSession: "Add Session",
    stats: {
        totalSessions: { title: "Total Sessions", description: "Registered sessions" },
        connected: { title: "Connected", description: "Online & ready" },
        disconnected: { title: "Disconnected", description: "Needs reconnection" },
        autoReply: { title: "Auto-Reply Rules", description: "Active automations" },
    },
    quickActions: {
        title: "Quick Actions",
        newSession: { label: "New Session", description: "Connect a new device" },
        sendMessage: { label: "Send Message", description: "Open chat interface" },
        botSettings: { label: "Bot Settings", description: "Configure chatbot" },
        systemMonitor: { label: "System Monitor", description: "View server metrics" },
    },
    sessions: {
        title: "Sessions",
        viewAll: "View all",
        empty: {
            title: "No sessions yet",
            description: "Connect your first WhatsApp device to get started",
            cta: "Create Session",
        },
    },
} as const;

export default dashboard;
