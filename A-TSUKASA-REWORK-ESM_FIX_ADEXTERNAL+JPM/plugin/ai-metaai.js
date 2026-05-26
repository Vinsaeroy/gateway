export const command = ["metaai"]

import fetch from "node-fetch"

export default async (m, { q, reply, riz, msg, id }) => {
  try {
    if (!q) return reply("Contoh: .metaai Tell me a fun fact about space")

    await riz.sendMessage(id, { react: { text: "⏳", key: msg.key } })

    const url = `https://api.siputzx.my.id/api/ai/metaai?query=${encodeURIComponent(q)}`
    const res = await fetch(url, { method: "GET" })
    const json = await res.json()

    if (!json || json.status !== true || !json.data) {
      return reply("❌ Gagal mengambil jawaban dari MetaAI.")
    }

    const teks =
      `META:\n${json.data}\n`

    await riz.sendMessage(id, { react: { text: "✅", key: msg.key } })
    return reply(teks)
  } catch (e) {
    console.error("META-AI ERROR:", e)
    return reply("❌ Error: " + (e?.message || e))
  }
}