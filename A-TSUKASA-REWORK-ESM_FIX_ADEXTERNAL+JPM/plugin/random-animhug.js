export const command = ["animehug", "hug"]
import axios from "axios"

export default async (m, {
  reply, pushname, riz, id, qriz
}) => {

  try {
    const { data } = await axios.get("https://api.waifu.pics/sfw/hug", {
      headers: { "user-agent": "Mozilla/5.0" },
    });

    const gifUrl = data?.url;
    if (!gifUrl) return reply("❌ Gagal ambil GIF hug.");

    const res = await axios.get(gifUrl, { responseType: "arraybuffer" });
    const buff = Buffer.from(res.data);

    await riz.sendMessage(
      id,
      {
        video: buff,
        gifPlayback: true,
        caption: "🤗",
      },
      { quoted: qriz }
    );
  } catch (e) {
    console.error("ANIMEHUG ERROR:", e);
    reply("❌ Error ambil anime hug.");
  }

}