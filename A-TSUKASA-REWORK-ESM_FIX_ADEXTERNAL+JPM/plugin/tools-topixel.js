import Jimp from "jimp"
import { downloadContentFromMessage } from "baileys"

export const command = ["topixel", "pixelate"]

export default async function (msg, { riz, id, q, args, reply, reactm }) {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    if (!quoted) return reply("⚠️ Reply gambar dulu bang!")

    const mediaType = Object.keys(quoted).find(t => ["imageMessage"].includes(t))
    if (!mediaType) return reply("⚠️ Yang direply harus gambar!")

    const pixelSize = Math.max(8, Math.min(parseInt(args[0]) || 32, 1024))

    reactm("⏳")

    const stream = await downloadContentFromMessage(
      quoted[mediaType],
      "image"
    )

    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    const image = await Jimp.read(buffer)

    const small = image.clone().resize(pixelSize, pixelSize, Jimp.RESIZE_NEAREST_NEIGHBOR)
    const pixelated = small.resize(image.bitmap.width, image.bitmap.height, Jimp.RESIZE_NEAREST_NEIGHBOR)
    const output = await pixelated.getBufferAsync(Jimp.MIME_JPEG)

    await riz.sendMessage(
      id,
      {
        image: output,
        caption: `Pixelated (Size: ${pixelSize})`
      },
      { quoted: msg }
    )

  } catch (e) {
    console.error("Pixelate Error:", e)
    reply("❌ Error: " + e.message)
  }
}