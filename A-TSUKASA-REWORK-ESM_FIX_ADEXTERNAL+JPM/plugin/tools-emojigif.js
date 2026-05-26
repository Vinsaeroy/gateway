import '../config.js'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

export const command = ['emojigif']

export default async (m, { riz, reply, id, qriz, q }) => {
  try {
    if (!q) return reply('⚠️ Contoh: .emojigif 😎')

    reply(mess.wait)

    const apiUrl = `https://api-faa.my.id/faa/emojigerak?emoji=${encodeURIComponent(q)}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`Status ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())

    const sticker = new Sticker(buffer, {
      pack: 'TsukasaBot',
      author: 'RizkyDev',
      type: StickerTypes.FULL,
      quality: 80,
      fps: 30,
      loop: 0,
      background: '#00000000'
    })

    await riz.sendMessage(
      id,
      await sticker.toMessage(),
      { quoted: qriz }
    )

  } catch (e) {
    console.error('❌ Emojigif Error:', e)
    reply(`🍂 Ups error: ${e.message}`)
  }
}