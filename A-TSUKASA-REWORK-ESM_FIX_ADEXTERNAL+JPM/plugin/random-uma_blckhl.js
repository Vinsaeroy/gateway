export const command = ["uma", "umamusume", "blackhole"]

const umaList = [
  "https://i.pinimg.com/originals/6e/32/b1/6e32b195a9bb7958371c1da43255b98a.png",
  "https://i.pinimg.com/originals/92/53/9e/92539ed020b55599ced5fc491ec65db0.png",
  "https://i.pinimg.com/originals/97/85/2a/97852af9a0bf5e154c0dd0c89d738cf7.jpg",
  "https://i.pinimg.com/originals/18/c5/e9/18c5e907f7ffdb08df2f6378a630a0bf.jpg",
  "https://i.pinimg.com/originals/2c/68/27/2c68279ba093e233e70b5b629dfac01d.jpg",
  "https://i.pinimg.com/originals/30/8c/14/308c14e8594e6c27317bfd1ee9ad945e.jpg",
  "https://i.pinimg.com/originals/bd/a5/91/bda59192709e831f67bf88b4f2a84848.jpg",
  "https://i.pinimg.com/originals/95/c6/f0/95c6f06aad4a28228d87a5f999808e41.jpg",
  "https://i.pinimg.com/originals/e1/bf/1d/e1bf1d1cbab4dd2dc8c01eef4b103b5a.jpg",
  "https://i.pinimg.com/originals/b3/13/ba/b313ba9eee862ce03328b1271fb7d3e0.png",
  "https://i.pinimg.com/originals/d1/7a/10/d17a1079be8e4fb9a603c992cab811d9.jpg",
  "https://i.pinimg.com/originals/8b/63/6c/8b636c12167f4ccf2f06c7c01484b584.jpg",
  "https://i.pinimg.com/originals/0f/2b/ba/0f2bbad1325c5347e374c4bb06dc6371.jpg",
  "https://i.pinimg.com/originals/d4/c4/b3/d4c4b314a2b0c0f3a86570bf531ba170.jpg",
  "https://i.pinimg.com/originals/fe/96/fd/fe96fd357e70667cb12d1044e486bd55.jpg",
  "https://i.pinimg.com/originals/85/5f/01/855f018b6b28b9caf3261cc8221f70d0.jpg"
]

const blackholeList = [
  "https://i.pinimg.com/originals/16/1e/f2/161ef2ef1bbf83cd91f56ea9c4902da2.jpg",
  "https://i.pinimg.com/originals/02/e5/f8/02e5f89d4775f70157a4ac3853905e30.jpg",
  "https://i.pinimg.com/originals/ef/c8/dc/efc8dc258673aaa64fddf8840a0630e6.jpg",
  "https://i.pinimg.com/originals/b2/f7/af/b2f7af29b4a4f356acda484c2827f3dc.jpg",
  "https://i.pinimg.com/originals/69/de/36/69de364d0cf3c04941aae1db57490391.jpg",
  "https://i.pinimg.com/originals/e8/65/6e/e8656ec5143ebd5dd6559d2a976041e7.jpg",
  "https://i.pinimg.com/originals/19/84/61/1984614b28c1eb0c0583ba2e6b8fc4ed.jpg",
  "https://i.pinimg.com/originals/3e/29/31/3e2931e00d0e97a0193ff91de6f8c604.png",
  "https://i.pinimg.com/originals/dd/e9/78/dde9788069d0d410b517a83dccc58a5c.jpg",
  "https://i.pinimg.com/originals/e7/6b/70/e76b70c16b608fa3606eb34f8d1ff71e.jpg",
  "https://i.pinimg.com/originals/6d/a6/43/6da64326bbd71d4552a2226b58259661.jpg",
  "https://i.pinimg.com/originals/7d/fd/63/7dfd632621342bfa733a45c7b1836677.jpg",
  "https://i.pinimg.com/originals/c2/96/82/c2968210b3626f072876d56ad0a44e24.jpg",
  "https://i.pinimg.com/originals/21/44/d0/2144d02e5d01b2260fe05c91e9d8ee43.jpg",
  "https://i.pinimg.com/originals/61/31/27/61312721f6780b2f2c86e9b1b3ddb99c.jpg",
  "https://i.pinimg.com/originals/cd/32/1a/cd321a747ace9ed98e5fe0db71c3fa1f.jpg",
  "https://i.pinimg.com/originals/0e/e5/d7/0ee5d7ca1b65f5f5ad50a3ea562f7413.jpg",
  "https://i.pinimg.com/originals/f5/83/10/f58310b7138c6b84a463c0aabb1e547a.png"
]

export default async function (m, { riz, id, reply, qriz, command }) {
  try {
    let list = []
    let caption = ""

    if (command === "uma" || command === "umamusume") {
      list = umaList
      caption = "🐎 *Uma Musume Random Image* ✨"
    } else if (command === "blackhole") {
      list = blackholeList
      caption = "🕳️ *Black Hole Random Image* 🌌"
    }

    const randomImage = list[Math.floor(Math.random() * list.length)]

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption
    }, { quoted: qriz })

  } catch (err) {
    console.error("❌ Error Uma/BlackHole:", err)
    reply("⚠️ Gagal kirim gambar.")
  }
}