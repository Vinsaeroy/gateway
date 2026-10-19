const sticker = {
    title: "Sticker Maker",
    config: {
        title: "Create Configuration",
        description: "Upload an image and configure sticker meta.",
        targetLabel: "Target Number",
        fileLabel: "Image File",
        uploadHint: "Click to upload",
        uploadHintSuffix: "or drag and drop",
        showAdvanced: "Show Advanced Options",
        hideAdvanced: "Hide Advanced Options",
        packName: "Pack Name",
        author: "Author",
        quality: "Quality (1-100)",
        type: "Type",
        typeFull: "Full",
        typeCrop: "Crop",
        typeCircle: "Circle",
        send: "Send Sticker",
    },
    preview: {
        title: "Preview",
        description: "This is how your image looks.",
        alt: "Preview",
        empty: "No image selected",
    },
    toast: {
        fillAllFields: "Please fill all fields",
        sent: "Sticker sent!",
        sendFailed: "Failed to send sticker",
        sendError: "Error sending sticker",
    },
} as const;

export default sticker;
