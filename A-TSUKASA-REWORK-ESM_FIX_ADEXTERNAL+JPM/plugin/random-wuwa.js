export const command = ["wuwa", "wutheringwaves"]

const z = [
      'https://i.pinimg.com/736x/a1/ae/56/a1ae567636613dcb0ad83d4076b9264d.jpg',
      'https://i.pinimg.com/originals/67/82/c4/6782c4e5d6eb5e7da48170358613662b.jpg',
      'https://i.pinimg.com/originals/c9/ab/88/c9ab88de2a23ee4d34012a0c3ffe7244.png',
      'https://i.pinimg.com/originals/39/b7/32/39b73266e05aa3014462f23c75969014.webp',
      'https://i.pinimg.com/originals/db/e3/a1/dbe3a1d4257f0d2bb7f48431759133d6.webp',
      'https://i.pinimg.com/originals/c7/2e/92/c72e925c89e10a70fd47f9887cdfb663.png',
      'https://i.pinimg.com/originals/41/ce/7b/41ce7b66da0ad1997d09985e67c2a348.jpg',
      'https://i.pinimg.com/originals/19/60/1f/19601fd0d274a76b20e9c893508ba251.webp',
      'https://i.pinimg.com/originals/d4/89/d6/d489d62748dec3bef92eaf7361b07654.png',
      'https://i.pinimg.com/originals/76/6a/7e/766a7e3c14e96ece7edc8017876768a8.jpg',
      'https://i.pinimg.com/originals/b7/e3/72/b7e3727f20f61992e1c9b89b4f8bd6cf.jpg',
      'https://i.pinimg.com/originals/78/08/1c/78081c89edc7d1cc69e009d65dac6d0d.jpg',
      'https://i.pinimg.com/originals/bd/3a/77/bd3a775db2d57419a09617bee0ae0465.jpg',
      'https://i.pinimg.com/originals/15/c7/e4/15c7e48f277544774bd7253aa79cd714.jpg',
      'https://i.pinimg.com/originals/da/a6/0d/daa60d5327746ac9d2358a27c0259bac.webp'
    ]

export default async function (m, {
  riz, reply, qriz, id
}) {
  try {

    const randomImage = z[Math.floor(Math.random() * z.length)]

    await riz.sendMessage(id, {
      image: {
        url: randomImage
      },
      caption: ``
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
    reply('⚠️ Gagal kirim gambar.')
  }
}