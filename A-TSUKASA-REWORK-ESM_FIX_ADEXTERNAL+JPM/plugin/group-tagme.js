export const command = ["tagme"];

export default async function pluginRun(msg, ctx) {
    const { riz, id, senderNum, reply, qriz, sender } = ctx;
    
     await riz.sendMessage(id, {
    text: `@${senderNum}`,
    contextInfo: {
    mentionedJid: [sender]
    }
})