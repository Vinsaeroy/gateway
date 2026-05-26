// plugin/hutao.js
export const command = ["hutao"]

export default async function (m, { riz, reply, qriz, id }) {
  try {
    const hutaoList = [
      'https://i.pinimg.com/originals/66/24/7c/66247c37f2cb0cf049678830261e5c27.jpg',
      'https://i.pinimg.com/originals/0f/0e/0d/0f0e0d8a5a1a9162c943791439655ff3.png',
      'https://i.pinimg.com/originals/07/04/33/070433a088eaffc6d949d8efaf905ee7.jpg',
      'https://i.pinimg.com/originals/38/73/c5/3873c5ad59533c508cb1b2e8ac089e1d.png',
      'https://i.pinimg.com/originals/7f/2f/4e/7f2f4ea366abc3c4b2cae860c3f62b93.jpg',
      'https://i.pinimg.com/originals/02/21/bc/0221bc46fa0a082057b4abe548965c24.jpg',
      'https://i.pinimg.com/originals/22/13/9b/22139b3579e106caec380175be5465d0.jpg',
      'https://i.pinimg.com/originals/78/5c/d7/785cd794a381c1541df1a1ef0638f48a.jpg',
      'https://i.pinimg.com/originals/75/bb/d5/75bbd51e1d3fa3f2d4f0740422b1fd4a.jpg',
      'https://i.pinimg.com/originals/70/46/a7/7046a7577ff2e4f3de3b4c62e9b4bcff.jpg',
      'https://i.pinimg.com/originals/e2/fb/4d/e2fb4d07e3836ef6307d04f0ec113988.jpg',
      'https://i.pinimg.com/originals/44/29/2d/44292d5593b6384eddb9af43a6e026a9.png',
      'https://i.pinimg.com/originals/9a/87/15/9a8715a30ec84be268fde47cf49151ae.jpg',
      'https://i.pinimg.com/originals/c4/52/34/c45234bc8615ef3505c0f831d93be80d.png',
      'https://i.pinimg.com/originals/94/0e/d6/940ed62af810614f777cd278dd65330e.jpg',
      'https://i.pinimg.com/originals/47/58/20/47582059735263ea75fde9c6b545cf18.jpg',
      'https://i.pinimg.com/originals/bd/b0/10/bdb010091dabb8de22da28164f77aa67.jpg',
      'https://i.pinimg.com/originals/8c/fa/b5/8cfab517114f912e553d22336814d554.webp'
    ]

    const randomImage = hutaoList[Math.floor(Math.random() * hutaoList.length)]

    // efek loading biar keren dikit 😎
    await riz.sendMessage(id, { react: { text: "⏳", key: m.key } })

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `🔥 *Hu Tao Random Image* ❤️`
    }, { quoted: qriz })

    await riz.sendMessage(id, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error('❌ Error HuTao:', err)
    reply('⚠️ Gagal kirim gambar Hu Tao.')
  }
}