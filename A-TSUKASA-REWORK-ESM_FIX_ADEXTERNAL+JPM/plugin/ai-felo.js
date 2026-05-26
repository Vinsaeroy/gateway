import fetch from "node-fetch"

export const command = ["felo"]

export default async function (msg, { q, reply }) {
  try {
    if (!q) return reply("Contoh: .felo halo apa kabar")

    const apikey = "alpinstr"
    const url = `https://api.alpin-store.my.id/api/ai/felo?apikey=${encodeURIComponent(
      apikey
    )}&query=${encodeURIComponent(q)}`

    const res = await fetch(url, { method: "GET" })
    if (!res.ok) return reply(`Felo error (${res.status}). Coba lagi ya.`)

    const json = await res.json()
    const out = json?.result

    if (!out) return reply("Felo: respons kosong / format berubah.")

    reply(`🤖 *Felo*\n\n${out}`)
  } catch (e) {
    reply("Felo lagi error. Coba lagi nanti.")
  }
}