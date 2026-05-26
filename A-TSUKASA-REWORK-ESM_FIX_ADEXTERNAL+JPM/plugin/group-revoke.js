import "../config.js"

export const command = ["revoke", "resetlink", "gantilink"]

export default async function (msg, {
  riz, id, isGroup, participants = [], reply, args = [], qriz, isAdmin, isBotAdmin, quoted, sender
}) {
  try {
    if (!isGroup) return reply(mess.group)
    if (!isAdmin) return reply(mess.admin)
    if (!isBotAdmin) return reply("Bot bukan admin.")

    try {
      // Reset group invite link
      await riz.groupRevokeInvite(id)
      await reply("✅ Link invite grup berhasil direset!")
      
    } catch (e) {
      console.error(e)
      return reply("❌ Gagal mereset link invite grup.")
    }
    
  } catch (e) {
    console.error(e)
    reply("❌ Terjadi kesalahan saat menjalankan perintah revoke.")
  }
}