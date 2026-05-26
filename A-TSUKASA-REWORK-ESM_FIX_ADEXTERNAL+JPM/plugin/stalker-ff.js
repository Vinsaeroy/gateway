import axios from "axios"

export const command = ["ffstalk"]

export default async function (m, { riz, q, reply, usedPrefix, command, qriz, id }) {
  try {
    if (!q) return reply(`Ex: .${command} 2775229425`)

    reply("wait...")

    const url = `https://api.deline.web.id/stalker/stalkff?id=${q}`
    const { data } = await axios.get(url)

    if (!data?.status) return reply("Gagal mengambil data FF!")

    const res = data.result

    const teks = `*Free Fire Stalker*

- 🆔 *Player ID:* ${res.player_id}
- 👤 *Nickname:* ${res.nickname}
- 🎮 *Game:* ${res.game}
- 📡 *Status:* ${res.status}`

    await riz.sendMessage(id, { text: teks }, { quoted: qriz })

  } catch (err) {
    console.error("FFSTALK ERROR:", err)
    reply("Error bang, mungkin ID nya salah!")
  }
}