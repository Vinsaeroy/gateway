import axios from "axios";

export const command = ["videy"];

export default async function handler(msg, ctx) {
  const { q, reply, riz, id, qriz } = ctx;

  if (!q) return reply("⚠️ Masukkan link videy!\nContoh: .videy https://videy.co/v/?id=RFGTGifd1");

  try {
    // extract ID videy
    const url = new URL(q);
    const param = url.searchParams.get("id");

    if (!param) return reply("❌ Link Videy tidak valid!");

    // menentukan filetype
    let fileType = ".mp4";
    if (param.length === 9 && param[8] === "2") fileType = ".mov";

    const videoUrl = `https://cdn.videy.co/${param}${fileType}`;

    // test apakah file ada
    const check = await axios.get(videoUrl, { method: "HEAD" }).catch(() => null);
    if (!check || check.status !== 200) {
      return reply("❌ Video tidak ditemukan atau sudah dihapus.");
    }

    await riz.sendMessage(
      id,
      {
        video: { url: videoUrl },
        caption: `🎬 *Videy Downloader*\n\nID: ${param}\nFormat: ${fileType}\n\nEnjoy!`
      },
      { quoted: qriz }
    );

  } catch (err) {
    console.error("Videy Error:", err);
    reply("❌ Gagal memproses link Videy!");
  }
}