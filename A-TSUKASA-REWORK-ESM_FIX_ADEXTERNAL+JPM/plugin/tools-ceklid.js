import "../config.js"

export const command = ["ceklid", "lid"]

export default async (m, { reply, id, riz, participants, msg, isGroup, sender }) => {
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

  const p = Array.isArray(participants)
    ? participants.find(x => (x?.jid || x?.id) === targetJid)
    : null

  let targetLid = p?.lid || p?.full?.lid || null

  if (!targetLid) {
    try {
      const ow = await riz.onWhatsApp?.(targetJid)
      if (Array.isArray(ow) && ow[0]) targetLid = ow[0].lid || ow[0].id || ow[0].jid || null
    } catch {}
  }

  if (!targetLid) return reply("❌ LID tidak ditemukan untuk target tersebut.")

  await riz.sendMessage(id, {
    text: `Target LID:\n${targetLid}\n\nTarget JID:\n${targetJid}`,
    footer: "Linked Id(LID)",
    title: "LID",
    interactiveButtons: [{
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "📋 Salin LID",
        copy_code: targetLid
      })
    }]
  })
}