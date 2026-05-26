export const command = ["sewa"]

import axios from "axios"
import moment from "moment-timezone"
import fs from 'fs';

const sewaPath = "./database/sewa.json"
let sewaDb = {}
try {
  sewaDb = JSON.parse(fs.readFileSync(sewaPath, "utf8"))
} catch {
  sewaDb = {}
  fs.writeFileSync(sewaPath, JSON.stringify({}, null, 2))
}

const saveSewa = () => fs.writeFileSync(sewaPath, JSON.stringify(sewaDb, null, 2))

export default async function(msg, { riz, id, sender, q, reply, isOwner }) {
  if (!isOwner) return reply("Lu bukan owner bang… mau nyewain bot? hehehe")

  if (!q.includes("|")) return reply(`Format salah!\nContoh:\n.sewa 5|https://chat.whatsapp.com/xxxx`)

  let [hari, link] = q.split("|")
  hari = parseInt(hari)

  if (isNaN(hari)) return reply("Jumlah harinya angka lah bro…")
  if (!link.includes("chat.whatsapp.com")) return reply("Link GC nya salah cok.")

  reply("Bentar, lagi join…")

  const match = link.trim().match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,})/i);
  const code = match?.[1];

  if (!code) return reply("Link GC nya salah cok. Pastikan format: https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXX");

  let res = await riz.groupAcceptInvite(code).catch(e => null);
  if (!res) return reply("Gagal join, link expired atau bot diblokir grup itu.")

  const groupId = res
  const waktuAkhir = Date.now() + hari * 24 * 60 * 60 * 1000

  sewaDb[groupId] = {
    owner: sender,
    expired: waktuAkhir,
    days: hari
  }
  saveSewa()

  await riz.sendMessage(groupId, {
    text: `🤖 Bot masuk karena disewa!\nDurasi: *${hari} hari*\nOwner: @${sender.split("@")[0]}`,
    mentions: [sender]
  })

  reply(`Sewa berhasil!\nGrup: ${groupId}\nDurasi: ${hari} hari`)
}