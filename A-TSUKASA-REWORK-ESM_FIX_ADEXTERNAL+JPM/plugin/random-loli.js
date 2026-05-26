import axios from 'axios';
import '../config.js';

export const command = ['loli'];

export default async function (m, {
  riz, reply, qriz, id
}) {
  reply(mess.wait);
  try {
    const res = await axios.get('https://api.ryuu-dev.offc.my.id/random/cosplay-ba', {
      responseType: 'arraybuffer'
    });
    const buffer = Buffer.from(res.data, 'binary');
    await riz.sendMessage(id, { image: buffer, caption: '🎭 Random loli!' }, { quoted: qriz });
  } catch (err) {
    console.error('CosplayBA Error:', err);
    reply('❌ Gagal mengambil gambar');
  }
}