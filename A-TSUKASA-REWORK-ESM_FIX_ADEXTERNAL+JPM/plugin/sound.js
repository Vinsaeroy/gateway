export const command = Array.from({ length: 250 }, (_, i) => `sound${i + 1}`);

export default async (m, { reply, riz, command, msg, id }) => {
  try {
    const link = `https://raw.githubusercontent.com/Leoo7z/Music/main/${command}.mp3`;

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