import axios from "axios"
import "../config.js"

export const command = ["flux", "fflux"]

export default async function (m, {
  riz, id, q, reply, msg, senderNum, isPremiumUser, getUserLimit, useUserLimit, DEFAULT_LIMIT
}) {
  try {
    if (!q)
      return reply("⚠️ Masukkan prompt.\nContoh:\n.flux kucing pakai jas cyberpunk")

    if (!isPremiumUser) {
        const bisa = useUserLimit(senderNum, 1);
        if (!bisa) {
            return reply(
                `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
            );
        }
    const sisa = getUserLimit(senderNum);
    reply(
        `🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
    );
}

    reply(mess.wait)

    const url = `https://fast-flux-demo.replicate.workers.dev/api/generate-image?text=${encodeURIComponent(
      q
    )}`

    const {
      data
    } = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
          "user-agent":
          "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome Mobile",
        },
      })

    const buffer = Buffer.from(data)

    await riz.sendMessage(
      id,
      {
        image: buffer,
        caption: `*Flux Image Generator*\nPrompt: ${q}`,
      },
      {
        quoted: msg
      }
    )
  } catch (e) {
    reply("❌ Error: " + e.message)
  }
}