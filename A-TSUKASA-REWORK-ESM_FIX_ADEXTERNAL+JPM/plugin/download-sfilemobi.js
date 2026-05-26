import '../config.js'
import axios from "axios"
import * as cheerio from "cheerio"
import fs from "fs"

const sfile = {
  createHeaders(referer) {
    return {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="137", "Google Chrome";v="137"',
      'dnt': '1',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'Referer': referer,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  extractCookies(headers) {
    return headers["set-cookie"]?.map(c => c.split(";")[0]).join("; ") || ""
  },

  extractMetadata($) {
    const meta = {}
    $(".file-content").eq(0).each((_, el) => {
      const $el = $(el)
      meta.file_name = $el.find("img").attr("alt") || "unknown"
      meta.mimetype = $el.find(".list").eq(0).text().trim().split("-")[1]?.trim() || "unknown"
      meta.upload_date = $el.find(".list").eq(2).text().trim().split(":")[1]?.trim() || "-"
      meta.download_count = $el.find(".list").eq(3).text().trim().split(":")[1]?.trim() || "0"
      meta.author_name = $el.find(".list").eq(1).find("a").text().trim() || "-"
    })
    return meta
  },

  async makeRequest(url, options) {
    try {
      return await axios.get(url, options)
    } catch (err) {
      if (err.response) return err.response
      throw new Error(`Request gagal: ${err.message}`)
    }
  },

  async download(url, resultBuffer = false) {
    try {
      const headers = this.createHeaders(url)
      const init = await this.makeRequest(url, { headers })
      const cookies = this.extractCookies(init.headers)
      headers["Cookie"] = cookies

      let $ = cheerio.load(init.data)
      const meta = this.extractMetadata($)
      const downloadUrl = $("#download").attr("href")
      if (!downloadUrl) throw new Error("URL download gak ditemukan")

      headers["Referer"] = downloadUrl
      const process = await this.makeRequest(downloadUrl, { headers })
      const html = process.data
      $ = cheerio.load(html)
      const scripts = $("script").map((_, el) => $(el).html()).get().join("\n")

      const finalUrlRegex = /https:\\\/\\\/download\d+\.sfile\.mobi\\\/downloadfile\\\/\d+\\\/\d+\\\/[a-z0-9]+\\\/[^\s'"]+\.[a-z0-9]+(\?[^"']+)?/gi
      const matches = scripts.match(finalUrlRegex)
      if (!matches?.length) throw new Error("Link download final gak ditemukan di script")

      const finalUrl = matches[0].replace(/\\\//g, "/")

      if (resultBuffer) {
        const res = await axios.get(finalUrl, {
          headers,
          responseType: "arraybuffer"
        })
        return { metadata: meta, download: Buffer.from(res.data) }
      } else {
        return { metadata: meta, download: finalUrl }
      }
    } catch (err) {
      throw new Error(`Sfile gagal: ${err.message}`)
    }
  }
}

export const command = ["sfile", "sfiledl"]

export default async (m, { riz, reply, id, qriz, q }) => {
  try {
    if (!q) return reply("⚠️ Contoh: .sfile https://sfile.mobi/xxxx")
    if (!q.includes("sfile.mobi")) return reply("❌ Linknya bukan dari sfile.mobi!")

    reply(mess.wait)

    const { metadata, download } = await sfile.download(q, false)

    const caption = `📦 *SFILE DOWNLOADER*\n\n`
      + `📝 *Nama:* ${metadata.file_name}\n`
      + `📂 *Tipe:* ${metadata.mimetype}\n`
      + `👤 *Author:* ${metadata.author_name}\n`
      + `📅 *Upload:* ${metadata.upload_date}\n`
      + `⬇️ *Unduhan:* ${metadata.download_count}\n\n`

    // cek ukuran file
    const head = await axios.head(download).catch(() => ({}))
    const size = parseInt(head.headers?.["content-length"] || 0)
    const sizeMB = (size / (1024 * 1024)).toFixed(2)

    if (size && sizeMB < 50) {
      await riz.sendMessage(id, {
        document: { url: download },
        fileName: metadata.file_name,
        mimetype: metadata.mimetype,
        caption: `${caption}💾 *Ukuran:* ${sizeMB} MB\n✅ File dikirim langsung.`
      }, { quoted: qriz })
    } else {
      await riz.sendMessage(id, {
        text: `${caption}💾 *Ukuran:* ${sizeMB || "?"} MB\n🔗 *Link:* ${download}`
      }, { quoted: qriz })
    }

  } catch (e) {
    console.error("❌ Sfile Error:", e)
    reply(`⚠️ Gagal ambil data dari Sfile: ${e.message}`)
  }
}
