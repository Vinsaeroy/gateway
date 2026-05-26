import fetch from "node-fetch"

export const command = ["muslimai"]

export default async function (msg, { q, reply }) {
  try {
    if (!q) {
      return reply("Contoh: .muslimai assalamualaikum")
    }

    const apikey = "alpinstr"
    const url = `https://api.alpin-store.my.id/api/ai/muslim?apikey=${encodeURIComponent(
      apikey
    )}&query=${encodeURIComponent(q)}`

    const res = await fetch(url, { method: "GET" })
    if (!res.ok) {
      return reply(`MuslimAI error (${res.status}). Coba lagi ya.`)
    }

    const json = await res.json()
    const out = json?.result

    if (!out) {
      return reply("MuslimAI: respons kosong / format berubah.")
    }

    reply(`${out}`)
  } catch (e) {
    reply("MuslimAI lagi error. Coba beberapa saat lagi.")
  }
}