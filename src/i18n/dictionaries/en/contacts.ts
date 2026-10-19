const contacts = {
    page: {
        title: "Contacts",
        subtitle: "Manage and view your saved contacts.",
    },
    list: {
        title: "Contact List",
        total: "Total: {total} contacts found",
    },
    perPagePlaceholder: "Per page",
    perPageOption: "{limit} / page",
    showAll: "Show All",
    searchPlaceholder: "Search contacts...",
    table: {
        image: "Image",
        name: "Name / Pushname",
        jid: "JID (ID)",
        phone: "Phone / Alt",
    },
    loading: "Loading...",
    empty: "No contacts found.",
    unknown: "Unknown",
    pagination: {
        previous: "Previous",
        next: "Next",
        pageOf: "Page {page} of {totalPages}",
    },
} as const;

export default contacts;
