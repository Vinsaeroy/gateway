const users = {
    title: "User Management",
    subtitle: "Manage users and roles",
    loading: "Loading...",
    addUser: "Add User",
    form: {
        editTitle: "Edit User",
        newTitle: "New User",
        name: "Name",
        email: "Email",
        password: "Password",
        newPassword: "New Password (leave blank to keep)",
        role: "Role",
        plan: "Plan",
        planHint:
            "Change this user's plan. The active period uses the plan's default duration (FREE = unlimited).",
        cancel: "Cancel",
        update: "Update",
        create: "Create",
    },
    roles: {
        SUPERADMIN: "Super Admin",
        OWNER: "Owner",
        STAFF: "Staff",
    },
    plans: {
        FREE: "Free",
        STANDARD: "Standard",
        PRO: "Pro",
        ENTERPRISE: "Enterprise",
    },
    card: {
        fallbackName: "User",
        planLabel: "Plan: {plan}",
        planUntil: "· until {date}",
        sessions: "{count} Sessions",
        joined: "Joined {date}",
        edit: "Edit",
        delete: "Delete",
    },
    dialog: {
        title: "Are you absolutely sure?",
        description:
            "This action cannot be undone. This will permanently delete the user request and remove their data from our servers.",
        cancel: "Cancel",
        continue: "Continue",
    },
    toast: {
        unauthorized: "Unauthorized. Only Super Admin can view users.",
        updated: "User updated",
        created: "User created",
        operationFailed: "Operation failed",
        deleted: "User deleted",
        deleteRejected: "Failed to delete",
        deleteFailed: "Failed to delete user",
    },
} as const;

export default users;
