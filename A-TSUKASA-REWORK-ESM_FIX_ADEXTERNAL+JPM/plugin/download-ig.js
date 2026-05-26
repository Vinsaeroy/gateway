export const command = ["ig", "igdl", "instagram"]

import axios from "axios"
import * as cheerio from "cheerio"

export default async (m, {
  reply, msg, riz, qriz, q, id,
  isPremiumUser, useUserLimit, getUserLimit,
  DEFAULT_LIMIT, senderNum
}) => {

  if (!q) return reply("🔗 Masukkan URL Instagram!")

  // ===== LIMIT =====
  if (!isPremiumUser) {
    const ok = useUserLimit(senderNum, 1)
    if (!ok) {
      return reply(`❌ Limit habis.\nHubungi owner untuk topup.\n${global.owner}`)
    }
    const sisa = getUserLimit(senderNum)
    reply(`🔢 Limit -1 | Sisa: *${sisa}* / ${DEFAULT_LIMIT}`)
  }

  await riz.sendMessage(id, {
    react: { text: "⏳", key: msg.key }
  })

  let medias = []

  // ===============================
  // IGDL UTAMA (yt5s)
  // ===============================
  try {
    const form = new URLSearchParams()
    form.append("q", q)
    form.append("vt", "home")

    const { data } = await axios.post(
      "https://yt5s.io/api/ajaxSearch",
      form,
      {
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    )

    if (data.status !== "ok") throw "yt5s gagal"

    const $ = cheerio.load(data.data)
    const video = $('a[title="Download Video"]').attr("href")
    const image = $("img").attr("src")

    if (video) medias.push({ type: "video", url: video })
    else if (image) medias.push({ type: "image", url: image })
    else throw "media tidak ditemukan"

  } catch (e) {
    console.log("IGDL error → fallback Yupra")

    // ===============================
    // FALLBACK API YUPRA
    // ===============================
    try {
      const api = `https://api.yupra.my.id/api/downloader/Instagram?url=${encodeURIComponent(q)}`
      const { data } = await axios.get(api)

      if (data.status !== 200 || !data.result?.medias?.length) {
        throw "Fallback gagal"
      }

      medias = data.result.medias.map(v => ({
        type: v.type,
        url: v.url
      }))

    } catch (err) {
      await riz.sendMessage(id, {
        react: { text: "❌", key: msg.key }
      })
      return reply("❌ Gagal download Instagram (semua metode error).")
    }
  }

  await riz.sendMessage(id, {
    react: { text: "✅", key: msg.key }
  })

  // ===============================
  // KIRIM KE WHATSAPP
  // ===============================
  const videos = medias.filter(v => v.type === "video")
  const images = medias.filter(v => v.type === "image")

  // VIDEO
  if (videos.length > 0) {
    return riz.sendMessage(id, {
      video: { url: videos[0].url },
      caption: "✅ *Instagram Video*"
    }, { quoted: qriz })
  }

  // IMAGE
  if (images.length === 1) {
    return riz.sendMessage(id, {
      image: { url: images[0].url },
      caption: "✅ *Instagram Image*"
    }, { quoted: qriz })
  }

  if (images.length > 1) {
    return riz.sendMessage(id, {
      album: images.map(i => ({
        image: { url: i.url }
      }))
    }, { quoted: qriz })
  }

  reply("❌ Media tidak didukung.")
}