export const command = ["jpmswgc"]
import "../config.js"

import {
  downloadContentFromMessage,
  generateWAMessageContent,
  getContentType,
} from "baileys"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function streamToBuffer(stream) {
  let buff = Buffer.from([])
  for await (const chunk of stream) buff = Buffer.concat([buff, chunk])
  return buff
}

export default async (msg, { riz, reply, q, reactm, isOwner }) => {
  try {
    if (!isOwner) return reply(mess.owner)

    const raw = (q || "").trim()
    if (!raw)
      return reply(
        "Contoh:\n.jpmswgc Halo semua|1000\n\nWajib reply foto/video/teks untuk dijadikan SWGC"
      )

    const [teksRaw, delayRaw] = raw.split("|")
    const teks = (teksRaw || "").trim()
    const delayMs = Math.max(0, Number((delayRaw || "").trim()) || 0)

    const ct = getContentType(msg.message)
    const cur = msg.message?.[ct]
    const ctx = cur?.contextInfo
    const quoted = ctx?.quotedMessage

    let sourceMsg = quoted
    let sourceType = sourceMsg ? Object.keys(sourceMsg)[0] : null

    if (!sourceMsg) {
      if (ct === "imageMessage" || ct === "videoMessage") {
        sourceMsg = msg.message
        sourceType = ct
      }
    }

    if (!sourceMsg || !sourceType)
      return reply(
        "❌ Harus reply pesan (foto/video/teks) atau kirim command di caption foto/video."
      )

    let innerContent = null

    if (sourceType === "imageMessage") {
      const img = sourceMsg.imageMessage || msg.message.imageMessage
      const stream = await downloadContentFromMessage(img, "image")
      const buffer = await streamToBuffer(stream)

      innerContent = await generateWAMessageContent(
        { image: buffer, caption: teks || img.caption || "" },
        { upload: riz.waUploadToServer }
      )
    } else if (sourceType === "videoMessage") {
      const vid = sourceMsg.videoMessage || msg.message.videoMessage
      const stream = await downloadContentFromMessage(vid, "video")
      const buffer = await streamToBuffer(stream)

      innerContent = await generateWAMessageContent(
        { video: buffer, caption: teks || vid.caption || "" },
        { upload: riz.waUploadToServer }
      )
    } else {
      const qText =
        sourceMsg.conversation ||
        sourceMsg.extendedTextMessage?.text ||
        cur?.text ||
        cur?.caption ||
        ""

      innerContent = await generateWAMessageContent(
        { text: teks || qText || "" },
        {}
      )
    }

    if (!innerContent) return reply("❌ Gagal bikin konten untuk SWGC.")

    await reactm("⏳")
    const groups = await riz.groupFetchAllParticipating()
    const groupIds = Object.keys(groups || {})

    let sent = 0
    let skipped = 0
    let failed = 0

    for (const gid of groupIds) {
      try {
        const g = groups[gid] || {}
        const size =
          (Array.isArray(g.participants) && g.participants.length) ||
          g.size ||
          0

        if (size < 2) {
          skipped++
          continue
        }

        const WAMC = {
          groupStatusMessageV2: {
            message: innerContent,
          },
        }

        await riz.relayMessage(gid, WAMC, {})
        sent++

        if (delayMs) await sleep(delayMs)
      } catch {
        failed++
      }
    }

    await reactm("✅")
    return reply(
      `✓ JPMSWGC selesai.\n` +
        `• Terkirim : ${sent}\n` +
        `• Skip (<2 member) : ${skipped}\n` +
        `• Gagal : ${failed}\n` +
        (delayMs ? `\n• Delay : ${delayMs} ms` : "")
    )
  } catch (e) {
    await reactm("❌")
    return reply("❌ Error: " + (e?.message || e))
  }
}