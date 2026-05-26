export const command = ["delsewa"]

import fs from "fs"

const sewaPath = "./database/sewa.json"
let sewaDb = JSON.parse(fs.readFileSync(sewaPath, "utf8"))
const saveSewa = () => fs.writeFileSync(sewaPath, JSON.stringify(sewaDb, null, 2))

export default async function (msg, { q, reply, isOwner }) {
  if (!isOwner) return reply("Lu bukan owner.")

  if (!q) return reply("Contoh:\n.delsewa 12036302xxxx@g.us")

  if (!sewaDb[q]) return reply("Data sewa tidak ditemukan.")

  delete sewaDb[q]
  saveSewa()

  reply("Data sewa berhasil dihapus.")
}