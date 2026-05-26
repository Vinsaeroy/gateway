import axios from "axios"
import * as cheerio from "cheerio"
import "../config.js"

export const command = ["threads", "th", "thdl"]

const makeResponse = {
  ok: (data) => ({
    status: true, data
  }),
  error: (error) => ({
    status: false, message: error.message || String(error)
  })
}

async function threadsScraper(threadsUrl) {
  try {
    const postId = threadsUrl.match(/(?:threads\.(?:net|com)\/(?:.*\/)?(?:t|post|video)\/)([^/?#&]+)/)?.[1]
    if (!postId) return makeResponse.error("URL Threads tidak valid.")

    const {
      data: html
    } = await axios.get(`https://www.threads.net/t/${postId}/embed`)
    const $ = cheerio.load(html)

    const buffer = []
    const caption = $(".BodyTextContainer").text().trim()
    const user = $(".NameContainer span").text().trim()
    const avatar = $(".AvatarContainer img").attr("src") || null

    const videos = $(".SingleInnerMediaContainer video source, .BodyContainer video source")
    const images = $(".SingleInnerMediaContainer img, .BodyContainer img, .MediaScrollContainerFull .MediaContainer img")

    videos.each((_, el) => {
      const url = $(el).attr("src")
      if (url) buffer.push({
        url, type: "video"
      })
    })

    images.each((_, el) => {
      const url = $(el).attr("src")
      if (url) buffer.push({
        url, type: "image"
      })
    })

    return makeResponse.ok({
      media: buffer,
      caption,
      avatar,
      user
    })

  } catch (e) {
    return makeResponse.error(e)
  }
}

export default async function (m, {
  riz,
  id,
  q,
  reply,
  msg
}) {
  try {
    if (!q) return reply("⚠️ Masukkan URL Threads.\nContoh: .threads https://www.threads.net/t/xxxx")

    reply(mess.wait)

    const result = await threadsScraper(q)
    if (!result.status) return reply("❌ Error: " + result.message)

    const {
      media,
      caption,
      user,
      avatar
    } = result.data

    if (avatar) {
      await riz.sendMessage(id, {
        image: {
          url: avatar
        }, caption: `👤 *${user}*`
      }, {
        quoted: msg
      })
    }

    for (let item of media) {
      if (item.type === "video") {
        await riz.sendMessage(id, {
          video: {
            url: item.url
          }, caption
        }, {
          quoted: msg
        })
      } else {
        await riz.sendMessage(id, {
          image: {
            url: item.url
          }, caption
        }, {
          quoted: msg
        })
      }
    }

  } catch (e) {
    reply("❌ Error: " + e.message)
  }
}