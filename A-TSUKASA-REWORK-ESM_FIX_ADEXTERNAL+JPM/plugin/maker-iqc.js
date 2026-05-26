export const command = ["iponqc", "iqc"]
import "../config.js"

import axios from "axios"

function getWIBHHMM() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date())
}

export default async (m, { reply, q, riz, id, qriz, isPremiumUser, useUserLimit, senderNum, getUserLimit, DEFAULT_LIMIT, reactm}) => {
  if (!q) return reply(`Gunakan: .iqc pesan\nContoh: .iqc Halo bro`)
  
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

  try {
    reactm("⏳️")

    const wibTime = getWIBHHMM()

    const params = new URLSearchParams({
      text: q,
      chatTime: wibTime,
      statusBarTime: wibTime,
    })

    const url = `https://api.deline.web.id/maker/iqc?${params.toString()}`

    const res = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 20000,
      headers: { accept: "*/*" },
    })

    const buffer = Buffer.from(res.data)
    await riz.sendMessage(id, { image: buffer, caption: "" }, { quoted: qriz })
    reactm("✅️")
  } catch (err) {
    console.error("IQC Error:", err)
    reply(mess.error)
  }
}