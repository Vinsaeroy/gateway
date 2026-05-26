import axios from "axios";
import "../config.js";

export const command = ["play", "playyt"];

export default async (msg, {
  reply, riz, id, q, qriz,
  isPremiumUser, getUserLimit,
  useUserLimit, DEFAULT_LIMIT,
  senderNum, reactm
}) => {

  if (!q) {
    return reply(`Kasih judul nya dong\nContoh:\n*.play Dia naik dia turun*`);
  }

  if (!isPremiumUser) {
    const bisa = useUserLimit(senderNum, 1);
    if (!bisa) {
      return reply(`❌ Limit kamu sudah habis.\n\nHubungi owner:\n${global.owner}`);
    }
    const sisa = getUserLimit(senderNum);
    reply(`🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`);
  }

  reactm("⏳");

  try {
    const { data } = await axios.get(
      `https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(q)}`
    );

    if (!data.status || !data.result?.download_url) {
      return reply("❌ Gagal ambil data dari API.");
    }

    const r = data.result;

    await riz.sendMessage(id, {
      image: { url: r.thumbnail },
      caption:
        `🎵 *${r.title}*\n\n` +
        `📺 Channel: ${r.channel}\n` +
        `⏱ Durasi: ${r.duration}\n` +
        `👀 Views: ${r.views}\n` +
        `🔗 Url: ${r.url}`
    }, { quoted: msg });

    await riz.sendMessage(id, {
      audio: { url: r.download_url },
      mimetype: "audio/mpeg",
      fileName: `${r.title}.mp3`
    }, { quoted: msg });

    reactm("✅");

  } catch (err) {
    console.error(err);
    reactm("❌");
    reply("❌ Terjadi kesalahan saat memproses.");
  }
};