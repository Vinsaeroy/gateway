export const command = ["aig"]

export default async (m, {
  riz, reply, qriz, id, q
}) => {
  try {
    if (!q) return reply("masukan query gambar yang mau dibuat")

    const res = await fetch(`https://api-faa.my.id/faa/ai-text2img-pro?prompt=${encodeURIComponent(q)}`)

    if (!res.ok) throw new Error("Gagal fetch API")

    const buffer = await res.arrayBuffer()

    await riz.sendMessage(
      id,
      {
        image: Buffer.from(buffer),
        caption: `✨ Nih  Gambarnya` 
      },
      {
        quoted: qriz
      }
    )
  } catch (e) {
    console.error(e)
    reply("⚠️ Gagal ngambil gambar cecan, coba lagi bentar...")
  }
}