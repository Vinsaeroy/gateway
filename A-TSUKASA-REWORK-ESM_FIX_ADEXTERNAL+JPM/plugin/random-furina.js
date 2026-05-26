// plugin/furina.js
export const command = ["furina"]

const furinaList = [
      'https://i.pinimg.com/originals/b5/13/7d/b5137d9d56ca847ce8d623a64b1f7ca8.jpg',
      'https://i.pinimg.com/originals/1f/88/22/1f88223bcb6f337469588834ee6d0643.jpg',
      'https://i.pinimg.com/originals/36/c1/4a/36c14ab3f39faebd13caeb3585c6dd6b.jpg',
      'https://i.pinimg.com/originals/3c/64/51/3c64514ce2719b0e50ee30bfcbcd2318.png',
      'https://i.pinimg.com/originals/17/0c/84/170c84131fb1e3ca6246edeb1be7a363.jpg',
      'https://i.pinimg.com/originals/e4/91/bc/e491bcc915d2798838b4921a03ac247b.jpg',
      'https://i.pinimg.com/originals/98/ec/7e/98ec7eb02fb625d07f2875c48cc27ee0.jpg',
      'https://i.pinimg.com/originals/d8/eb/20/d8eb20aa1d355c32e165af933ee17f13.jpg',
      'https://i.pinimg.com/originals/5a/ba/47/5aba47ca01158d9c0ab2a35a54d31734.jpg',
      'https://i.pinimg.com/originals/5c/3b/70/5c3b702d31ddbdbeeb1e744681c4532c.jpg',
      'https://i.pinimg.com/originals/28/73/cc/2873ccc628aa9a5073795facbb96522f.jpg',
      'https://i.pinimg.com/originals/72/a3/a4/72a3a4093dbaae487b2fe77d08b24cbd.jpg',
      'https://i.pinimg.com/originals/01/3d/09/013d09b18d1574cf0f4f0c383f1e7a9d.jpg',
      'https://i.pinimg.com/originals/9e/25/0a/9e250af84d2174d9bb9497128cb84329.jpg',
      'https://i.pinimg.com/originals/99/2b/00/992b001b9aac2718e061e5a3ca1d692b.png',
      'https://i.pinimg.com/originals/06/7e/95/067e9540f87b8662c7ef106c28f0c0c2.jpg',
      'https://i.pinimg.com/originals/61/33/40/61334060af8cdd731e3f0bd400ce41e3.jpg',
      'https://i.pinimg.com/originals/4e/06/3e/4e063e5425133d705017d97ef898439a.jpg'
    ]


export default async function (m, { riz, reply, qriz, id }) {
  try {
    
    const randomImage = furinaList[Math.floor(Math.random() * furinaList.length)]

    await riz.sendMessage(id, {
      image: { url: randomImage },
      caption: `💧 *Furina Random Image* 💙`
    }, { quoted: qriz })

  } catch (err) {
    console.error('❌ Error Furina:', err)
    reply('⚠️ Gagal kirim gambar Furina.')
  }
}