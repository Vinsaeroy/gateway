import "../config.js"

export const command = ["group", "grup"]

export default async function (msg, {
  riz, id, isGroup, reply, args = [], qriz, isAdmin, isBotAdmin, sender
}) {
  try {
    if (!isGroup) return reply(mess.group)
    if (!isAdmin) return reply(mess.admin)
    if (!isBotAdmin) return reply("❌ Bot bukan admin grup!")

    const action = (args[0] || '').toLowerCase();

    if (action === 'close') {
      await riz.groupSettingUpdate(id, 'announcement');
      reply('🔒 Grup ditutup! Hanya admin yang bisa chat.');
    } else if (action === 'open') {
      await riz.groupSettingUpdate(id, 'not_announcement');
      reply('🔓 Grup dibuka! Semua anggota bisa chat.');
    } else {
      reply('⚙️ Gunakan: .group on / .group off');
    }
  } catch (e) {
    reply("❌ Terjadi kesalahan saat mengatur pengaturan grup.")
  }
}