export const command = ["join"];
import "../config.js"
function extractInviteCode(input = "") {
  const text = String(input).trim();

  const m = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
  if (m?.[1]) return m[1];

  const only = text.replace(/[^0-9A-Za-z]/g, "");
  if (only.length >= 20 && only.length <= 24) return only;

  return null;
}

export default async function run(msg, ctx) {
  const { riz, reply, isOwner, q } = ctx;

  if (!isOwner) return reply(mess.owner)

  const text = (q || "").trim();
  if (!text) {
    return reply("⚠️ Masukkan link invite grup.\nContoh: .join https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxx");
  }

  const code = extractInviteCode(text);
  if (!code) {
    return reply("❌ Link/kode tidak valid.\nContoh: .join https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxx");
  }

  try {
    const groupJid = await riz.groupAcceptInvite(code);
    return reply(`✅ Berhasil join!\n📌 Grup: ${groupJid}`);
  } catch (e) {
    const msgErr =
      (e && (e.output?.payload?.message || e.message))
        ? (e.output?.payload?.message || e.message)
        : String(e);

    if (/gone|expired|revoked|invalid/i.test(msgErr)) {
      return reply("❌ Gagal join: link invite sudah expired / di-revoke / tidak valid.");
    }
    if (/not-authorized|unauthorized|forbidden/i.test(msgErr)) {
      return reply("❌ Gagal join: bot tidak diizinkan / invite tidak valid.");
    }
    if (/already|exists|participant/i.test(msgErr)) {
      return reply("ℹ️ Bot kemungkinan sudah ada di grup itu.");
    }

    return reply("❌ Gagal join.\nDetail: " + msgErr);
  }
}