import crypto from "crypto";

export const command = ["nglsubmit"];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default async function run(msg, ctx) {
  const { reply, isOwner, q, isPremiumUser, getUserLimit, useUserLimit, senderNum, DEFAULT_LIMIT } = ctx;

  const text = (q || "").trim();
  const parts = text.split("|").map((s) => s.trim());

  if (!parts[0] || !parts[1]) {
    return reply("Masukan username dan pesan!\nContoh: .nglsubmit sjasj|haloo");
  }

  const username = parts[0].replace(/^@/, "");
  const message = parts.slice(1).join("|").trim();

  if (!username) return reply("❌ Username kosong.");
  if (!message) return reply("❌ Pesan kosong.");
  if (message.length > 300) return reply("❌ Pesan kepanjangan (maks 300 karakter).");

    if (!isPremiumUser) {
        const bisa = useUserLimit(senderNum, 1);
        if (!bisa) {
            return reply(
                `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
            );
        }
    const sisa = getUserLimit(senderNum);
    reply(
        `🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
    );
}

  try {
    const deviceId = crypto.randomBytes(21).toString("hex");
    const url = "https://ngl.link/api/submit";

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `https://ngl.link/${username}`,
      Origin: "https://ngl.link",
    };

    const body = new URLSearchParams({
      username,
      question: message,
      deviceId,
      gameSlug: "",
      referrer: "",
    }).toString();

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (res.status !== 200) {
      await sleep(300);
      return reply(`❌ Gagal submit (HTTP ${res.status}). Coba lagi nanti.`);
    }

    return reply(`✅ Berhasil submit 1 pesan ke NGL: ${username}`);
  } catch (e) {
    return reply("❌ Fitur error.\nDetail: " + (e?.message || String(e)));
  }
}