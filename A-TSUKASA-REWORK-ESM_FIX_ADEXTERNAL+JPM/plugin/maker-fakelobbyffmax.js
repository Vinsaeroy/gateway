import { createCanvas, loadImage } from 'canvas';

const backgroundList = [
  'https://files.catbox.moe/jbd23e.jpg',
  'https://files.catbox.moe/7fja3z.jpg',
  'https://files.catbox.moe/8j0asj.jpg',
  'https://files.catbox.moe/jtsp76.jpg',
  'https://files.catbox.moe/0eslpr.jpg',
  'https://files.catbox.moe/ileqbd.jpg',
  'https://files.catbox.moe/utir3q.jpg',
  'https://files.catbox.moe/jl2sar.jpg',
  'https://files.catbox.moe/j235gb.jpg',
  'https://files.catbox.moe/dlxjj6.jpg',
  'https://files.catbox.moe/awoh5v.jpg',
  'https://files.catbox.moe/2wgtbb.jpg',
  'https://files.catbox.moe/hbbufy.jpg',
  'https://files.catbox.moe/0y5a57.jpg',
  'https://files.catbox.moe/jk4jtv.jpg',
  'https://files.catbox.moe/ucw40m.jpg'
];

export const command = [
  'lobbyffmax',
  'lobbyffprime',
  'fakeffmax',
  'fakeffprime'
];

export default async function pluginRun(msg, ctx) {
  const { riz, id, sender, reply, q, args, qriz, useUserLimit, getUserLimit, senderNum, isPremiumUser, DEFAULT_LIMIT } = ctx;

  if (!q) {
    return reply(
      `🚩 Format salah!\n\n` +
      `Contoh:\n` +
      `.lobbyffmax Xinnie|3  (pilih background #3)\n` +
      `.lobbyffmax XinnVo   (acak background)`
    );
  }

  const [nicknameRaw, nomorRaw] = q.split('|');
  const nickname = nicknameRaw?.trim();

  if (!nickname) {
    return reply(`Nama tidak boleh kosong!\nContoh: .lobbyffmax Xinn|3`);
  }

        if (!isPremiumUser) {
            const bisa = useUserLimit(senderNum, 2);
            if (!bisa) {
                return reply(
                    `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
                );
            }
    const sisa = getUserLimit(senderNum);
    reply(
      `🔢 Limit terpakai 2x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
    );
  }

  await reply('⏳ Membuat Free Fire Max Prime Lobby...');

  try {
    const max = backgroundList.length;
    let index;

    if (typeof nomorRaw !== 'undefined') {
      const nomor = parseInt(nomorRaw.trim(), 10);
      if (isNaN(nomor) || nomor < 1 || nomor > max) {
        return reply(
          `🚩 Nomor background tidak valid.\n` +
          `Pilih angka 1 s/d ${max}.\n` +
          `Contoh: .lobbyffmax ${nickname}|3`
        );
      }
      index = nomor - 1;
    } else {
      index = Math.floor(Math.random() * max);
    }

    const backgroundUrl = backgroundList[index];
    const bg = await loadImage(backgroundUrl);
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.font = `bold 31px "Teuton"`;
    ctx.fillStyle = '#ffb300';
    ctx.lineWidth = 5;
    ctx.textAlign = 'center';
    ctx.fillText(nickname, 355, canvas.height - 250);

    const buffer = canvas.toBuffer();

    await riz.sendMessage(
      id,
      {
        image: buffer,
        caption:
          `🎮 Fake Free Fire Max Prime Lobby berhasil dibuat!\n\n` +
          `🆔 *${nickname}*\n` +
          `🖼️ Background Ke: *#${index + 1}*`
      },
      { quoted: qriz }
    );

  } catch (err) {
    console.error('[LOBBYFFPRIME ERROR]', err);
    reply('❌ Gagal membuat Lobby FF Prime: ' + err.message);
  }
}