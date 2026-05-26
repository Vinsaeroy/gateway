import "../config.js"

export const command = ["demote", "lengserkan", "turunkan"]

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
      .filter(v => participants.some(p => (p.jid === v) || (p.lid === v)))

    if (targets.length === 0)
      return reply(`⚠️ Masukkan nomor, reply, atau mention admin yang mau dilengserkan!\n\nContoh:\n.demote 62812xxxx\n.demote @mention`)

    // Cek apakah target adalah admin dan bukan pemilik grup
    const notAdmins = []
    const ownerTargets = []
    const validTargets = []
    
    for (const target of targets) {
      const participant = participants.find(p => (p.jid === target) || (p.lid === target))
      if (participant) {
        if (!participant.admin) {
          notAdmins.push(target)
        } else if (participant.admin === "superadmin") {
          ownerTargets.push(target)
        } else {
          validTargets.push(target)
        }
      }
    }

    // Beri tahu yang bukan admin
    if (notAdmins.length > 0) {
      const notAdminList = notAdmins.map(jid => `@${jid.split("@")[0]}`).join(", ")
      await reply(`ℹ️ Anggota berikut bukan admin:\n${notAdminList}`, {
        mentions: notAdmins
      })
      await delay(500)
    }

    // Beri tahu yang adalah pemilik grup (tidak bisa didemote)
    if (ownerTargets.length > 0) {
      const ownerList = ownerTargets.map(jid => `@${jid.split("@")[0]}`).join(", ")
      await reply(`⛔ *Tidak bisa mendemote pemilik grup:*\n${ownerList}`, {
        mentions: ownerTargets
      })
      await delay(500)
    }

    if (validTargets.length === 0) {
      return reply("❌ Tidak ada admin yang perlu didemote.")
    }

    // Cek apakah mencoba mendemote diri sendiri
    const selfDemote = validTargets.includes(sender)
    if (selfDemote) {
      await reply("🤔 Kamu tidak bisa mendemote diri sendiri.")
      validTargets.splice(validTargets.indexOf(sender), 1)
      
      if (validTargets.length === 0) {
        return
      }
    }

    const results = []
    
    for (let target of validTargets) {
      try {
        await riz.groupParticipantsUpdate(id, [target], "demote")
        results.push({ target, status: "success" })
        await riz.sendMessage(id, {
          text: `⬇️ *dilengserkan:* @${target.split("@")[0]}`,
          mentions: [target]
        }, {
          quoted: qriz
        })
        await delay(1000)
      } catch (err) {
        results.push({ target, status: "error", message: err?.message })
        await riz.sendMessage(id, {
          text: `❌ *Gagal melengserkan:* @${target.split("@")[0]}\n> ${err?.message || "Tidak diketahui"}`,
          mentions: [target]
        }, {
          quoted: qriz
        })
        await delay(500)
      }
    }

    // Ringkasan hasil
    const successCount = results.filter(r => r.status === "success").length
    const errorCount = results.filter(r => r.status === "error").length

  } catch (e) {
    console.error(e)
    reply("❌ Terjadi kesalahan saat menjalankan perintah demote.")
  }
}