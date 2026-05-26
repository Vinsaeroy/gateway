export const command = ["meme"]

const JON =
  "https://raw.githubusercontent.com/Rizkygamers/waifuim-img/main/memes.json"

export default async (m, { reply, riz, id, qriz, msg }) => {
  try {
    await riz.sendMessage(id, {
      react: { text: "😂", key: msg.key }
    })

    const res = await fetch(JON)
    if (!res.ok) throw new Error("Gagal fetch JSON")

    const images = await res.json()
    if (!Array.isArray(images) || images.length === 0)
      throw new Error("JSON kosong / bukan array")

    const RI =
      images[Math.floor(Math.random() * images.length)]

    await riz.sendMessage(
      id,
      {
        image: { url: RI },
        caption: "😂 Random Meme"
      },
      { quoted: qriz }
    )

    await riz.sendMessage(id, {
      react: { text: "✅", key: msg.key }
    })
  } catch (err) {
    console.error("MEME ERROR:", err)
    await riz.sendMessage(id, {
      react: { text: "❌", key: msg.key }
    })
    reply("❌ Gagal mengambil meme.")
  }
}