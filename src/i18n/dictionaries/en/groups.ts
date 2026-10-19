const groups = {
    page: {
        title: "Groups",
        subtitleActive: "Manage groups for active session.",
        subtitleNoSession: "Select a session from the top bar.",
    },
    refresh: "Refresh",
    create: "Create",
    searchPlaceholder: "Search groups...",
    createDialog: {
        title: "Create New Group",
        subjectLabel: "Group Subject",
        subjectPlaceholder: "My New Group",
        cancel: "Cancel",
        confirm: "Create",
    },
    loading: "Loading groups...",
    empty: {
        matched: "No groups found matching criteria.",
        noSession: "No session selected.",
    },
    participants: "Participants: {count}",
    toast: {
        fetchFailed: "Failed to fetch groups",
        created: "Group created",
        createFailed: "Failed to create group",
    },
} as const;

export default groups;
