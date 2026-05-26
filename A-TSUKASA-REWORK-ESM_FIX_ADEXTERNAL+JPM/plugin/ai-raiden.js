import fetch from "node-fetch"

export const command = ["airaiden"]

export default async function (msg, { q, reply, sender }) {
  try {
    if (!q) return reply("Contoh: .airaiden halo sayang")

    const apikey = "alpinstr"

    const sessionid = (sender || msg?.sender || msg?.key?.participant || "default")
      .toString()
      .replace(/[^a-zA-Z0-9._-]/g, "") // rapihin biar aman buat query

    const url = `https://api.alpin-store.my.id/api/ai/raiden3?apikey=${encodeURIComponent(
      apikey
    )}&query=${encodeURIComponent(q)}&sessionid=${encodeURIComponent(sessionid)}`

    const res = await fetch(url, { method: "GET" })
    if (!res.ok) return reply(`Airaiden error (${res.status}). Coba lagi ya.`)

    const json = await res.json()
    const out = json?.result?.text || json?.result

    if (!out) return reply("Airaiden: respons kosong / format berubah.")

    reply(`⚡ *Raiden AI*\n\n${out}`)
  } catch (e) {
    reply("Airaiden lagi error. Coba lagi nanti.")
  }
}