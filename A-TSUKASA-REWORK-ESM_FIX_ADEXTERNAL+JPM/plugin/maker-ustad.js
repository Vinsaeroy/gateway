export const command = ["ustad"]

export default async (m, { q, reply, riz, qriz, id }) => {
  try {
    const text = (q || "").trim()
    if (!text)
      return reply("Contoh penggunaan:\n.ustadz sabar itu kunci")

    const url =
      "https://api.elrayyxml.web.id/api/maker/ustadz?text=" +
      encodeURIComponent(text)

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())

    await riz.sendMessage(
      id,
      {
        image: buffer
      },
      { quoted: qriz }
    )
  } catch (err) {
    console.error("USTADZ PLUGIN ERROR:", err)
    reply("❌ Gagal membuat gambar ustadz")
  }
}