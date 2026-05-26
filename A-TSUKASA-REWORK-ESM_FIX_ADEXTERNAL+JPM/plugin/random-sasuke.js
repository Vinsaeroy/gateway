export const command = ["sasuke"]

const sasukeList = [
      'https://i.pinimg.com/originals/54/31/52/54315284e23101cea2d93d707c33d25c.jpg',
      'https://i.pinimg.com/originals/89/1a/fe/891afeed1eee3377fffd2ede9e5c7526.jpg',
      'https://i.pinimg.com/originals/0f/73/80/0f7380fd859dcfd0171e46764a65ae60.jpg',
      'https://i.pinimg.com/originals/82/3f/d1/823fd1017a0df56e7fd27b1dc11df37c.jpg',
      'https://i.pinimg.com/originals/2b/59/78/2b5978c3fa67133ce07eacab559fc6a2.jpg',
      'https://i.pinimg.com/originals/12/c7/2e/12c72ee5b8b9217ea19efe0b54ecf6c4.jpg',
      'https://i.pinimg.com/originals/4e/f8/2e/4ef82e6a457585f72ed773f74dea7e30.jpg',
      'https://i.pinimg.com/originals/2f/cf/98/2fcf98261ab58d8ec20ba999ffe839b6.jpg',
      'https://i.pinimg.com/originals/8f/e1/3c/8fe13c7411a1686c32d4cdf8b6a78980.jpg',
      'https://i.pinimg.com/originals/f1/c5/44/f1c544fa4c8e8167c0cb9881b8aaa84c.png',
      'https://i.pinimg.com/originals/4b/86/1d/4b861dd204f7449fd5ac0e9432d1f227.jpg',
      'https://i.pinimg.com/originals/4b/c8/19/4bc8192ebc5d6e55025821f0b839e673.jpg',
      'https://i.pinimg.com/originals/bc/8b/b1/bc8bb101895ed8f2beff898258665942.jpg',
      'https://i.pinimg.com/originals/54/94/07/5494079fed92d071c56558ebb51c37e4.jpg',
      'https://i.pinimg.com/originals/e0/68/24/e0682410c3dcacf99a553f073b1bd6da.jpg',
      'https://i.pinimg.com/originals/0a/55/6f/0a556f3ae7b62aa27d881bafb1454e86.jpg',
      'https://i.pinimg.com/originals/84/fe/76/84fe7604763b429cc06c5967b1939895.jpg',
      'https://i.pinimg.com/originals/66/61/e1/6661e1bc733eb2147276b7cad6d2e367.jpg'
    ]

export default async function (m, { riz, reply, qriz, id }) {
  try {
    

    const randomImage = sasukeList[Math.floor(Math.random() * sasukeList.length)]

    await riz.sendMessage(id, { react: { text: "⚡", key: m.key } })

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `⚔️ *Sasuke Random Image* 🖤`
    }, { quoted: qriz })

    await riz.sendMessage(id, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error("❌ Error Sasuke:", err)
    reply("⚠️ Gagal kirim gambar Sasuke.")
  }
}