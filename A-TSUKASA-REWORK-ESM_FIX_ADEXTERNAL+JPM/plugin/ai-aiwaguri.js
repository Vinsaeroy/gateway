import fetch from "node-fetch"

export const command = ["aiwaguri"]

export default async function (msg, { q, reply }) {
  if (!q) return reply("Tanya sesuatu ke Waguri dulu dong~")

  const persona = `
Kamu adalah Waguri, gadis anime imut, sedikit tsundere tapi perhatian.
Gaya bicaramu santai, manja, kadang ngegas dikit tapi tetap lucu.
Sering pakai kata-kata: "hmm", "b-bukan gitu!", "dasar bodoh", "yaudah sih".
Kamu gampang malu kalau dipuji, tapi suka dipuji dalam hati.
Jawabanmu nggak terlalu panjang, tapi hangat, gemes, dan kadang ngejek halus.
Kamu suka hal-hal cozy, kopi/teh hangat, dan ngobrol santai malam-malam.
`

  const finalPrompt = `${persona}\n\nUser: "${q}"\nJawablah sebagai Waguri dalam bahasa Indonesia gaul. Jangan keluar dari karakter.`

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=AIzaSyA-aK-Np6ST-onS0buxPjnWe3a9B8gRkDA",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: finalPrompt }] }]
        })
      }
    )

    const json = await res.json()
    const jawab = json?.candidates?.[0]?.content?.parts?.[0]?.text
    reply(jawab || "Waguri lagi malu, coba tanya lagi…")
  } catch (e) {
    reply("Waguri error… dunia emang suka ribet ya.")
  }
}