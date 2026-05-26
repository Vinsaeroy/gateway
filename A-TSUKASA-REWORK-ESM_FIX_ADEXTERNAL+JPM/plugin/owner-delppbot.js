import "../config.js"
export const command = ["delppbot", "hapusppbot", "deleteppbot"];

export default async function run(msg, ctx) {
  const { riz, reply, isOwner } = ctx;

  if (!isOwner) return reply(mess.owner)

  try {
    const jid = riz.user?.id; // jid bot sendiri
    if (!jid) return reply("❌ Gagal: jid bot tidak terdeteksi.");

    await riz.removeProfilePicture(jid);

    return reply("✅ Foto profil bot berhasil dihapus (kembali default).");
  } catch (e) {
    const msgErr = (e && (e.output?.payload?.message || e.message))
      ? (e.output?.payload?.message || e.message)
      : String(e);

    return reply("❌ Gagal hapus foto profil bot.\nDetail: " + msgErr);
  }
}