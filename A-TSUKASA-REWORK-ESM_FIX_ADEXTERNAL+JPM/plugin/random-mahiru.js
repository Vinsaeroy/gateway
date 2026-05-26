export const command = ["mahiru"]

const mahiruList = [
      'https://i.pinimg.com/originals/a9/44/af/a944af71140325085c7dcc32379d8195.jpg',
      'https://i.pinimg.com/originals/ac/65/cd/ac65cd0c944cf90097dfbc40c7d6f926.jpg',
      'https://i.pinimg.com/originals/8b/55/29/8b552984a255741f660ab0f2368a13dc.jpg',
      'https://i.pinimg.com/originals/06/17/85/061785086f3d73ab1605e4f10b968fb9.png',
      'https://i.pinimg.com/originals/a6/32/2d/a6322dd3d1f43b973c288c473d2de993.jpg',
      'https://i.pinimg.com/originals/cc/b7/ff/ccb7ffce18e7b105b6f99a28b50a339f.png',
      'https://i.pinimg.com/originals/92/53/f9/9253f9fbdd76394ce8333abfd8354907.jpg',
      'https://i.pinimg.com/originals/07/e1/15/07e115b5f62513249554c72b604fc26f.png',
      'https://i.pinimg.com/originals/15/93/ad/1593adbe2bc148cb36f788c9f9824ab4.jpg',
      'https://i.pinimg.com/originals/b7/61/14/b76114b59cf12395a34b9363865f88d5.jpg',
      'https://i.pinimg.com/originals/10/74/26/10742606899f4747e30a946734979cd5.png',
      'https://i.pinimg.com/originals/48/ef/81/48ef811623fa3b786e61a6914133bba4.jpg',
      'https://i.pinimg.com/originals/be/93/d1/be93d1cdfdd1781457435aa2c362e421.jpg',
      'https://i.pinimg.com/originals/a9/20/e1/a920e1bac97e8fcc9b3f427e154d49a9.jpg',
      'https://i.pinimg.com/originals/94/05/38/9405387aedecf884dcb6ba4a855f7eb9.jpg',
      'https://i.pinimg.com/originals/f7/41/28/f74128c113d5678e37b00407c3829ab7.jpg',
      'https://i.pinimg.com/originals/fe/8e/c0/fe8ec0d0f4f0f82e2caa2be934d756e4.jpg'
    ]

export default async function (m, { riz, reply, qriz, id }) {
  try {
    

    const randomImage = mahiruList[Math.floor(Math.random() * mahiruList.length)]

    await riz.sendMessage(id, { react: { text: "🌸", key: m.key } })

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `☀️ *Mahiru Random Image* 💛`
    }, { quoted: qriz })

    await riz.sendMessage(id, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error('❌ Error Mahiru:', err)
    reply('⚠️ Gagal kirim gambar Mahiru.')
  }
}