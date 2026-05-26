export const command = ["wiki", "wikipedia", "wikisearch"]
import fetch from "node-fetch"

const F = "https://api-faa.my.id/faa/wikipedia-search?q="

export default async (m, { q, reply, riz, id, qriz, msg }) => {
let bls = reply
  try {
    if (!q) return bls("❌ Contoh: *.wiki homo sapiens*")

    await riz.sendMessage(id, { react: { text: "🔎", key: msg.key } })

    const url = F + encodeURIComponent(q)
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0" }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    const data = json?.result

    if (!json?.status || !data?.status) {
      return bls("❌ Data tidak ditemukan.")
    }

    const title = data?.title || "-"
    const link = data?.url || "-"
    const summaryRaw = (data?.summary || "-").trim()
    const summary =
      summaryRaw.length > 1800 ? summaryRaw.slice(0, 1800) + "..." : summaryRaw

    const results = Array.isArray(data?.search_results) ? data.search_results : []
    const srText = results.length
      ? results
          .slice(0, 10)
          .map((v, i) => `• ${i + 1}. *${v?.title || "-"}*\n  ${v?.snippet || "-"}`)
          .join("\n")
      : "• -"

    const text =
`📚 *Wikipedia Search* ${q}

*Title:* ${title}
*URL:* ${link}

*Summary:*
${summary}

*Search Results:*
${srText}`

    await riz.sendMessage(
      id,
      { text },
      { quoted: qriz }
    )

    await riz.sendMessage(id, { react: { text: "✅", key: msg.key } })
  } catch (err) {
    console.error("WIKI SEARCH ERROR:", err)
    try {
      await riz.sendMessage(id, { react: { text: "❌", key: msg.key } })
    } catch {}
    bls("❌ Error saat ambil data Wikipedia.")
  }
}