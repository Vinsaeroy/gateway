export const command = ["stalkgc", "stalkgrup", "stalkgroup"];

function extractInviteCode(input = "") {
  const text = String(input).trim();

  const m = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);
  if (m?.[1]) return m[1];

  const only = text.replace(/[^0-9A-Za-z]/g, "");
  if (only.length >= 20 && only.length <= 24) return only;

  return null;
}

function fmtDate(sec) {
  if (!sec || !Number.isFinite(sec)) return "-";
  try {
    return new Date(sec * 1000).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
  } catch {
    return String(sec);
  }
}

export default async function run(msg, ctx) {
  const { riz, reply, q } = ctx;

  const text = (q || "").trim();
  if (!text) {
    return reply("📌 Contoh: .stalkgc https://chat.whatsapp.com/xxxxx?mode=hqrt2\nAtau: .stalkgc xxxxxxxxxxxxxxxxxxxx");
  }

  const code = extractInviteCode(text);
  if (!code) {
    return reply("❌ Link/kode tidak valid.\nFormat: https://chat.whatsapp.com/xxxxx");
  }

  try {
    const res = await riz.groupGetInviteInfo(code);

    const subject = res?.subject || "-";
    const subjectOwner = res?.subjectOwner || "";
    const owner = res?.owner || "";
    const creation = Number(res?.creation);
    const desc = res?.desc || "";
    const size = res?.size ?? res?.participants?.length ?? "-";

    const ownerJid = (owner || subjectOwner || "").toString();
    const ownerNum = ownerJid.includes("@") ? ownerJid.split("@")[0] : ownerJid;

    let teks = `📍 *Info Grup WhatsApp (Stalk):*\n`;
    teks += `\n📛 *Nama:* ${subject}`;
    teks += `\n🧑‍💼 *Owner:* ${ownerNum ? `wa.me/${ownerNum}` : "-"}`;
    teks += `\n👥 *Jumlah Member:* ${size}`;
    teks += `\n⏱️ *Dibuat:* ${fmtDate(creation)}`;
    if (desc) teks += `\n📝 *Deskripsi:*\n${desc}`;
    teks += `\n\n🔗 *Link Undangan:*\nhttps://chat.whatsapp.com/${code}`;

    return reply(teks);
  } catch (e) {
    const msgErr =
      (e && (e.output?.payload?.message || e.message))
        ? (e.output?.payload?.message || e.message)
        : String(e);

    return reply(
      "❌ Gagal mengambil info grup. Pastikan link valid dan bot tidak diblokir oleh WhatsApp.\nDetail: " +
        msgErr
    );
  }
}