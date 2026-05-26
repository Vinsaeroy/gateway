export const command = ["tiktokbocil"];

const videos = [
  { url: "https://b.top4top.io/m_1931yxodg0.mp4" },
  { url: "https://k.top4top.io/m_193161p380.mp4" },
  { url: "https://l.top4top.io/m_1931i4g3p1.mp4" },
  { url: "https://a.top4top.io/m_1931tjlio2.mp4" },
  { url: "https://g.top4top.io/m_1931z2mc40.mp4" },
  { url: "https://h.top4top.io/m_1931auyof1.mp4" },
  { url: "https://i.top4top.io/m_19315hrle2.mp4" },
  { url: "https://j.top4top.io/m_1931xul5a3.mp4" },
  { url: "https://l.top4top.io/m_1931o92nr0.mp4" },
  { url: "https://a.top4top.io/m_1931j1rh21.mp4" },
  { url: "https://b.top4top.io/m_1931iaqpg2.mp4" },
  { url: "https://c.top4top.io/m_1931s5zlj3.mp4" },
  { url: "https://d.top4top.io/m_1931x0g5a4.mp4" },
  { url: "https://i.top4top.io/m_1931oj76n0.mp4" },
  { url: "https://j.top4top.io/m_19319gl3d1.mp4" },
  { url: "https://k.top4top.io/m_1931u52cq2.mp4" },
  { url: "https://l.top4top.io/m_1931mvgj73.mp4" },
  { url: "https://a.top4top.io/m_1931u07oz4.mp4" },
  { url: "https://j.top4top.io/m_1931h1fo60.mp4" },
  { url: "https://k.top4top.io/m_1931mro3u1.mp4" },
  { url: "http://sansekai.my.id/ptl_repost/120664457_338629710563119_6615226849280369453_n.mp4" },
  { url: "https://l.top4top.io/m_1931kx0ac2.mp4" },
  { url: "https://a.top4top.io/m_1931g9ezq3.mp4" },
  { url: "https://b.top4top.io/m_1931plin14.mp4" },
  { url: "https://c.top4top.io/m_1931aaxri5.mp4" },
  { url: "https://d.top4top.io/m_1931ijzzn6.mp4" },
  { url: "https://e.top4top.io/m_1931ugycd7.mp4" },
  { url: "https://f.top4top.io/m_1931l14nk8.mp4" },
  { url: "https://g.top4top.io/m_1931crgqt9.mp4" },
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
      { video: { url }, caption: "🎲 Bocil" },
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