import axios from "axios";

export const command = ["susunkata"];
global.susunKata = global.susunKata || {};
const SUSUN_TIME_LIMIT = 60 * 1000;

// UNIVERSAL CONTEXT INFO EXTRACTOR
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

export default async function susunKataPlugin(msg, ctx) {
  const { riz, id, body, msg: qmsg, reply, reactm } = ctx;

  // ======================================================
  // CEK JIKA REPLY KE SOAL (UNIVERSAL)
  // ======================================================
  try {
    const ctxInfo = getContextInfo(msg);

    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.stickerMessage?.contextInfo?.stanzaId ||
      null;

    if (replyTargetId && global.susunKata[replyTargetId]) {
      const soal = global.susunKata[replyTargetId];

      const userAns = body.trim().toLowerCase();
      const realAns = soal.answer.toLowerCase();

      if (userAns === realAns) {
        clearTimeout(soal.timeout);
        await riz.sendMessage(
          id,
          { text: `✅ Benar!\nJawaban: *${soal.answer.toUpperCase()}*` },
          { quoted: msg }
        );
        delete global.susunKata[replyTargetId];
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
    console.error("SusunKata Reply Error:", err);
  }

  if (ctx.command === "susunkata") {
    await reactm("⏳");

    try {
      const { data } = await axios.get("https://api.alpin-store.my.id/api/game/susunkata");

      const soal = data.result;

      const sent = await riz.sendMessage(
        id,
        {
          text:
`🧩 *SUSUN KATA*

Soal  : *${soal.soal}*
Tipe  : ${soal.tipe}

Balas pesan ini dengan jawabannya.

⏰ ${SUSUN_TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.susunKata[qid]) {
          await riz.sendMessage(
            id,
            { text: `⏰ Waktu habis! Jawaban: *${soal.jawaban.toUpperCase()}*` },
            { quoted: sent }
          );
          delete global.susunKata[qid];
        }
      }, SUSUN_TIME_LIMIT);

      global.susunKata[qid] = {
        answer: soal.jawaban.toLowerCase(),
        timeout
      };

      await reactm("✅");

    } catch (err) {
      console.error("SusunKata Error:", err);
      reply("❌ Gagal ambil soal.");
    }
  }
}