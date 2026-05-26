import {
    proto,
    downloadContentFromMessage,
    jidNormalizedUser,
    generateWAMessageFromContent,
    generateWAMessageContent,
    isJidGroup,
    getContentType
} from "baileys";
import "../config.js";

export default async function (msg, { q, reply, id, riz, isOwner }) {
    if (!isOwner) return reply(mess.owner);
    if (!q) {
        return reply(`Example: *.setlabel Orang Sikma*`);
    }
    const jw = await riz.sendMessage(
        id,
        { text: "*Loading...*" },
        { quoted: msg }
    );
    try {
        await riz.relayMessage(
            id,
            {
                protocolMessage: {
                    type: 30,
                    memberLabel: {
                        label: text,
                        labelTimestamp: Date.now()
                    }
                }
            },
            {}
        );
        await riz.sendMessage(id, {
            edit: jw.key,
            text: `*Label successfully applied!*`
        });
    } catch (e) {
        await riz.sendMessage(id, {
            edit: jw.key,
            text: `${e}`
        });
    }
}
