export const command = ["puisi"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export default async function run(msg, ctx) {
  const { reply } = ctx;

  try {
    const puis = await fetchJson(
      "https://raw.githubusercontent.com/Leoo7z/quotes/main/quotes-source/puisi.json"
    );

    const puisi = Array.isArray(puis) ? pickRandom(puis) : null;
    if (!puisi) return reply("❌ Data puisi kosong.");

    return reply(String(puisi));
  } catch (e) {
    return reply("❌ Gagal ambil puisi.\nDetail: " + (e?.message || String(e)));
  }
}