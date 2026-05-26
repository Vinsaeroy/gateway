export const command = ["ytcomment"]

export default async function (msg, { riz, m, reply, q, sender, pushname }) {
  try {
    if (!q) return reply("No Text\n\nContoh: .ytcomment keren bang 🔥")

    // react wait (kalau ada)
    if (m?.Xp) await m.Xp()

    const avatar = await riz
      .profilePictureUrl(sender, "image")
      .catch(() => "https://telegra.ph/file/24fa902ead26340f3df2c.png")

    const username = pushname || "Unknown"
    const url =`https://some-random-api.com/canvas/misc/youtube-comment?avatar=${encodeURIComponent(
            avatar
          )}&comment=${encodeURIComponent(q)}&username=${encodeURIComponent(
            username
          )}`

    await riz.sendMessage(
      id,
      {
        image: { url },
        caption: "*THANKS FOR COMMENT*"
      },
      { quoted: msg }
    )

    if (m?.Xd) await m.Xd()
  } catch (e) {
    console.error("ytcomment error:", e)
    if (m?.Xg) await m.Xg()
    reply("❌ Error, coba lagi nanti.")
  }
}