import axios from "axios";

export const command = ["tebakkimia"];
global.tebakKimia = global.tebakKimia || {};
const TEBAK_TIME_LIMIT = 60 * 1000;

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

export default async function tebakkimiaPlugin(msg, ctx) {
  const { riz, id, body, reply, reactm, msg: qmsg } = ctx;

  // ======================================================
  // CEK JIKA USER REPLY SOAL (UNIVERSAL)
  // ======================================================
  try {
    const ctxInfo = getContextInfo(msg);
    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.stickerMessage?.contextInfo?.stanzaId ||
      null;

    if (replyTargetId && global.tebakKimia[replyTargetId]) {
      const soal = global.tebakKimia[replyTargetId];

      const userAns = body.trim().toLowerCase();
      const correct = soal.lambang.toLowerCase();

      if (userAns === correct) {
        clearTimeout(soal.timeout);
        await riz.sendMessage(
          id,
          {
            text:
`✅ Betul!

Unsur   : *${soal.unsur}*
Lambang : *${soal.lambang}*`
          },
          { quoted: msg }
        );
        delete global.tebakKimia[replyTargetId];
      } else {
        await riz.sendMessage(
          id,
          { text: "❌ Salah. Yang ditanya lambangnya ya." },
          { quoted: msg }
        );
      }
      return;
    }
  } catch (err) {
    console.error("TebakKimia Reply Error:", err);
  }

  // ======================================================
  // MULAI SOAL BARU
  // ======================================================
  if (ctx.command === "tebakkimia") {
    await reactm("⏳");
    try {
      const { data } = await axios.get("https://api.alpin-store.my.id/api/game/tebakkimia");

      const soal = data.result;

      const sent = await riz.sendMessage(
        id,
        {
          text:
`🧪 *Tebak Kimia*

Apa lambang dari unsur:
➡️ *${soal.unsur}*

Balas pesan ini langsung dengan lambangnya.
Contoh: rb

⏰ ${TEBAK_TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.tebakKimia[qid]) {
          await riz.sendMessage(
            id,
            {
              text:
`⏰ Waktu habis!
Jawaban: *${soal.lambang}*`
            },
            { quoted: sent }
          );
          delete global.tebakKimia[qid];
        }
      }, TEBAK_TIME_LIMIT);

      global.tebakKimia[qid] = {
        unsur: soal.unsur,
        lambang: soal.lambang,
        timeout
      };

      await reactm("✅");

    } catch (err) {
      console.error("TebakKimia Error:", err);
      reply("❌ Gagal ambil soal.");
    }
  }
}