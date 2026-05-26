export const command = ["bucin", "quotesbucin"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default async function run(msg, ctx) {
  const { riz, reply, qriz } = ctx;

  try {
    const bucin = await fetchJson(
      "https://raw.githubusercontent.com/Leoo7z/quotes/main/quotes-source/bucin.json"
    );

    const bucc = Array.isArray(bucin) ? pickRandom(bucin) : null;
    if (!bucc) return reply("❌ Data bucin kosong.");

    await riz.sendMessage(ctx.id, { text: String(bucc) }, { quoted: qriz });
  } catch (e) {
    const msgErr = e?.message || String(e);
    return reply("❌ Gagal ambil quotes bucin.\nDetail: " + msgErr);
  }
}