import fs from "fs"
import path from "path"
import axios from "axios"
import { downloadContentFromMessage } from "baileys"

/* ================= CONFIG ================= */
const GITHUB_TOKEN = "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"
const GITHUB_OWNER = "Rizkygamers"
const GITHUB_REPO = "waifuim-img"
const GITHUB_BRANCH = "main"
const MAX_SIZE = 30 * 1024 * 1024 // 30MB

/* ================= COMMAND ================= */
export const command = ["upgh"]

export default async function handler(m, { msg, reply }) {
  try {
    const quoted =
      msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
      msg?.message

    if (!quoted) return reply("❌ Reply media dulu")

    const mediaType = Object.keys(quoted).find(t =>
      [
        "imageMessage",
        "videoMessage",
        "audioMessage",
        "documentMessage",
        "stickerMessage"
      ].includes(t)
    )

    if (!mediaType) return reply("❌ Media tidak didukung")

    const size = quoted[mediaType]?.fileLength || 0
    if (size > MAX_SIZE)
      return reply("❌ File terlalu besar (maks 30MB)")

    const stream = await downloadContentFromMessage(
      quoted[mediaType],
      mediaType.replace("Message", "")
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream)
      buffer = Buffer.concat([buffer, chunk])

    if (!buffer.length) throw "Gagal download media"

    let ext = ".bin"
    const mime = quoted[mediaType]?.mimetype || ""

    if (/image/.test(mime)) ext = ".jpg"
    else if (/video/.test(mime)) ext = ".mp4"
    else if (/audio/.test(mime)) ext = ".mp3"
    else if (mediaType === "stickerMessage") ext = ".webp"
    else if (mediaType === "documentMessage") {
      ext = path.extname(quoted[mediaType]?.fileName || ".bin")
    }

    const prefix = mediaType.replace("Message", "")
    const filename = `${prefix}-${Date.now()}${ext}`
    const repoPath = `uploads/${filename}`

    const uploadUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`

    const body = {
      message: `upload ${filename}`,
      content: buffer.toString("base64"),
      branch: GITHUB_BRANCH
    }

    const res = await axios.put(uploadUrl, body, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "User-Agent": "wa-bot-upgh"
      }
    })

    if (![200, 201].includes(res.status))
      throw "Upload ke GitHub gagal"

    const rawUrl =
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}` +
      `/${GITHUB_BRANCH}/${repoPath}`
    
    reply(rawUrl)

  } catch (e) {
    console.error("UPGH ERROR:", e)
    reply("❌ Gagal upload ke GitHub")
  }
}