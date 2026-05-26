export const command = ["kerang", "kerangajaib"]

export default async function (m, { riz, reply, q, id }) {
  try {

    if (!q) return reply(`Gunakan: .kerang <pertanyaan>\nContoh: .kerang apakah aku jago ngoding?`)

    const jawaban = [
      "Mungkin suatu hari",
      "Tidak juga",
      "Tidak keduanya",
      "Kurasa tidak",
      "Ya",
      "Coba tanya lagi",
      "Tidak ada"
    ]

    const hasil = jawaban[Math.floor(Math.random() * jawaban.length)]

    await riz.sendMessage(id, {
      react: { text: "🐚", key: m.key }
    })

    await reply(`🐚 *Kerang Ajaib Menjawab...*\n\n"${hasil}."`)

    await riz.sendMessage(id, {
      react: { text: "✅", key: m.key }
    })

  } catch (err) {
    console.error("❌ Kerang Error:", err)
    reply("⚠️ Kerang lagi tidur, coba tanya lagi nanti.")
  }
}