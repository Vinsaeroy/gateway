import "../config.js"

export const command = ["listsurah", "listSurah", "surahlist"]

export default async (m, { riz, reply, id }) => {
  try {
    const { default: axios } = await import("axios")
    const res = await axios.get("https://api.alquran.cloud/v1/surah", { timeout: 20000 })

    const data = res?.data?.data
    if (!Array.isArray(data) || !data.length) return reply("❌ Gagal ambil data surah.")

    const header =
      `📚 *DAFTAR SURAH AL-QUR'AN*\n` +
      `Total: *${data.length} surah*\n\n`

    const lines = data.map((s) => {
      const no = s.number
      const nameAr = s.name
      const en = s.englishName || "-"
      const ayat = s.numberOfAyahs ?? "-"
      const rev = (s.revelationType || "-").toLowerCase()
      const turun =
        rev.includes("mecc") ? "Makkiyah" :
        rev.includes("medin") ? "Madaniyah" :
        s.revelationType || "-"

      return `*${no}.* ${nameAr} (${en}) — *${ayat} ayat* — *${turun}*`
    })

    const text = header + lines.join("\n")

    await riz.sendMessage(id, { text }, { quoted: m })
  } catch (e) {
    console.error("listsurah error:", e)
    reply("⚠️ Error saat memuat daftar surah.")
  }
}