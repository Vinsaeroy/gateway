export const command = Array.from({ length: 55 }, (_, i) => `sad${i + 1}`);

export default async (m, { reply, riz, command, id, msg }) => {
  try {
    const link = `https://raw.githubusercontent.com/Leoo7z/Music/main/sad-music/${command}.mp3`;

    await riz.sendMessage(
      id,
      {
        audio: { url: link },
        mimetype: "audio/mpeg",
      },
      { quoted: msg }
    );
  } catch (err) {
    return reply(`Terjadi kesalahan: ${err?.message || err}`);
  }
};