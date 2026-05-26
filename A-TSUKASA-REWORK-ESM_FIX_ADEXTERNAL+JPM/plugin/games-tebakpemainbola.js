import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const command = ["tebakpemainbola"];
global.tebakPemainBola = global.tebakPemainBola || {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "../data/pemainbola.json");
const TIME_LIMIT = 60 * 1000;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function tebakPemainBola(msg, ctx) {
  const { riz, id, msg: qmsg, reactm, reply } = ctx;

  if (ctx.command !== "tebakpemainbola") return;

  await reactm("⏳");

  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH));
    const soal = pickRandom(data);

    const sent = await riz.sendMessage(
      id,
      {
        text:
`⚽ *TEBAK PEMAIN BOLA*

Petunjuk:
${soal.soal}

Balas pesan ini dengan nama pemainnya.
⏰ ${TIME_LIMIT / 1000} detik`
      },
      { quoted: qmsg }
    );

    const qid = sent.key.id;

    const timeout = setTimeout(async () => {
      if (global.tebakPemainBola[qid]) {
        await riz.sendMessage(
          id,
          {
            text: `⏰ Waktu habis!\nJawaban: *${soal.jawaban.toUpperCase()}*`
          },
          { quoted: sent }
        );
        delete global.tebakPemainBola[qid];
      }
    }, TIME_LIMIT);

    global.tebakPemainBola[qid] = {
      answer: soal.jawaban,
      timeout
    };

    await reactm("✅");
  } catch (e) {
    console.error(e);
    reply("❌ Gagal memuat soal tebak pemain bola.");
  }
}