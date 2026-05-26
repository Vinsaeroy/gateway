import axios from "axios";

export const command = ["tebakkata"];
global.tebakKata = global.tebakKata || {};
const TEBAK_TIME_LIMIT = 60 * 1000;

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

export default async function tebakKataPlugin(msg, ctx) {
  const { riz, id, body, msg: qmsg, reply, reactm } = ctx;

  try {
    const ctxInfo = getContextInfo(msg);
    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.stickerMessage?.contextInfo?.stanzaId ||
      null;

    if (replyTargetId && global.tebakKata[replyTargetId]) {
      const soal = global.tebakKata[replyTargetId];

      const userAns = body.trim().toLowerCase();
      const realAns = soal.answer.toLowerCase();

      if (userAns === realAns) {
        clearTimeout(soal.timeout);
        await riz.sendMessage(
          id,
          { text: `🎉 Betul!\nJawaban: *${soal.answer.toUpperCase()}*` },
          { quoted: msg }
        );
        delete global.tebakKata[replyTargetId];
      } else {
        await riz.sendMessage(id, { text: "❌ Salah, coba lagi!" }, { quoted: msg });
      }
      return;
    }
  } catch (err) {
    console.error("TebakKata Reply Error:", err);
  }

  if (ctx.command === "tebakkata") {
    await reactm("⏳");

    try {
      const { data } = await axios.get("https://api.alpin-store.my.id/api/game/tebakkata");

      const soal = data.result;

      const sent = await riz.sendMessage(
        id,
        {
          text:
`🔤 *TEBAK KATA*

Clue :
${soal.soal}

Balas pesan ini untuk menjawab.

⏰ ${TEBAK_TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.tebakKata[qid]) {
          await riz.sendMessage(
            id,
            { text: `⏰ Waktu habis! Jawaban: *${soal.jawaban.toUpperCase()}*` },
            { quoted: sent }
          );
          delete global.tebakKata[qid];
        }
      }, TEBAK_TIME_LIMIT);

      global.tebakKata[qid] = {
        answer: soal.jawaban.toLowerCase(),
        timeout
      };

      await reactm("✅");

    } catch (err) {
      console.error("TebakKata Error:", err);
      reply("❌ Gagal ambil soal.");
    }
  }
}