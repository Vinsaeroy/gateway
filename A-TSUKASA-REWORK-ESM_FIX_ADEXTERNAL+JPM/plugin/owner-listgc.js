export const command = ["listgc", "listgroup", "gclist"];
import "../config.js"

function chunkText(text, maxLen = 3500) {
  const parts = [];
  let cur = "";
  for (const line of text.split("\n")) {
    if ((cur + line + "\n").length > maxLen) {
      parts.push(cur);
      cur = "";
    }
    cur += line + "\n";
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

export default async function run(msg, ctx) {
  const { riz, reply, isOwner, q } = ctx;

  if (!isOwner) return reply(mess.owner)

  const limit = Math.max(1, Math.min(200, parseInt((q || "").trim(), 10) || 50));

  try {
    const response = await riz.groupFetchAllParticipating();
    const groups = Object.entries(response || {}).map(([jid, g]) => ({
      jid,
      subject: g?.subject || "-",
      size: g?.size ?? g?.participants?.length ?? 0,
      announce: !!g?.announce,
      restrict: !!g?.restrict,
    }));

    if (!groups.length) return reply("ℹ️ Bot tidak ada di grup manapun.");

    groups.sort((a, b) => (b.size || 0) - (a.size || 0));

    const list = groups.slice(0, limit).map((g, i) => {
      const flags = [g.announce ? "🔇announce" : null, g.restrict ? "🔒restrict" : null]
        .filter(Boolean)
        .join(" ");

      return [
        `${i + 1}. ${g.subject}`,
        `   👥 ${g.size} member${flags ? " • " + flags : ""}`,
        `   🆔 ${g.jid}`,
      ].join("\n");
    }).join("\n\n");

    const header = `✅ LIST GROUP BOT (${Math.min(groups.length, limit)}/${groups.length})\n`;
    const footer =
      groups.length > limit ? `\n\nKetik: .listgc ${groups.length} (buat tampil semua, max 200)` : "";

    const chunks = chunkText(header + "\n" + list + footer);

    for (const part of chunks) {
      await reply(part.trim());
    }
  } catch (e) {
    const msgErr =
      (e && (e.output?.payload?.message || e.message))
        ? (e.output?.payload?.message || e.message)
        : String(e);

    return reply("❌ Gagal ambil list grup.\nDetail: " + msgErr);
  }
}