export const command = ["cat"]

const furinaList = [
  'https://i.pinimg.com/originals/bb/00/fb/bb00fbabd0a58d0bc918cb8bd5664837.jpg',
  'https://i.pinimg.com/originals/69/d4/f5/69d4f553a801270cc080e78402855353.jpg',
  'https://i.pinimg.com/originals/50/96/4d/50964dd2dde0828247aaf26f697f93aa.jpg',
  'https://i.pinimg.com/originals/dc/14/91/dc1491d3f5fa357926c873be8036943c.jpg',
  'https://i.pinimg.com/originals/be/28/22/be28229f2427f8582169d5ce86c9a1c0.png',
  'https://i.pinimg.com/originals/81/2a/2e/812a2ec89697dadccf7b8380598c8be5.jpg',
  'https://i.pinimg.com/originals/15/0c/f3/150cf32844e8db6ccd33acd68990df88.jpg',
  'https://i.pinimg.com/originals/10/bc/bd/10bcbdc51fdacda178fbf70267e19251.jpg',
  'https://i.pinimg.com/originals/82/56/32/8256324f26d68b00563f301052207e88.jpg',
  'https://i.pinimg.com/originals/61/b8/0c/61b80cbded1c9adf895b20ba2ffd0867.png',
  'https://i.pinimg.com/originals/90/54/c9/9054c9d1c125fe8d48b457694d325003.jpg',
  'https://i.pinimg.com/originals/37/8d/d2/378dd2f79d6c1350aa523837143b1669.jpg',
  'https://i.pinimg.com/originals/87/e2/f0/87e2f0e3ab3a2f719da1ee3db638d71e.jpg',
  'https://i.pinimg.com/originals/46/f4/88/46f4885495c1ed7ca2dbfd4787b06bb6.jpg',
  'https://i.pinimg.com/originals/2a/73/d6/2a73d6d66465792a5596b3570c14fa97.jpg',
  'https://i.pinimg.com/originals/5d/98/e1/5d98e1f50ecd12004269fbfa0ada2a9d.jpg',
  'https://i.pinimg.com/originals/20/07/34/2007345cb208c3376ad7300fb760e474.jpg',
  'https://i.pinimg.com/originals/ba/a9/dd/baa9dd17178f52acac9a3404e1da17ca.jpg',
  'https://files.catbox.moe/cysufn.jpg'
]


export default async function (m, { riz, reply, qriz, id }) {
  try {
    
    const randomImage = furinaList[Math.floor(Math.random() * furinaList.length)]

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `🐱 *Cat Random Image*`
    }, { quoted: qriz })

  } catch (err) {
    console.error('❌ Error Furina:', err)
    reply('⚠️ Gagal kirim gambar Kucing.')
  }
}