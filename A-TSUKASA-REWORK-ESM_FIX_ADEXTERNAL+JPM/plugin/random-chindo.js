export const command = ["chindo"]

const pl = [
  "https://i.pinimg.com/originals/91/98/44/9198440c625880741fc10ff313c62409.jpg",
  "https://i.pinimg.com/originals/a7/38/bc/a738bca273fca3c5156848dcd746565c.jpg",
  "https://i.pinimg.com/originals/91/9f/f6/919ff6884656df89f87a5012a23105d8.jpg",
  "https://i.pinimg.com/originals/85/41/9f/85419faa33b0b776726daf230c67c79a.jpg",
  "https://i.pinimg.com/originals/0c/e4/ff/0ce4ff87951547bffc3449338994e68b.jpg",
  "https://i.pinimg.com/originals/59/f7/61/59f76117bb98955e1ec56f6d77ec7b69.jpg",
  "https://i.pinimg.com/originals/27/81/cb/2781cb8829ed0c2eb5e38e533bfe4979.jpg",
  "https://i.pinimg.com/originals/dc/4f/c3/dc4fc3bd30ba35454544978641551838.jpg",
  "https://i.pinimg.com/originals/ae/1f/04/ae1f0470762d272278c23b427ce965f4.jpg",
  "https://i.pinimg.com/originals/de/b9/fc/deb9fcc2ca22df6d0393df562089cc61.jpg",
  "https://i.pinimg.com/originals/a0/ce/f4/a0cef47e38c94e4bc73cab2a1c5a1764.jpg",
  "https://i.pinimg.com/originals/91/78/1e/91781e3d274ecc660122a9a8d0f54982.jpg",
  "https://i.pinimg.com/originals/4a/ab/01/4aab015539f3c4dcb3b04332209050f2.jpg",
  "https://i.pinimg.com/originals/29/36/cb/2936cb9acd06e63e17e9e54a14d35fcf.jpg",
  "https://i.pinimg.com/originals/b7/52/53/b75253dacf8522bff168a53d0b711800.jpg"
];

export default async function (m, { riz, reply, qriz, id }) {
  try {
    const randomImage = pl[Math.floor(Math.random() * pl.length)]

    await riz.sendMessage(id, {
      react: { text: "💛", key: m.key }
    })

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `💫 *Tsunade Senju Random Image* 🍶`
    }, { quoted: qriz })

    await riz.sendMessage(id, {
      react: { text: "✅", key: m.key }
    })

  } catch (err) {
    console.error("❌ Error Tsunade:", err)
    reply("⚠️ Gagal ngirim gambar Tsunade Senju.")
  }
}