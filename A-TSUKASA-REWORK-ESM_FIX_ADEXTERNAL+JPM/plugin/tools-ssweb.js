import '../config.js'
import axios from "axios"

export const command = ["ssweb", "screenshot"]

export default async (
  m,
  {
    riz,
    reply,
    id,
    qriz,
    args,
    isPremiumUser,
    senderNum,
    useUserLimit,
    getUserLimit,
    DEFAULT_LIMIT
  }
) => {
  if (!args[0]) {
    return reply('Linknya mana kak? 🤨\nContoh: .ssweb https://google.com')
  }

  if (!isPremiumUser) {
    const bisa = useUserLimit(senderNum, 1)
    if (!bisa) {
      return reply(`❌ Limit kamu sudah habis.\n\nSilakan hubungi owner untuk isi ulang premium / limit:\n${global.owner}`)
    }
    const sisa = getUserLimit(senderNum)
    reply(`🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`)
  }

  reply(mess.wait)

  try {
    const inputUrl = args[0]
    const targetUrl =
      inputUrl.startsWith('http://') || inputUrl.startsWith('https://')
        ? inputUrl
        : `https://${inputUrl}`

    await reply(`Capturing screenshot for: ${targetUrl}...`)

    const ssweb = async (
      url,
      {
        width = 1280,
        height = 720,
        full_page = false,
        device_scale = 1
      } = {}
    ) => {
      const { data } = await axios.post(
        'https://gcp.imagy.app/screenshot/createscreenshot',
        {
          url,
          browserWidth: Number(width),
          browserHeight: Number(height),
          fullPage: full_page,
          deviceScaleFactor: Number(device_scale),
          format: 'png'
        },
        {
          headers: {
            "content-type": "application/json",
            referer: "https://imagy.app/full-page-screenshot-taker/",
            "user-agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36"
          }
        }
      )
      return data.fileUrl
    }

    const imageUrl = await ssweb(targetUrl)

    if (!imageUrl) {
      return reply('Failed to retrieve screenshot. API did not return a valid URL.')
    }

    await riz.sendMessage(
      id,
      {
        image: { url: imageUrl },
        caption: `Screenshot of: ${targetUrl}`
      },
      { quoted: qriz }
    )
  } catch (error) {
    console.error(error)
    reply('❌ Terjadi kesalahan saat mengambil screenshot.')
  }
}