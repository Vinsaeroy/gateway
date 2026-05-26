import axios from "axios"
import "../config.js"

export const command = ["terabox", "tbx"]

function getMime(ext) {
  const mime = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    flac: "audio/flac",
    pdf: "application/pdf",
    txt: "text/plain",
    json: "application/json",
    zip: "application/zip",
    rar: "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    apk: "application/vnd.android.package-archive"
  }
  return mime[ext.toLowerCase()] || "application/octet-stream"
}

/* === GET CF TURNSTILE TOKEN === */
async function getCfToken() {
  const { data } = await axios.post(
    "https://api.nekolabs.web.id/tls/bypass/cf-turnstile",
    {
      url: "https://teraboxdl.site",
      siteKey: "0x4AAAAAACG0B7jzIiua8JFj"
    },
    {
      headers: { "Content-Type": "application/json" }
    }
  )
  return data?.result
}

/* === SCRAPE TERABOX === */
async function scrapeTerabox(targetUrl) {
  const token = await getCfToken()

  const { data } = await axios.post(
    "https://teraboxdl.site/api/proxy",
    {
      url: targetUrl,
      cf_token: token
    },
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Referer: "https://teraboxdl.site/",
        Origin: "https://teraboxdl.site"
      }
    }
  )

  return data
}

/* === HANDLER === */
export default async function (m, { riz, id, q, reply, msg }) {
  try {
    if (!q)
      return reply(
        "⚠️ Masukkan URL TeraBox\nContoh:\n.tbx https://1024terabox.com/s/xxxx"
      )

    reply(mess.wait)

    const res = await scrapeTerabox(q)
    if (!res || res.errno !== 0 || !res.list?.length)
      return reply("❌ Gagal mengambil data Terabox")

    const file = res.list[0]
    const fileUrl = file.direct_link || file.dlink
    const fileName = file.server_filename || "terabox_file"
    const ext = fileName.split(".").pop()
    const mimetype = getMime(ext)

    reply(`📁 *${fileName}*\n📥 Mengunduh file...`)

    const download = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    })

    await riz.sendMessage(
      id,
      {
        document: Buffer.from(download.data),
        fileName,
        mimetype
      },
      { quoted: msg }
    )
  } catch (e) {
    reply("❌ Error: " + e.message)
  }
}