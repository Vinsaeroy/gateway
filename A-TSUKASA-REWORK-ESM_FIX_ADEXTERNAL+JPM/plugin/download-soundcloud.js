import axios from "axios";

export const command = ["soundcloud", "scloud"];

async function soundcloud(url) {
  const endpoint = "https://scloudplaylistdownloader.app/api/scinfo.php";

  const body = "url=" + encodeURIComponent(url);

  const headers = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
    Accept: "application/json, text/javascript, */*; q=0.01",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-requested-with": "XMLHttpRequest",
    "sec-ch-ua": `"Chromium";v="139", "Not;A=Brand";v="99"`,
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": `"Android"`,
    origin: "https://scloudplaylistdownloader.app",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
    "sec-fetch-dest": "empty",
    referer: "https://scloudplaylistdownloader.app/en1/",
    "accept-language": "id-ID,id;q=0.9,en;q=0.7",
    Cookie: "PHPSESSID=214e99a1cb629f95fe6f3bb5874a7357"
  };

  const res = await axios.post(endpoint, body, { headers });

  return res.data;
}

export default async function run(msg, ctx) {
  const { reply, riz, q, qriz } = ctx;

  if (!q) return reply("📌 Contoh:\n.sc https://soundcloud.com/xxxxxx");

  try {
    const data = await soundcloud(q);

    if (!data || !data.dlink_mp3) {
      return reply("❌ Gagal mengambil data / link download tidak tersedia.");
    }

    const caption =
      `🎧 *SOUNDCLOUD DOWNLOADER*\n\n` +
      `🎵 *Judul:* ${data.name}\n` +
      `👤 *Artist:* ${data.artist}\n` +
      `⏱️ *Durasi:* ${data.duration}\n` +
      `📅 *Tahun:* ${data.date}\n` +
      `🔗 *URL:* ${data.url}\n\n` +
      `Sedang mengirim audio...`;

    await reply(caption);

    await riz.sendMessage(
      ctx.id,
      {
        audio: { url: data.dlink_mp3 },
        mimetype: "audio/mpeg",
        fileName: `${data.name}.mp3`
      },
      { quoted: qriz }
    );
  } catch (e) {
    const err =
      (e?.response?.data?.error || e?.message || String(e)).slice(0, 200);

    return reply("❌ Terjadi error saat mengambil data SoundCloud:\n" + err);
  }
}