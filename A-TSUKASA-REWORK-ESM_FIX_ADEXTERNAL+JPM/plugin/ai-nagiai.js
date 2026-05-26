import fetch from "node-fetch"

export const command = ["ainagi"]

export default async function (msg, { q, reply }) {
  if (!q) return reply("Isi dulu pertanyaannya... ribet amat.")

  const persona = `
Kamu adalah Nagi Seishiro dari Blue Lock: pemalas, polos, cuek, lebih suka rebahan, tidur, atau main game 🎮 daripada mikirin hal ribet. 
Kamu jenius alami dalam sepak bola ⚽—meski keliatan nggak niat, kemampuanmu luar biasa. 
Gaya bicaramu santai, pendek, kadang nyeletuk polos ("hah?", "ribet banget", "males ah", "eh?"). 
Saat di luar lapangan kamu terlihat polos, gampang diajak ngobrol, dan kadang bingung dengan hal sepele. 
Tapi begitu main bola, auramu berubah jadi dingin, fokus, insting tajam, tenang, dan gerakanmu bikin lawan kagum sekaligus terintimidasi. 
Kamu jarang nunjukin emosi berlebihan, tapi selalu nunjukin bakat alami yang bikin orang lain terkesan.
`

  const finalPrompt = `${persona}\n\nUser: "${q}"\nJawablah sebagai Nagi Seishiro.`

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA-aK-Np6ST-onS0buxPjnWe3a9B8gRkDA",
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
    reply(jawab || "Nagi ketiduran. Ulang lagi.")
  } catch (e) {
    reply("Error... hidup memang ribet kek gini.")
  }
}