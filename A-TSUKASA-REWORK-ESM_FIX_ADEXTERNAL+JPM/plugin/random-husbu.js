import '../config.js'

export const command = ["husbu", "husbando"]

export default async (m, { riz, id, reply, qriz }) => {
  try {
    reply(mess.wait)

    const res = await fetch("https://nekos.best/api/v2/husbando")
    if (!res.ok) throw new Error(`Status ${res.status}`)

    const data = await res.json()
    const husbu = data?.results?.[0]
    if (!husbu?.url) throw new Error("Gagal dapetin gambar husbu!")

    const caption = `💙 *Random husbando*`

    await riz.sendMessage(id, {
      image: { url: husbu.url },
      caption,
    }, { quoted: qriz })

  } catch (e) {
    console.error("❌ Husbu Error:", e)
    reply(`⚠️ Gagal ambil husbando: ${e.message}`)
  }
}
