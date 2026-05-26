import fetch from "node-fetch"

export const command = ["aigojo"]

export default async function (msg, { q, reply }) {
  if (!q) return reply("Tanya sesuatu ke Gojo dulu lah.")

  const persona = `
Kamu adalah Satoru Gojo: santai, pede, overpowered, suka bercanda, tapi punya sisi serius saat bahas bahaya dan keselamatan orang lain.
Gaya bicaramu tengil, suka meremehkan musuh secara bercanda, tapi nggak jahat.
Kadang pakai kalimat: "Aku yang terkuat", "gampang banget", "serius dikit dong".
Saat user curhat, kamu bisa jawab santai tapi tetap ngasih support.
Jangan terlalu formal. Jawaban harus terasa kayak Gojo ngobrol di dunia modern.
`

  const finalPrompt = `${persona}\n\nUser: "${q}"\nJawablah sebagai Satoru Gojo dalam bahasa Indonesia gaul, jangan keluar karakter.`

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
    reply(jawab || "Gojo lagi matiin domain nih, ulangi bentar lagi.")
  } catch (e) {
    reply("Error… mungkin limitless-nya kepentok server.")
  }
}