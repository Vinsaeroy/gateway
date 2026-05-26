import "../config.js"

export const command = ["kick", "k", "dor", "usir"]

export default async function (msg, {
  riz, id, isGroup, participants = [], reply, args = [], qriz, isAdmin, isBotAdmin, quoted, sender
}) {
  try {
    if (!isGroup) return reply(mess.group)
    if (!isAdmin) return reply(mess.admin)
    if (!isBotAdmin) return reply("Bot bukan admin.")

    const delay = ms => new Promise(res => setTimeout(res, ms))

    const resolveToJid = async (input) => {
      if (!input) return null

      if (typeof input === "object") {
        const maybe = input.participant || input.sender || input.key?.participant || input.key?.remoteJid
        if (maybe) input = maybe
        else return null
      }

      input = String(input)

      try {
        if (input.includes("@lid") || /^[a-z0-9_-]{10,}@lid$/.test(input)) {
          const mapped = await riz?.lidMappingStore?.getPNForLID?.(input)
          if (mapped) return mapped
        }
      } catch (e) {}

      if (input.includes("@")) return input

      let digits = input.replace(/\D/g, "")
      if (!digits) return null
      if (digits.startsWith("0")) digits = "62" + digits.slice(1)
      else if (digits.startsWith("8")) digits = "62" + digits
      return `${digits}@s.whatsapp.net`
    }

    let targets = []

    if (quoted) {
      const qCandidate = quoted.participant || quoted.sender || quoted.key?.participant || quoted.key?.remoteJid || quoted
      const jid = await resolveToJid(qCandidate)
      if (jid) targets.push(jid)
    }

    if (msg?.mentioned && Array.isArray(msg.mentioned) && msg.mentioned.length) {
      for (const m of msg.mentioned) {
        const jid = await resolveToJid(m)
        if (jid) targets.push(jid)
      }
    }

    if (args && args.length > 0) {
      for (let arg of args) {
        const jid = await resolveToJid(arg)
        if (jid) targets.push(jid)
      }
    }

    targets = [...new Set(targets)]
    .filter(Boolean)
    .filter(v => v !== sender)
    .filter(v => participants.some(p => (p.jid === v) || (p.lid === v)))

    if (targets.length === 0)
      return reply(`⚠️ Masukkan nomor atau reply anggota yang mau dikick!\n\nContoh:\n.kick 62812xxxx`)

    for (let target of targets) {
      try {
        await riz.groupParticipantsUpdate(id, [target], "remove")
        await riz.sendMessage(id, {
          text: `🔫 *Dikeluarkan dari grup:* @${target.split("@")[0]}`,
          mentions: [target]
        }, {
          quoted: qriz
        })
        await delay(1000)
      } catch (err) {
        await riz.sendMessage(id, {
          text: `❌ *Gagal mengeluarkan:* @${target.split("@")[0]}\n> ${err?.message || "Tidak diketahui"}`,
          mentions: [target]
        }, {
          quoted: qriz
        })
      }
    }
  } catch (e) {
    reply("❌ Terjadi kesalahan saat menjalankan perintah kick.")
  }
}