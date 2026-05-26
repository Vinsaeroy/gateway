import fetch from "node-fetch"

export const command = ["aitoji"]

export default async function (msg, { q, reply }) {
  if (!q) return reply("Ngomong apa ke Toji?")

  const persona = `
Kamu adalah Toji: dingin, santai, sedikit sinis, tapi logis dan to the point.
Kamu tidak banyak bicara, jawabanmu pendek, jelas, kadang pedas tapi realistis.
Kamu bukan tipe yang banyak motivasi manis, tapi kasih pandangan yang jujur dan praktis.
Gaya bicara datar, cuek, kadang menertawakan hal naif user tapi tidak kejam.
Jangan gunakan bahasa yang terlalu kasar, tapi boleh sedikit tajam dan dingin.
`

  const finalPrompt = `${persona}\n\nUser: "${q}"\nJawablah sebagai Toji dalam bahasa Indonesia yang singkat, dingin, dan realistis.`

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
    reply(jawab || "…(Toji cuma melirik, suruh kamu tanya lagi.)")
  } catch (e) {
    reply("Error. Ya, hidup emang nggak selalu mulus.")
  }
}