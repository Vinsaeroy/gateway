import { resolveToJid } from "../lib/toJid.js"
import fs from "fs"

export const command = ["unban"]

export default async function (msg, { reply, args, quoted, riz }) {
  let target = null

  if (quoted) {
    target = quoted.participant || quoted.sender
  } else if (args[0]) {
    target = args[0]
  } else {
    return reply("Contoh: .unban 628xxx")
  }

  const jid = await resolveToJid(riz, target)
  if (!jid) return reply("❌ Nomor tidak valid.")

  const num = jid.split("@")[0]

  let db = JSON.parse(fs.readFileSync("./database/ban.json", "utf8") || "[]")

  if (!db.includes(num)) return reply("⚠️ Nomor ini tidak ada di list ban.")

  db = db.filter(x => x !== num)

  fs.writeFileSync("./database/ban.json", JSON.stringify(db, null, 2))

  reply(`✅ Nomor @${num} sudah di-unban.`)
}