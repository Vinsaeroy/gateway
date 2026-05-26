import axios from 'axios'
import * as cheerio from 'cheerio'

function WattPad(judul) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await axios.get('https://www.wattpad.com/search/' + encodeURIComponent(judul), {
        headers: {
          cookie: 'wp_id=d92aecaa-7822-4f56-b189-f8c4cc32825c; sn__time=j%3Anull; fs__exp=1; adMetrics=0;',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/111.0'
        }
      })

      const $ = cheerio.load(data)
      const limk = 'https://www.wattpad.com'
      const _data = []

      $('.story-card-container > ul.list-group.new-list-group > li.list-group-item').each(function () {
        let link = limk + $(this).find('a').attr('href')
        let judul = $(this).find('a > div > div.story-info > div.title').text().trim()
        let img = $(this).find('a > div > div.cover > img').attr('src')
        let desc = $(this).find('a > div > div.story-info > .description').text().replace(/\s+/g, ' ')
        let _doto = []
        $(this).find('a > div > div.story-info > .new-story-stats > .stats-item').each((_, el) => {
          _doto.push($(el).find('.icon-container > .tool-tip > .sr-only').text())
        })
        _data.push({
          title: judul,
          thumb: img,
          desc: desc,
          reads: _doto[0],
          vote: _doto[1],
          chapter: _doto[2],
          link: link,
        })
      })

      resolve(_data)
    } catch (err) {
      reject('❌ Gagal mengambil data dari Wattpad.')
    }
  })
}

export default async function handler(msg, ctx) {
  const { command, args, q, reply, reactm, riz, qriz, id } = ctx
  
  if (!q) return reply(`Contoh: ${command} Naruto`)

  await reactm('📖')

  try {
    const result = await WattPad(q)
    if (!result.length) return reply('❌ Tidak ditemukan.')

    let teks = result.slice(0, 5).map((v, i) => 
      `📚 *${v.title}*\n📝 ${v.desc}\n👁️‍🗨️ *Baca:* ${v.reads}\n❤️ *Vote:* ${v.vote}\n📖 *Chapter:* ${v.chapter}\n🔗 ${v.link}`
    ).join('\n\n────────────────────\n\n')

    await riz.sendMessage(id, {
      image: { url: result[0].thumb },
      caption: teks
    }, { quoted: qriz })

  } catch (e) {
    console.error('Wattpad Error:', e)
    reply(typeof e === 'string' ? e : '❌ Terjadi kesalahan.')
  }
}

export const command = ['wattpad', 'wp']