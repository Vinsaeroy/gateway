export const command = ["ais"]
import "../config.js"
import axios from "axios"
import { Sticker, StickerTypes } from "wa-sticker-formatter"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

const pickImageUrlFromPin = (pin) => {
  const imgs = pin?.images || pin?.image || {}
  return (
    imgs?.orig?.url ||
    imgs?.["1200x"]?.url ||
    imgs?.["736x"]?.url ||
    imgs?.["564x"]?.url ||
    imgs?.["474x"]?.url ||
    imgs?.["236x"]?.url ||
    null
  )
}

const fetchBuffer = async (url) => {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { "user-agent": UA },
    timeout: 20000,
    maxRedirects: 5,
  })
  return Buffer.from(res.data)
}

const pinterestTop = async (query) => {
  const headers = {
    "user-agent": UA,
    "x-pinterest-pws-handler": "www/search/[scope].js",
    accept: "application/json, text/plain, */*",
    "screen-dpr": "4",
  }

  // 1) Utama: BaseSearchResource JSON
  try {
    const dataObj = { options: { query, scope: "pins" }, context: {} }
    const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}`
    const url =
      "https://www.pinterest.com/resource/BaseSearchResource/get/?" +
      "source_url=" +
      encodeURIComponent(sourceUrl) +
      "&data=" +
      encodeURIComponent(JSON.stringify(dataObj))

    const res = await axios.get(url, { headers, timeout: 20000 })
    const results = res?.data?.resource_response?.data?.results

    if (Array.isArray(results) && results.length) {
      for (const pin of results) {
        const img = pickImageUrlFromPin(pin)
        if (img) return img
      }
    }
  } catch (e) {
  }

  const headUrl =
    "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" +
    encodeURIComponent(JSON.stringify({ options: { query }, context: {} }))

  const res2 = await axios.head(headUrl, { headers, timeout: 20000 })
  const rhl = res2?.headers?.link || res2?.headers?.Link
  if (!rhl) throw new Error(`Hasil pencarian "${query}" kosong`)

  const links = [...String(rhl).matchAll(/<(.*?)>/gm)].map((v) => v[1])
  const firstImage =
    links.find((u) => /\.(jpe?g|png|webp)(\?|$)/i.test(u)) || links[0]

  if (!firstImage) throw new Error("Gagal nemu gambar dari Pinterest")
  return firstImage
}

export default async function run(msg, { riz, id, q, reply, qriz }) {
  if (!q) return reply("Contoh: .ais singa")

  try {
    const imgUrl = await pinterestTop(q.trim())
    const imgBuffer = await fetchBuffer(imgUrl)

    const sticker = new Sticker(imgBuffer, {
  pack: global.pack || "BOT",
  author: global.author || "AIS Pinterest",
  type: StickerTypes.FULL,
  quality: 70,
})

const stickerBuffer = await sticker.toBuffer()

await riz.sendMessage(
  id,
  { sticker: stickerBuffer },
  { quoted: qriz }
)
  } catch (e) {
      console.error(e)
    reply("❌ Gagal bikin stiker.\n" + (e?.message || String(e)))
  }
}