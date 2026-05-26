export const command = ["cecan"]

export default async (m, { riz, reply, qriz, id }) => {
  try {
    const apis = [
      "https://api.nekolabs.web.id/random/girl/indonesia",
      "https://api.nekolabs.web.id/random/girl/japan",
      "https://api.nekolabs.web.id/random/girl/korea"
    ]

    const api = apis[Math.floor(Math.random() * apis.length)]
    const res = await fetch(api)

    if (!res.ok) throw new Error("Gagal fetch API")

    const buffer = await res.arrayBuffer()

    await riz.sendMessage(
      id, 
      {
        image: Buffer.from(buffer),
        caption: "✨ Nih cecan random buat lu 😋"
      },
      { quoted: qriz }
    )
  } catch (e) {
    console.error(e)
    reply("⚠️ Gagal ngambil gambar cecan, coba lagi bentar...")
  }
}