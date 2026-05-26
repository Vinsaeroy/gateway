import { downloadContentFromMessage } from "baileys"

export const command = ["tagall", "h", "ht"]

export default async (msg, {
  riz, id, isGroup, groupMetadata, q, reply, isAdmin, qriz
}) => {

  if (!isGroup) return reply("⚠️ Command ini cuma bisa di grup.")
  if (!isAdmin) return reply(mess.admin)

  const participants = groupMetadata.participants || []
  const mentions = participants.map(p => p.id)

  const ctx = msg.message?.extendedTextMessage?.contextInfo
  const quoted = ctx?.quotedMessage

  let teks = q || "*Tag All*"

  // === REPLY IMAGE ===
  if (quoted?.imageMessage) {
    const stream = await downloadContentFromMessage(
      quoted.imageMessage,
      "image"
    )
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    return riz.sendMessage(id, {
      image: buffer,
      caption: quoted.imageMessage.caption || teks,
      mentions
    }, { quoted: qriz })
  }

  // === REPLY VIDEO ===
  if (quoted?.videoMessage) {
    const stream = await downloadContentFromMessage(
      quoted.videoMessage,
      "video"
    )
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    return riz.sendMessage(id, {
      video: buffer,
      caption: quoted.videoMessage.caption || teks,
      mentions
    }, { quoted: qriz })
  }

  // === REPLY TEXT / NORMAL ===
  if (quoted?.conversation) {
    teks = quoted.conversation
  }

  await riz.sendMessage(id, {
    text: teks.trim(),
    mentions
  }, { quoted: qriz })
}