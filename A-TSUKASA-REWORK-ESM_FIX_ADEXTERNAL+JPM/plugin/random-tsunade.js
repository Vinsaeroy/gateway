export const command = ["tsunade", "tsunadesenju"]

const tsunadeList = [
  "https://i.pinimg.com/originals/dc/4c/4f/dc4c4fc6b5a065bdc65ad2f1ca704232.jpg",
  "https://i.pinimg.com/originals/26/82/5f/26825f8f064460296920a753b237bea2.jpg",
  "https://i.pinimg.com/originals/60/0f/13/600f13b1a26443163f01b92188c14fb3.jpg",
  "https://i.pinimg.com/originals/af/cc/cf/afcccfdd76238bbfcda7eaadb4c0073f.jpg",
  "https://i.pinimg.com/originals/57/e1/08/57e108422b293099289198ae6faefa8c.png",
  "https://i.pinimg.com/originals/2f/11/89/2f1189a5fc6427cc6ca395081996a2ab.jpg",
  "https://i.pinimg.com/originals/67/5b/1d/675b1daae53476dbb6dc1f38aaf1a62d.jpg",
  "https://i.pinimg.com/originals/8a/b2/01/8ab20134a3e3e471b054e45d4a85f250.jpg",
  "https://i.pinimg.com/originals/a6/22/b1/a622b102d3b8aa366d789984ea2d0856.jpg",
  "https://i.pinimg.com/originals/c4/f6/2d/c4f62d840a408fd62d7f8558251925f0.jpg",
  "https://i.pinimg.com/originals/c0/38/8c/c0388c5930e188f7b526dbbd4ae116df.png",
  "https://i.pinimg.com/originals/58/7e/34/587e3451f8d3ee3a6e37f3bc0c78fc24.jpg",
  "https://i.pinimg.com/originals/3f/b4/c9/3fb4c9a6a337b203456b60216eac7e51.jpg",
  "https://i.pinimg.com/originals/8d/e6/c4/8de6c46a4da2514b7085f88476d966b5.jpg",
  "https://i.pinimg.com/originals/b9/75/ce/b975cee642d6c54962aa68f0af4ff640.png",
  "https://i.pinimg.com/originals/d6/70/4c/d6704cad526eee15000c6fba2eb61e00.jpg"
]

export default async function (m, { riz, reply, qriz, id }) {
  try {
    const randomImage = tsunadeList[Math.floor(Math.random() * tsunadeList.length)]

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