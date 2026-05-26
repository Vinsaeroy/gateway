import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const command = ["tebaklogo"];
global.tebakLogo = global.tebakLogo || {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "../data/tebaklogo.json");
const TIME_LIMIT = 60 * 1000;

// ambil context info universal
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

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function tebakLogoPlugin(msg, ctx) {
  const { riz, id, body, msg: qmsg, reactm, reply } = ctx;

  // ===============================
  // JAWABAN (REPLY KE SOAL)
  // ===============================
  try {
    const ctxInfo = getContextInfo(msg);

    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      null;

    if (replyTargetId && global.tebakLogo[replyTargetId]) {
      const soal = global.tebakLogo[replyTargetId];
      const userAns = body.trim().toLowerCase();
      const realAns = soal.answer.toLowerCase();

      if (userAns === realAns) {
        clearTimeout(soal.timeout);

        await riz.sendMessage(
          id,
          {
            text: `✅ Benar!\nJawaban: *${soal.answer.toUpperCase()}*`
          },
          { quoted: msg }
        );

        delete global.tebakLogo[replyTargetId];
      } else {
        await riz.sendMessage(
          id,
          { text: "❌ Salah. Coba lagi!" },
          { quoted: msg }
        );
      }
      return;
    }
  } catch (e) {
    console.error("TebakLogo reply error:", e);
  }

  // ===============================
  // COMMAND .tebaklogo
  // ===============================
  if (ctx.command === "tebaklogo") {
    await reactm("⏳");

    try {
      const raw = fs.readFileSync(DATA_PATH, "utf8");
      const list = JSON.parse(raw);
      const soal = pickRandom(list);

      const sent = await riz.sendMessage(
        id,
        {
          image: { url: soal.img },
          caption:
`🧠 *TEBAK LOGO*

Petunjuk :
${soal.deskripsi}

Balas pesan ini dengan jawabannya.

⏰ ${TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.tebakLogo[qid]) {
          await riz.sendMessage(
            id,
            {
              text: `⏰ Waktu habis!\nJawaban: *${soal.jawaban.toUpperCase()}*`
            },
            { quoted: sent }
          );
          delete global.tebakLogo[qid];
        }
      }, TIME_LIMIT);

      global.tebakLogo[qid] = {
        answer: soal.jawaban,
        timeout
      };

      await reactm("✅");
    } catch (err) {
      console.error("TebakLogo error:", err);
      reply("❌ Gagal memuat soal tebak logo.");
    }
  }
}