import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const command = ["tebakjkt48"];
global.tebakJKT48 = global.tebakJKT48 || {};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, "../data/tebakjkt48.json");
const TIME_LIMIT = 60 * 1000;

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function tebakJKT48(msg, ctx) {
  const { riz, id, msg: qmsg, reactm } = ctx;
  if (ctx.command !== "tebakjkt48") return;

  await reactm("⏳");

  const data = JSON.parse(fs.readFileSync(DATA_PATH));
  const soal = pickRandom(data);

  const sent = await riz.sendMessage(
    id,
    {
      image: { url: soal.img },
      caption:
`🎤 *TEBAK MEMBER JKT48*

Siapakah member di atas?
Balas *reply ke gambar ini*

⏰ ${TIME_LIMIT / 1000} detik`
    },
    { quoted: qmsg }
  );

  const qid = sent.key.id;

  const timeout = setTimeout(async () => {
    if (global.tebakJKT48[qid]) {
      await riz.sendMessage(
        id,
        {
          text: `⏰ Waktu habis!\nJawaban: *${soal.jawaban.toUpperCase()}*`
        },
        { quoted: sent }
      );
      delete global.tebakJKT48[qid];
    }
  }, TIME_LIMIT);

  global.tebakJKT48[qid] = {
    answer: soal.jawaban,
    timeout
  };

  await reactm("✅");
}