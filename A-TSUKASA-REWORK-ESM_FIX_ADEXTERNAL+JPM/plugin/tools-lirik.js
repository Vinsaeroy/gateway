export const command = ["lirik", "lyric"]
import axios from "axios";

export default async (m, {
  reply, qriz, id, riz, q, isPremiumUser, getUserLimit, useUserLimit, senderNum, DEFAULT_LIMIT, msg
}) => {

  if (!q) return reply("⚠️ Masukkan judul lagunya!\nContoh: .lirik blue bird");
 
     if (!isPremiumUser) {
        const bisa = useUserLimit(senderNum, 1);
        if (!bisa) {
            return reply(
                `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
            );
        }
    const sisa = getUserLimit(senderNum);
    reply(
        `🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
    );
}
 
  await riz.sendMessage(id, {
    react: {
      text: "⏳", key: msg.key
    }
  });

  async function lirik(title) {
    try {
      if (!title) throw new Error('Judul lagu diperlukan');

      const {
        data
      } = await axios.get(`https://lrclib.net/api/search?q=${encodeURIComponent(title)}`, {
          headers: {
            referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
          }
        });
      return data && data.length > 0 ? data[0]: null;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  try {
    const result = await lirik(q);
    if (!result) return reply(`❌ Lirik untuk *"${q}"* tidak ditemukan.`);

    const maxLength = 1500;
    let lirikText = result.plainLyrics || result.syncedLyrics || "Lirik tidak tersedia.";
    if (lirikText.length > maxLength) {
      lirikText = lirikText.substring(0, maxLength) + "\n\n...(Lirik terlalu panjang, dipotong)";
    }

    const caption = `🎵 *Lirik Lagu ${result.trackName || result.name || q}*\n` +
    `👤 Artis: ${result.artistName || "-"}\n` +
    `💿 Album: ${result.albumName || "-"}\n` +
    `⏱ Durasi: ${Math.floor((result.duration || 0) / 60)}:${((result.duration || 0) % 60).toString().padStart(2, '0')}\n\n` +
    `📜 *Lirik:*\n${lirikText}`;

    await riz.sendMessage(id, {
      text: caption
    }, {
      quoted: qriz
    });
  } catch (err) {
    console.error("Lirik Error:", err);
    reply("❌ Gagal mencari lirik, coba lagi nanti.");
  }

}