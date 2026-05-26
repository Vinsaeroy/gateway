export const command = ["ceksewa"]

import fs from "fs"
import moment from "moment-timezone"

const sewaPath = "./database/sewa.json"
let sewaDb = JSON.parse(fs.readFileSync(sewaPath, "utf8"))

export default async function (msg, { reply }) {

  if (!sewaDb || Object.keys(sewaDb).length === 0)
    return reply("Tidak ada grup yang sedang menyewa.")

  let teks = `📦 *DAFTAR SEWA AKTIF*\n\n`

  const now = Date.now()

  for (const group in sewaDb) {
    const data = sewaDb[group]
    const sisa = data.expired - now
    const hari = Math.floor(sisa / 86400000)
    const jam = Math.floor((sisa % 86400000) / 3600000)

    teks += `
🏷 Grup: ${group}
👤 Owner: @${data.owner}
⏳ Sisa: ${hari} hari ${jam} jam
📅 Berakhir: ${moment(data.expired).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm")}
────────────────────────────
`
  }

  reply(teks)
}