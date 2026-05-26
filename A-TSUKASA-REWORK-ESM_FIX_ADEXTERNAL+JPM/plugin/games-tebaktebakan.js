import axios from "axios";

export const command = ["tebaktebakan"];
global.tebakTebakan = global.tebakTebakan || {};
const TEBAKTEBAKAN_TIME_LIMIT = 60 * 1000;

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

export default async function tebakTebakanPlugin(msg, ctx) {
  const { riz, id, body, msg: qmsg, reply, reactm } = ctx;

  try {
    const ctxInfo = getContextInfo(msg);

    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.stickerMessage?.contextInfo?.stanzaId ||
      null;

    if (replyTargetId && global.tebakTebakan[replyTargetId]) {
      const soal = global.tebakTebakan[replyTargetId];

      const userAns = (body || "").trim().toLowerCase();
      const realAns = (soal.answer || "").trim().toLowerCase();

      if (userAns === realAns) {
        clearTimeout(soal.timeout);

        await riz.sendMessage(
          id,
          {
            text:
              `✅ Benar!\n` +
              `Jawaban: *${soal.answer.toUpperCase()}*\n\n` +
              `📝 Alasan: ${soal.reason || "-"}`
          },
          { quoted: msg }
        );

        delete global.tebakTebakan[replyTargetId];
      } else {
        await riz.sendMessage(
          id,
          {
            text:
              `❌ Salah. Coba lagi!\n` +
              `💡 Clue: ${soal.clues || "-"}`
          },
          { quoted: msg }
        );
      }
      return;
    }
  } catch (err) {
    console.error("TebakTebakan Reply Error:", err);
  }

  if (ctx.command === "tebaktebakan") {
    await reactm("⏳");

    try {
      const { data } = await axios.get(
        "https://ngakak-epiay.vercel.app/api/question"
      );

      if (!data || data.status !== 200) throw new Error("API error / status != 200");

      const soal = {
        questions: data.questions || "-",
        answers: data.answers || "",
        clues: data.clues || "-",
        reason: data.reason || "-"
      };

      if (!soal.answers) throw new Error("Jawaban kosong dari API");

      const sent = await riz.sendMessage(
        id,
        {
          text:
            `🧠 *TEBAK-TEBAKAN*\n\n` +
            `❓ Soal: *${soal.questions}*\n` +
            `💡 Clue: ${soal.clues}\n\n` +
            `Balas pesan ini langsung dengan jawabannya.\n\n` +
            `⏰ ${TEBAKTEBAKAN_TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.tebakTebakan[qid]) {
          await riz.sendMessage(
            id,
            {
              text:
                `⏰ Waktu habis!\n` +
                `Jawaban: *${soal.answers.toUpperCase()}*\n\n` +
                `📝 Alasan: ${soal.reason || "-"}`
            },
            { quoted: sent }
          );
          delete global.tebakTebakan[qid];
        }
      }, TEBAKTEBAKAN_TIME_LIMIT);

      global.tebakTebakan[qid] = {
        answer: soal.answers,
        clues: soal.clues,
        reason: soal.reason,
        timeout
      };

      await reactm("✅");
    } catch (err) {
      console.error("TebakTebakan Error:", err);
      reply("❌ Gagal ambil soal tebaktebakan.");
    }
  }
}