import {
    jidNormalizedUser,
    getContentType,
    downloadContentFromMessage,
    getDevice
} from "baileys";

const toBuffer = async stream => {
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
};

const pt = (msg = {}, type = "") =>
    msg?.conversation ||
    msg?.[type]?.text ||
    msg?.[type]?.caption ||
    msg?.[type]?.contentText ||
    msg?.[type]?.selectedDisplayText ||
    "";

export function serialize(m) {
    const msg = m.messages?.[0];
    if (!msg) return m;

    m.chat = msg.key?.remoteJid;
    m.sender = jidNormalizedUser(
        msg.key?.participant || msg.key?.participantAlt || m.chat
    );
    m.Pn = m.sender
    ? m.sender.replace(/[^0-9]/g, "")
    : "";
    m.isGroup = (m.chat || "").endsWith("@g.us");
    m.mtype = getContentType(msg.message);
    m.fromMe = !!msg.key?.fromMe;
    m.id = msg.key?.id || "Not Found";
    m.isBaileys =
        !!m.id &&
        (m.id.startsWith("3EB0") ||
            m.id.startsWith("B1E") ||
            m.id.startsWith("BAE") ||
            m.id.startsWith("3F8") ||
            m.id.startsWith("A5"));

    m.text = pt(msg.message, m.mtype);
    m.prefix = "."

    const ctx =
        msg.message?.extendedTextMessage?.contextInfo ||
        msg.message?.[m.mtype]?.contextInfo ||
        null;

    m.quoted = null;
    m.mentionedJid = ctx?.mentionedJid || [];

    if (ctx?.quotedMessage) {
        const qMsg = ctx.quotedMessage;
        const qType = getContentType(qMsg);

        const qInner = qMsg?.[qType] || {};

        m.quoted = {
            id: ctx.stanzaId || "",
            chat: m.chat,
            sender: jidNormalizedUser(ctx.participant),
            fromMe:
                jidNormalizedUser(ctx.participant) ===
                jidNormalizedUser(msg.key?.fromMe ? m.sender : ""),
            mtype: qType,
            text: pt(qMsg, qType),
            message: qMsg,
            key: {
                remoteJid: m.chat,
                fromMe:
                    jidNormalizedUser(ctx.participant) ===
                    jidNormalizedUser(m.sender),
                id: ctx.stanzaId,
                participant: m.isGroup ? ctx.participant : undefined
            },
            mentionedJid: qInner?.contextInfo?.mentionedJid || [],
            device: getDevice(ctx.stanzaId),
            delete: async sock =>
                sock.sendMessage(m.chat, { delete: m.quoted.key }),
            download: async () => {
                const content =
                    qMsg.imageMessage ||
                    qMsg.videoMessage ||
                    qMsg.audioMessage ||
                    qMsg.stickerMessage ||
                    qMsg.documentMessage;

                if (!content) throw new Error("Quoted bukan media");

                const mediaType = qMsg.imageMessage
                    ? "image"
                    : qMsg.videoMessage
                    ? "video"
                    : qMsg.audioMessage
                    ? "audio"
                    : qMsg.stickerMessage
                    ? "sticker"
                    : "document";

                const stream = await downloadContentFromMessage(
                    content,
                    mediaType
                );
                return toBuffer(stream);
            }
        };
    }
    
    m.device = getDevice(m.id);

    return m;
}
