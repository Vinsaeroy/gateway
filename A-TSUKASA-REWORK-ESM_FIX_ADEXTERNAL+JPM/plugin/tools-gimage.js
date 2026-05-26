export const command = ["gimage", "googleimage"]

import gis from "../scrape/gimg.js"
import "../config.js"

export default async (m, { riz, id, q, reply, qriz }) => {
  async function sendAlbum(jid, items = [], options = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Album harus berisi minimal 1 item")
    }

    const { delay, caption, ...msgOptions } = options

    if (typeof delay === "number" && delay > 0) {
      await new Promise(res => setTimeout(res, delay))
    }

    return riz.sendMessage(
      jid,
      {
        album: items,
        ...(caption ? { caption } : {})
      },
      msgOptions
    )
  }

  if (!q) return reply("❌ Contoh: *.gimage rumah modern*")

  await reply(mess.wait)

  try {
    const results = await gis(q, { query: { safe: "active" } })

    const list = Array.isArray(results)
      ? results
          .map(v => v?.url)
          .filter(u => typeof u === "string" && /^https?:\/\//i.test(u))
      : []

    if (list.length === 0) return reply("⚠️ Tidak ada hasil ditemukan.")

    const uniq = [...new Set(list)]

    for (let i = uniq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[uniq[i], uniq[j]] = [uniq[j], uniq[i]]
    }

    const take = uniq.length >= 4 ? 4 : uniq.length >= 2 ? 2 : 1
    const chosen = uniq.slice(0, take)

    const items = chosen.map(url => ({ image: { url } }))
    await sendAlbum(id, items, {
      caption: `🔎 *Google Image*\nQuery: ${q}`,
      quoted: qriz,
      delay: 100
    })
  } catch (err) {
    console.error("GIMAGE Error:", err)
    reply("❌ Gagal ambil gambar dari Google.")
  }
}