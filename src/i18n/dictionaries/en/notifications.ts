const notifications = {
    page: {
        title: "Notification Manager",
    },
    compose: {
        title: "Compose Notification",
        description: "Send alerts to users or system-wide broadcasts.",
    },
    form: {
        titleLabel: "Title",
        titlePlaceholder: "e.g. System Maintenance",
        messageLabel: "Message",
        messagePlaceholder: "Detailed message...",
        typeLabel: "Type",
        types: {
            info: "Info",
            warning: "Warning",
            success: "Success",
            system: "System",
        },
        actionLinkLabel: "Action Link (Optional)",
        broadcastLabel: "Broadcast to ALL Users",
        targetUserLabel: "Target User ID",
        targetUserPlaceholder: "User ID (cuid)",
    },
    send: "Send Notification",
    preview: {
        title: "Preview",
        defaultTitle: "Notification Title",
        defaultMessage: "Notification message content will appear here.",
        justNow: "Just now",
    },
    toast: {
        titleMessageRequired: "Title and Message are required",
        targetRequired: "Target User ID is required for non-broadcast",
        sent: "Notification sent successfully! (Count: {count})",
        sendFailed: "Failed to send notification",
        sendError: "Error sending notification",
    },
} as const;

export default notifications;
