import axios from 'axios'
import "../config.js"

export const command = ["infogc", "groupinfo", "gcinfo"]

export default async (m, {
  riz, id, isGroup, groupMetadata, reply, qriz
}) => {
  if (!isGroup) return reply(mess.group)

  const participants = groupMetadata.participants || []
  const groupAdmins = participants.filter(p => p.admin === "admin" || p.admin === "superadmin")
  const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split("@")[0]}`).join("\n")

  const owner =
  groupMetadata.owner ||
  groupAdmins.find(p => p.admin === "superadmin")?.id ||
  id.split("-")[0] + "@s.whatsapp.net"

  const ppUrls = [
    "https://i.ibb.co/VVXTRv0/f8323e88975b4e8c15580fbb8daed698.jpg",
    "https://i.ibb.co/mvt0NPZ/31889221389613dd440c9909cd27771a.jpg",
    "https://i.ibb.co/jhCy322/f272360445283d8385c35afa697bdf43.jpg",
  ]

  let ppUrl = null
  try {
    ppUrl = await riz.profilePictureUrl(id, "image")
  } catch {}
  if (!ppUrl) ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)]

  const ppBuffer = await axios
  .get(ppUrl, {
    responseType: "arraybuffer"
  })
  .then(res => res.data)
  .catch(() => null)

  const text = `
  *「 Group Information 」*

  📛 *Nama:* ${groupMetadata.subject}
  🆔 *ID:* ${groupMetadata.id}
  📝 *Deskripsi:* \n${groupMetadata.desc?.toString() || "Tidak ada."}
  👥 *Total Member:* ${participants.length}
  👑 *Owner:* @${owner.split("@")[0]}

  *🧑‍💻 Admin Grup:*
  ${listAdmin || "Belum ada admin."}
  `.trim()

  const mentions = [...groupAdmins.map(v => v.id),
    owner]

  if (ppBuffer) {
    await riz.sendMessage(
      id,
      {
        image: Buffer.from(ppBuffer),
        caption: text,
        mentions,
      },
      {
        quoted: qriz
      }
    )
  } else {
    await riz.sendMessage(id, {
      text, mentions
    }, {
      quoted: qriz
    })
  }
}