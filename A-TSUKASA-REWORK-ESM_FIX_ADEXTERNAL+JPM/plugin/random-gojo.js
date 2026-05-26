export const command = ["gojosatoru", "satoru", "gojo"]

const gojoList = [
      'https://i.pinimg.com/originals/7b/c7/95/7bc795af731d2a4cccfedf083655eedd.jpg',
      'https://i.pinimg.com/originals/01/d0/a8/01d0a858da40c99e5cbe52446f8366ed.jpg',
      'https://i.pinimg.com/originals/90/bf/ff/90bfff2a92b7d68dafda69347417bb4f.jpg',
      'https://i.pinimg.com/originals/d6/8d/7f/d68d7faca1a5138ae204b8e2354be7b8.jpg',
      'https://i.pinimg.com/originals/aa/fb/02/aafb02920cb934d59b329a8f31b77771.jpg',
      'https://i.pinimg.com/originals/9f/a3/0e/9fa30edd29b09524ba7d59d80bd7e672.jpg',
      'https://i.pinimg.com/originals/58/e4/c5/58e4c597ce10d6cda0f794b31a19d0ac.jpg',
      'https://i.pinimg.com/originals/83/99/29/8399292817d11ce3af71e85764352938.jpg',
      'https://i.pinimg.com/originals/00/22/79/002279375509d8d25bdafa636f08cc3b.jpg',
      'https://i.pinimg.com/originals/af/dd/8c/afdd8cb6990baba920f86a252b34c7f3.jpg',
      'https://i.pinimg.com/originals/96/5e/29/965e2970eeb17f093f100764302567fd.jpg',
      'https://i.pinimg.com/originals/59/df/2d/59df2d09b1793ba1cb7127f3dcc2647f.jpg',
      'https://i.pinimg.com/originals/33/c0/65/33c065855d5cd2c67d8b2bb9b2eedd07.jpg',
      'https://i.pinimg.com/originals/94/a5/c7/94a5c71b03c3c716e92327f67af879fc.jpg',
      'https://i.pinimg.com/originals/ee/be/1a/eebe1a998398f86b16597c4fee388112.jpg',
      'https://i.pinimg.com/originals/65/65/f9/6565f9015e4b980e8f25986855350452.jpg',
      'https://i.pinimg.com/originals/79/50/b1/7950b165130827301d2840a4e3d7e745.jpg'
    ]

export default async function (m, { riz, reply, qriz, id }) {
  try {
    

    const randomImage = gojoList[Math.floor(Math.random() * gojoList.length)]

    await riz.sendMessage(id, { react: { text: "❄️", key: m.key } })

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `👁️ *Gojo Satoru Random Image* 💙`
    }, { quoted: qriz })

    await riz.sendMessage(id, { react: { text: "✅", key: m.key } })

  } catch (err) {
    console.error("❌ Error Gojo:", err)
    reply("⚠️ Gagal ngirim foto Gojo.")
  }
}