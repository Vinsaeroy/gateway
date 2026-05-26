export const command = ["addwarn", "delwarn"]

import fs from "fs"
import { jidNormalizedUser } from "baileys"
import"../config.js"

const warnPath = "./database/warns.json"
const moderationPath = "./database/moderation.json"

function loadJSON(path, fallback) {
    try {
        if (!fs.existsSync(path)) {
            fs.writeFileSync(path, JSON.stringify(fallback, null, 2))
            return fallback
        }
        const raw = fs.readFileSync(path, "utf8")
        const data = JSON.parse(raw || "")
        return data ?? fallback
    } catch {
        return fallback
    }
}

function saveJSON(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

function pickTargetJid(msg, ctx) {
    const mentions =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    if (mentions.length) return jidNormalizedUser(mentions[0])

    const qp = msg.message?.extendedTextMessage?.contextInfo?.participant
    if (qp) return jidNormalizedUser(qp)

    const num = (ctx.args?.[0] || "").replace(/[^0-9]/g, "")
    if (num) return jidNormalizedUser(num + "@s.whatsapp.net")

    return null
}

export default async function run(m, ctx) {
    const {
        riz,
        msg,
        id,
        command,
        args,
        reply,
        isGroup,
        isAdmin,
        isOwner,
        isBotAdmin
    } = ctx

    if (!isGroup) return reply(mess.group)
    if (!isAdmin) return reply(mess.admin)

    const db = loadJSON(warnPath, {})
    const mod = loadJSON(moderationPath, {})

    const limit = mod?.[id]?.warnsToKick || 3
    const target = pickTargetJid(msg, ctx)

    if (!target)
        return reply(
            `❌ Tag / reply user atau isi nomor\n\nContoh:\n.addwarn @tag\n.addwarn @tag 2\n.reply chat + .addwarn 2`
        )

    let amount = 1
    if (args[1]) {
        const n = parseInt(args[1])
        if (!isNaN(n) && n > 0) amount = n
    } else if (args[0] && /^\d+$/.test(args[0])) {
        const n = parseInt(args[0])
        if (!isNaN(n) && n > 0) amount = n
    }

    db[id] = db[id] || {}
    const before = Number(db[id][target] || 0)

    if (command === "addwarn") {
        db[id][target] = before + amount
        saveJSON(warnPath, db)

        const now = db[id][target]

        await riz.sendMessage(
            id,
            {
                text: `⚠️ ADD WARN\nUser: @${target.split("@")[0]}\nWarn: ${before} ➜ ${now} / ${limit}`,
                mentions: [target]
            },
            { quoted: msg }
        )

        if (now >= limit && isBotAdmin) {
            try {
                await riz.groupParticipantsUpdate(id, [target], "remove")
                db[id][target] = 0
                saveJSON(warnPath, db)

                await riz.sendMessage(
                    id,
                    {
                        text: `👢 @${target.split("@")[0]} dikeluarkan karena warn penuh`,
                        mentions: [target]
                    },
                    { quoted: msg }
                )
            } catch {}
        }
        return
    }

    if (command === "delwarn") {
        const after = Math.max(0, before - amount)
        db[id][target] = after
        saveJSON(warnPath, db)

        return riz.sendMessage(
            id,
            {
                text: `✅ DEL WARN\nUser: @${target.split("@")[0]}\nWarn: ${before} ➜ ${after} / ${limit}`,
                mentions: [target]
            },
            { quoted: msg }
        )
    }
}