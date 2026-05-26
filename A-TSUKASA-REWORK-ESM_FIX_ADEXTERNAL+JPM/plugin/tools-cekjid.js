import "../config.js"

export const command = ["cekjid", "jid"]

export default async (m, { reply, riz, isGroup, id, sender, msg }) => {
  if (!isGroup) return reply(mess.group)

  const ctx =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.stickerMessage?.contextInfo ||
    msg.message?.documentMessage?.contextInfo ||
    null

  const quotedTarget = ctx?.participant
  const mentionedTarget = Array.isArray(ctx?.mentionedJid) ? ctx.mentionedJid[0] : null
  const targetJid = quotedTarget || mentionedTarget || sender

  await riz.sendMessage(id, {
    text: `Target JID:\n${targetJid}`,
    footer: "JID",
    title: "JID",
    interactiveButtons: [{
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 Salin JID",
        copy_code: targetJid
      })
    }]
  })
}