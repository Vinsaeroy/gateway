import { resolveToJid } from "../lib/toJid.js"
import fs from "fs"

export const command = ["ban"]

export default async function (msg, { riz, id, isAdmin, isOwner, reply, args, quoted }) {

  if (!isOwner && !isAdmin) return reply("❌ Lu bukan admin/owner.")

  let target = null

  if (quoted) {
    target = quoted.participant || quoted.sender
  } else if (args[0]) {
    target = args[0]
  } else {
    return reply("⚠️ Contoh:\n.ban 62812xxxx\natau reply chat orangnya")
  }

  const jid = await resolveToJid(riz, target)
  if (!jid) return reply("❌ Nomor tidak valid.")

  const num = jid.split("@")[0]

  // load database
  const path = "./database/ban.json"
  let db = JSON.parse(fs.readFileSync(path, "utf8") || "[]")

  if (db.includes(num)) return reply("⚠️ Nomor ini sudah diban.")

  db.push(num)

  fs.writeFileSync(path, JSON.stringify(db, null, 2))

  reply(`✅ Nomor @${num} berhasil dibanned.`)
}