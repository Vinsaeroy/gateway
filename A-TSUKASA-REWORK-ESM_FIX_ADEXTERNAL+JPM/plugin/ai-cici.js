export const command = ["aicici", "cici"];
import axios from 'axios'

export default async (m, { reply, pushname, riz, qriz, id, reactm }) => {

m.reply = reply
m.react = reactm

  try {
    if (!q) {
      return m.reply('Contoh:\n.cici halo')
    }

    await m.react('💬')

    const res = await axios.get(
      `https://api.nexray.web.id/ai/cici?text=${encodeURIComponent(q)}`,
      { timeout: 20000 }
    )

    const result =
      res.data?.result ||
      res.data?.response ||
      res.data?.answer ||
      res.data

    if (!result) throw 'Empty response'

    await m.reply(`CICI:\n${result}`)
    await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('❌')
    m.reply('❌ Cici sedang tidak bisa membalas, coba lagi nanti.')
  }
}