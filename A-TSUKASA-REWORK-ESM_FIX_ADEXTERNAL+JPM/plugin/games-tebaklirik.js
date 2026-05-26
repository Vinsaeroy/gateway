import axios from "axios";

export const command = ["tebaklirik"];
global.tebakLirik = global.tebakLirik || {};
const LIRIK_TIME_LIMIT = 60 * 1000;

function getContextInfo(msg) {
  return (
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.stickerMessage?.contextInfo ||
    msg.message?.documentMessage?.contextInfo ||
    msg.message?.contextInfo ||
    null
  );
}

export default async function tebakLirikPlugin(msg, ctx) {
  const { riz, id, body, msg: qmsg, reply, reactm } = ctx;

  try {
    const ctxInfo = getContextInfo(msg);

    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.stickerMessage?.contextInfo?.stanzaId ||
      null;

    if (replyTargetId && global.tebakLirik[replyTargetId]) {
      const soal = global.tebakLirik[replyTargetId];

      const userAns = body.trim().toLowerCase();
      const realAns = soal.answer.toLowerCase();

      if (userAns === realAns) {
        clearTimeout(soal.timeout);
        await riz.sendMessage(
          id,
          { text: `🎉 Betul!\nJawaban: *${soal.answer.toUpperCase()}*` },
          { quoted: msg }
        );
        delete global.tebakLirik[replyTargetId];
      } else {
        await riz.sendMessage(
          id,
          { text: "❌ Salah. Coba lagi!" },
          { quoted: msg }
        );
      }
      return;
    }
  } catch (err) {
    console.error("TebakLirik Reply Error:", err);
  }

  if (ctx.command === "tebaklirik") {
    await reactm("⏳");

    try {
      const { data } = await axios.get("https://api.alpin-store.my.id/api/game/tebaklirik");

      const soal = data.result;

      const sent = await riz.sendMessage(
        id,
        {
          text:
`🎵 *TEBAK LIRIK*

Lanjutkan lirik berikut:

"${soal.soal}"

Balas pesan ini dengan jawabannya.

⏰ ${LIRIK_TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.tebakLirik[qid]) {
          await riz.sendMessage(
            id,
            { text: `⏰ Waktu habis! Jawaban: *${soal.jawaban.toUpperCase()}*` },
            { quoted: sent }
          );
          delete global.tebakLirik[qid];
        }
      }, LIRIK_TIME_LIMIT);

      global.tebakLirik[qid] = {
        answer: soal.jawaban.toLowerCase(),
        timeout
      };

      await reactm("✅");

    } catch (err) {
      console.error("TebakLirik Error:", err);
      reply("❌ Gagal ambil soal.");
    }
  }
}