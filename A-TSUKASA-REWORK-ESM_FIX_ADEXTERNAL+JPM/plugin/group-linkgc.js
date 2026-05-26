import "../config.js"

export const command = ["linkgc", "grouplink", "link", "linkgrup", "invite"]

export default async function (m, {
  riz, id, isGroup, participants = [], reply, args = [], qriz, isAdmin, isBotAdmin, quoted, sender, groupMetadata
}) {
  try {
    if (!isGroup) return reply(mess.group)
    if (!isBotAdmin) return reply("❌ Bot bukan admin.")

    try {

      const invite = await riz.groupInviteCode(id)
      const link = `https://chat.whatsapp.com/${invite}`


      const message = `
      📱 *GROUP INVITE LINK*

      📛 *Nama Grup:* ${groupMetadata?.subject || "Unknown"}
      👥 *Anggota:* ${participants.length || groupMetadata?.participants?.length || "Unknown"}
      🆔 *Group ID:* ${id}
      ────────────────────
      ${link}
      ────────────────────
      *Salin link di atas*

      _Link akan expired jika direset oleh admin_
      `.trim()

      await reply(message)

    } catch (groupError) {
      console.error("Group Error:", groupError)
      reply("❌ Gagal mengambil link. Pastikan:\n• Bot adalah admin\n• Grup tidak private\n• Koneksi stabil")
    }

  } catch (e) {
    console.error("Global Error:", e)
    reply("❌ Terjadi error sistem. Coba lagi nanti.")
  }
}