const profile = {
    title: "WhatsApp Profile",
    subtitle: "Manage your WhatsApp account presence directly from the dashboard.",
    noSession: {
        title: "No Session Selected",
        description: "Please select an active WhatsApp session from the sidebar to manage its profile.",
    },
    picture: {
        title: "Profile Picture",
        change: "Change Photo",
        remove: "Remove Photo",
    },
    info: {
        title: "Profile Info",
        description: "Update your WhatsApp identity and about section.",
        nameLabel: "WhatsApp Name (Pushname)",
        namePlaceholder: "Enter profile name",
        save: "Save",
        nameHint: "This is the name visible to your contacts.",
        aboutLabel: "About",
        aboutPlaceholder: "Available",
        charCount: "{count}/139 characters",
        updateAbout: "Update About",
        aboutHint: "Update your WhatsApp 'About' section.",
    },
    toasts: {
        loadFailed: "Failed to load profile",
        loadError: "An error occurred while fetching profile",
        nameUpdated: "Profile name updated successfully",
        nameUpdateFailed: "Failed to update profile name",
        nameUpdateError: "Error updating profile name",
        statusUpdated: "About/Status updated successfully",
        statusUpdateFailed: "Failed to update status",
        statusUpdateError: "Error updating status",
        pictureUpdated: "Profile picture updated",
        pictureUploadFailed: "Failed to upload picture",
        pictureUploadError: "Error uploading picture",
        pictureRemoved: "Profile picture removed",
        pictureRemoveFailed: "Failed to remove picture",
        pictureRemoveError: "Error removing picture",
    },
} as const;

export default profile;
