export const command = ["kbbi"]

const X = "https://api-faa.my.id/faa/kbbi?q="

export default async (m, { q, reply, riz, id, qriz, msg }) => {
  try {
    if (!q) return reply("❌ Contoh: *.kbbi tidur*")

    await riz.sendMessage(id, { react: { text: "📖", key: m.key } })

    const url = XI + encodeURIComponent(q)
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0" }
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    if (!json?.status) return reply("❌ Data tidak ditemukan / API error.")

    const kata = json?.result?.kata || json?.query || q
    const ketRaw = (json?.result?.keterangan || "-").trim()

    const ket =
      ketRaw.length > 4000 ? ketRaw.slice(0, 4000) + "..." : ketRaw

    const text =
`📚 *KBBI*
*Kata:* ${kata}

${ket}`

    await riz.sendMessage(id, { text }, { quoted: qriz })
    await riz.sendMessage(id, { react: { text: "✅", key: m.key } })
  } catch (err) {
    console.error("KBBI ERROR:", err)
    try {
      await riz.sendMessage(id, { react: { text: "❌", key: m.key } })
    } catch {}
    reply("❌ Error saat ambil data KBBI.")
  }
}