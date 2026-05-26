export const command = ["ttnn", "notnot", "tiktoknotnot"];

const videos = [
  { url: "https://k.top4top.io/m_2442ag1hz0.mp4" },
  { url: "https://e.top4top.io/m_2442zoq1q0.mp4" },
  { url: "https://d.top4top.io/m_2442fhuc30.mp4" },
  { url: "https://j.top4top.io/m_24422gftd0.mp4" },
  { url: "https://b.top4top.io/m_2443t8ab30.mp4" },
  { url: "https://a.top4top.io/m_2443wc3wp0.mp4" },
  { url: "https://b.top4top.io/m_2443mcw8l0.mp4" },
  { url: "https://e.top4top.io/m_2444w606q1.mp4" },
  { url: "https://d.top4top.io/m_24441r8490.mp4" },
  { url: "https://g.top4top.io/m_2442x0pz10.mp4" },
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
      {
        video: { url },
        caption: "🎲 Tiktok NotNot"
      },
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