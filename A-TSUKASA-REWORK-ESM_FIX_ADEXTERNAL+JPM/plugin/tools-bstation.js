import axios from "axios"

export const command = ["bili", "bstation", "bs"]

export default async function handler(m, PLUGIN_CTX) {
  const { riz, id, q, qriz, reply } = PLUGIN_CTX
  try {

    if (!q) return reply("Mau cari apa??")

    reply("Wait...")

    const { data } = await axios.get(
      `https://api.jarroffc.my.id/search/bstation?apikey=jarroffc&q=${encodeURIComponent(q)}`
    )

    if (!data.result || data.result.length < 1)
      return reply("Tidak ada hasil ditemukan.")

    let teks = `*BStation Search Results 👀*\n\n`

    data.result.slice(0, 5).forEach((v, i) => {
      teks += `*${i + 1}.* ${v.title}\n`
      teks += `📺 Uploader: ${v.uploader}\n`
      teks += `⏱ Durasi: ${v.duration}\n`
      teks += `👁 Views: ${v.views}\n`
      teks += `🔗 Link: ${v.url}\n\n`
    })

    await riz.sendMessage(
      id,
      {
        image: { url: data.result[0].thumbnail },
        caption: teks.trim()
      },
      { quoted: qriz }
    )
  } catch (e) {
    console.error(e)
    reply("❌ Terjadi kesalahan.")
  }
}