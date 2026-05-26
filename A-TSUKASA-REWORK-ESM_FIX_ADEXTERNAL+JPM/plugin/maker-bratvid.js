import '../config.js'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

export const command = ['bratvid']

export default async (m, { riz, reply, id, qriz, q, reactm }) => {
  try {
    if (!q) return reply('⚠️ Contoh: .bratvid Lu napa dah')

    reactm("⏳️")

    const apiUrl = `https://www.sankavollerei.com/imagecreator/bratvideo?apikey=planaai&text=${encodeURIComponent(q)}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`Status ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())

    const sticker = new Sticker(buffer, {
      pack: 'TsukasaBot',
      author: 'RizkyDev',
      type: StickerTypes.FULL,
      quality: 80,
      fps: 30, // biar smooth
      loop: 0,
      background: '#00000000'
    })

    await riz.sendMessage(
      id,
      await sticker.toMessage(),
      { quoted: qriz }
    )
reactm("✅️")
  } catch (e) {
    console.error('❌ BratVid Error:', e)
    reply(`🍂 Ups error: ${e.message}`)
  }
}
