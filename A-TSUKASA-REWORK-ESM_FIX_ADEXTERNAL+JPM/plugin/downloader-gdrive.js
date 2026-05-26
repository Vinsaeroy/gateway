export const command = ["gd", "gdrive"]

import "../config.js"
import axios from "axios"

export default async (m, {
  reply,
  msg,
  riz,
  qriz,
  q,
  id,
  isPremiumUser,
  useUserLimit,
  getUserLimit,
  senderNum,
  DEFAULT_LIMIT
}) => {

  if (!q)
    return reply("🔗 Masukkan URL Google Drive!\nContoh: *.gd https://drive.google.com/file/d/xxxx/view")

  if (!q.includes("drive.google.com"))
    return reply("⚠️ URL tidak valid, pastikan itu link Google Drive!")

  // === LIMIT SYSTEM ===
  if (!isPremiumUser) {
    const bisa = useUserLimit(senderNum, 1)
    if (!bisa) {
      return reply(
        `❌ Limit kamu sudah habis.\n\n` +
        `Silakan hubungi owner untuk isi ulang premium / limit:\n` +
        `${global.owner}`
      )
    }
    const sisa = getUserLimit(senderNum)
    reply(`🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`)
  }

  await riz.sendMessage(id, {
    react: { text: "⏳", key: msg.key }
  })

  try {
    const regex = /\/file\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/
    const match = q.match(regex)

    if (!match) {
      await riz.sendMessage(id, {
        react: { text: "❌", key: msg.key }
      })
      return reply("❌ Gagal mengambil File ID dari link.")
    }

    const fileId = match[1] || match[2]
    const directLink = `https://drive.google.com/uc?export=download&id=${fileId}`

    const head = await axios.head(directLink, {
      maxRedirects: 5,
      validateStatus: s => s >= 200 && s < 400,
      headers: { "User-Agent": "Mozilla/5.0" }
    })

    const contentType = head.headers["content-type"] || "application/octet-stream"
    const contentLength = parseInt(head.headers["content-length"] || "0")

    const MAX_SIZE = 200 * 1024 * 1024
    if (contentLength > MAX_SIZE) {
      await riz.sendMessage(id, {
        react: { text: "❌", key: msg.key }
      })
      return reply(
        `❌ Ukuran file terlalu besar.\n\n` +
        `📦 ${(contentLength / 1024 / 1024).toFixed(2)} MB\n` +
        `Maksimal: 200 MB`
      )
    }

    // === KIRIM SESUAI TYPE ===
    if (contentType.includes("video")) {
      await riz.sendMessage(id, {
        video: { url: directLink },
        caption: "🎬 GDrive Downloader",
        quoted: qriz
      })
    }

    else if (contentType.includes("image")) {
      await riz.sendMessage(id, {
        image: { url: directLink },
        caption: "🖼️ GDrive Downloader",
        quoted: qriz
      })
    }

    else if (contentType.includes("audio")) {
      await riz.sendMessage(id, {
        audio: { url: directLink },
        mimetype: "audio/mpeg",
        quoted: qriz
      })
    }

    else {
      await riz.sendMessage(id, {
        document: { url: directLink },
        mimetype: contentType,
        fileName: "GDrive_File",
        quoted: qriz
      })
    }

  } catch (err) {
    console.error("GDrive Plugin Error:", err)

    await riz.sendMessage(id, {
      react: { text: "❌", key: msg.key }
    })

    if (err.response?.status === 403 || err.response?.status === 404) {
      reply("❌ File private / tidak punya akses / sudah dihapus.")
    } else {
      reply("❌ Gagal mengunduh file Google Drive.")
    }
  } finally {
    await riz.sendMessage(id, {
      react: { text: "", key: msg.key }
    })
  }
}