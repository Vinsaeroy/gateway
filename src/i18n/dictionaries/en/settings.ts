const settings = {
    title: "Settings",
    subtitle: "Global system configuration. Only SuperAdmins can make changes.",
    viewOnlyTitle: "View Only Mode",
    viewOnlyDesc: "Only Superadmins can modify system settings. You can view current settings but cannot make changes.",

    appConfigTitle: "App Configuration",
    appConfigDesc: "Global settings for the application branding and access control.",

    appName: "Application Name",
    appNameHint: "Changes the name in the sidebar and browser title.",
    timezone: "Timezone",
    timezoneHint: "Scheduler will use this timezone.",
    logoUrl: "Logo URL",
    logoUrlHint: "URL for the main dashboard logo.",
    faviconUrl: "Favicon URL",
    faviconUrlHint: "URL for the browser tab icon.",

    enableRegistration: "Enable User Registration",
    enableRegistrationDesc: "Allow new users to sign up for accounts. Turn off to keep the platform private.",

    language: "Language",
    languageHint: "Interface language for the entire system. Refresh to apply everywhere.",
    languageSelect: "Select language",

    saveConfig: "Save Configuration",
    saveSystemOk: "System settings updated. Refresh to see changes.",
    saveSystemFail: "Failed to update system settings",
    saveSystemError: "Error saving system settings",

    updatesTitle: "System Updates",
    updatesDesc: "Check for the latest version from GitHub.",
    checkUpdates: "Check for Updates",
    checkUpdatesOk: "Check complete!",
    checkUpdatesFail: "Failed to check updates",
    checkUpdatesError: "Error checking updates",
} as const;

export default settings;
