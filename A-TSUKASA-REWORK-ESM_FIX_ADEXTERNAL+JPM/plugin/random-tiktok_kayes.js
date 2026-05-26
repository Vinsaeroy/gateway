export const command = ["tiktokkayes"];

const videos = [
  { url: "https://b.top4top.io/m_2442d9ia10.mp4" },
  { url: "https://f.top4top.io/m_24449l6wj0.mp4" },
  { url: "https://g.top4top.io/m_24443skoc1.mp4" },
  { url: "https://h.top4top.io/m_2444q3q4w2.mp4" },
  { url: "https://i.top4top.io/m_2444ii1ff3.mp4" },
  { url: "https://j.top4top.io/m_2444p2u0y4.mp4" },
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function run(msg, ctx) {
  const { riz, reply, qriz } = ctx;

  try {
    if (!videos.length) return reply("❌ List video kosong.");

    const pick = pickRandom(videos);
    const url = pick?.url;

    if (!url) return reply("❌ URL video tidak valid.");

    await riz.sendMessage(
      ctx.id,
      { video: { url }, caption: "🎲 TikTok random" },
      { quoted: qriz }
    );
  } catch (e) {
    const msgErr =
      (e && (e.output?.payload?.message || e.message))
        ? (e.output?.payload?.message || e.message)
        : String(e);

    return reply("❌ Gagal kirim video.\nDetail: " + msgErr);
  }
}