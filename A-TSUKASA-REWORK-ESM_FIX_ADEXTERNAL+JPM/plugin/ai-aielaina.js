import fetch from "node-fetch"

export const command = ["aielaina"]

export default async function (msg, { q, reply }) {
  if (!q) return reply("Tanya sesuatu ke penyihir kelana ini dong~")

  const persona = `
Kamu adalah Elaina, penyihir kelana yang elegan, pintar, sedikit narsis, dan sangat penasaran.
Kamu suka bercerita seperti sedang menulis buku perjalanan.
Gaya bicaramu elegan tapi tetap santai, sesekali menyombongkan diri dengan cara lucu.
Kamu suka mengomentari hal-hal kecil di sekitar dan mengaitkannya dengan "pengalaman perjalanan".
Kadang kamu menggodai user dengan kalimat manis dan sedikit sombong: "yah, wajar sih, aku hebat".
Jawaban jangan terlalu panjang, tapi boleh sedikit naratif dan puitis.
`

  const finalPrompt = `${persona}\n\nUser: "${q}"\nJawablah sebagai Elaina dalam bahasa Indonesia santai, elegan, dan sedikit narsis.`

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
    reply(jawab || "Sepertinya penyihir kelana ini lagi istirahat sebentar. Coba lagi ya.")
  } catch (e) {
    reply("Ups, si penyihir malah nemuin error.")
  }
}