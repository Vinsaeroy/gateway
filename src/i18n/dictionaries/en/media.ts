const media = {
    title: "Media Manager",
    subtitle: "Manage downloaded media files",
    refresh: "Refresh",
    stats: {
        totalSize: "Total Size",
        totalFiles: "Total Files",
        images: "Images",
        other: "Other",
    },
    searchPlaceholder: "Search by filename, session, user, or sender...",
    filters: {
        all: "All",
        image: "Image",
        video: "Video",
        audio: "Audio",
        document: "Document",
    },
    selectedCount: "{count} selected",
    delete: {
        deleting: "Deleting...",
        button: "Delete",
        confirmTitle: "Delete {count} file(s)?",
        confirmDescription:
            "This action cannot be undone. The selected files will be permanently removed from the server.",
        cancel: "Cancel",
    },
    clear: "Clear",
    sender: {
        me: "Me (Sent)",
        unknown: "Unknown",
    },
    group: {
        userAccount: "User Account",
        sessionOne: "{count} Session",
        sessions: "{count} Sessions",
        mediaCount: "{count} Media",
    },
    empty: {
        filtered: "No media files match your filters",
        none: "No media files downloaded yet",
    },
    selectAll: "Select All",
    deselectAll: "Deselect All",
    toast: {
        loadFailed: "Failed to load media files",
        deleted: "Deleted {count} file(s)",
        deletePartialFailed: "Failed to delete {count} file(s)",
        deleteFailed: "Failed to delete files",
    },
} as const;

export default media;
