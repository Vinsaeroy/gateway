// plugin/waguri.js
export const command = ["waguri"]

const waguriList = [
      'https://i.pinimg.com/originals/43/8b/6b/438b6b094a4ac7dd76df99e61606d66f.jpg',
      'https://i.pinimg.com/originals/80/0c/1f/800c1f2c9e61ec25c5d3989b9731c4c8.jpg',
      'https://i.pinimg.com/originals/28/43/e4/2843e470995160fb44a9c8e70fb536c0.jpg',
      'https://i.pinimg.com/originals/1c/ce/cb/1ccecb936d66facd3fd29d9fdbde8112.png',
      'https://i.pinimg.com/originals/b8/fc/b3/b8fcb38a368f34c22d79e5614ae0c96d.png',
      'https://i.pinimg.com/originals/8a/96/e2/8a96e2eb0a201f0a3ecc9936a682ffc7.jpg',
      'https://i.pinimg.com/originals/f5/ff/8a/f5ff8a2aa1c16f0415caf458d82904d2.jpg',
      'https://i.pinimg.com/originals/db/b1/90/dbb19090cc681862c65b2eb88bbaed3d.jpg',
      'https://i.pinimg.com/originals/4b/01/85/4b01859d81498f1c64d46ceba5eb716b.jpg',
      'https://i.pinimg.com/originals/37/a7/11/37a7110d1e75524520f3ac9a3bdd4c98.png',
      'https://i.pinimg.com/originals/28/36/d2/2836d21c090c7cfbf3799a0321bc9b87.webp',
      'https://i.pinimg.com/originals/e6/23/4a/e6234a8f7fac1f4867c268971468b1e5.jpg',
      'https://i.pinimg.com/originals/0e/f0/87/0ef087279b66b708601df1bc3d9e628e.png',
      'https://i.pinimg.com/originals/d9/06/ae/d906ae81077f238855434506eab3c9e4.jpg',
      'https://i.pinimg.com/originals/85/95/42/8595427e396115862ed8a6212dc0eaa9.jpg',
      'https://i.pinimg.com/originals/b0/e0/5d/b0e05d4881e905bc501167e33939101a.jpg',
      'https://i.pinimg.com/originals/61/4c/7d/614c7dd0c5fa56738a7cfad1f137eb78.png'
    ]

export default async function (m, {
  riz, reply, qriz, id
}) {
  try {

    const randomImage = waguriList[Math.floor(Math.random() * waguriList.length)]

    await riz.sendMessage(id, {
      react: {
        text: "💫", key: m.key
      }
    })

    await riz.sendMessage(id, {
      image: {
        url: randomImage
      },
      caption: `💜 *Waguri Random Image* 🌸`
    }, {
      quoted: qriz
    })

    await riz.sendMessage(id, {
      react: {
        text: "✅", key: m.key
      }
    })

  } catch (err) {
    console.error('❌ Error Waguri:', err)
    reply('⚠️ Gagal kirim gambar Waguri.')
  }
}