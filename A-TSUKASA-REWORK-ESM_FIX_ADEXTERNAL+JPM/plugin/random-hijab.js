export const command = ["hijab", "hijaber"];

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
    const data = await fetchJson(
      "https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/hijaber.json"
    );

    const url = Array.isArray(data) ? pickRandom(data) : data?.url;
    if (!url || typeof url !== "string") return reply("❌ Data hijab kosong.");

    await riz.sendMessage(ctx.id, { image: { url }, caption: "✨ Hijab" }, { quoted: qriz });
  } catch (e) {
    return reply("❌ Gagal ambil hijab.\nDetail: " + (e?.message || String(e)));
  }
}