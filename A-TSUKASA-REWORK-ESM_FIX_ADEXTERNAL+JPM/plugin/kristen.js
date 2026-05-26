// plugin/kristen.js
import moment from "moment-timezone";
import { QUOTES_KRISTEN } from "../data/quotes_kristen.js";
import { FAKTA_UNIK_KRISTEN } from "../data/faktaunik_kristen.js";
import { RENUNGAN_TEMA, RENUNGAN_BACAAN, RENUNGAN_DOA } from "../data/renungan_kristen.js";

export const command = [
  "renunganharian", "renungankristen", "renungan",
  "quoteskristen", "qkristen",
  "faktaunikkristen", "faktakristen", "faktakristen"
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function dayOfYearJakarta() {
  const now = moment().tz("Asia/Jakarta");
  return now.dayOfYear(); // 1..365/366
}

export default async function run(msg, ctx) {
  const { command, q, reply } = ctx;

  if (command === "quoteskristen" || command === "qkristen") {
    const quote = pickRandom(QUOTES_KRISTEN);
    return reply(`✝️ *Quotes Kristen*\n\n“${quote}”`);
  }

  if (command === "faktaunikkristen" || command === "faktakristen") {
  const req = parseInt((q || "").trim(), 10);
  const jumlah = clamp(isNaN(req) ? 5 : req, 1, 10);

  const pool = [...FAKTA_UNIK_KRISTEN];
  const hasil = [];

  for (let i = 0; i < jumlah && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    hasil.push(pool.splice(idx, 1)[0]);
  }

  const teks = hasil.map((f, i) => `${i + 1}. ${f}`).join("\n");
  return reply(`✝️ *Fakta Unik Kristen* (${hasil.length})\n\n${teks}`);
}

  if (command === "renunganharian" || command === "renungankristen" || command === "renungan") {
    const d = dayOfYearJakarta();

    const tema = RENUNGAN_TEMA[d % RENUNGAN_TEMA.length];
    const bacaan = RENUNGAN_BACAAN[d % RENUNGAN_BACAAN.length];
    const doa = RENUNGAN_DOA[d % RENUNGAN_DOA.length];

    const aplikasi = [
      "Ambil 1 langkah kecil hari ini: doa singkat, lalu lakukan hal yang benar meski tidak nyaman.",
      "Berhenti 2 menit untuk bersyukur. Sebutkan 3 hal kecil yang Tuhan pelihara hari ini.",
      "Ucapkan 1 kalimat yang membangun kepada orang terdekat, bukan sindiran.",
      "Jika kamu cemas, tulis bebanmu, lalu serahkan dalam doa.",
      "Pilih mengampuni: mulai dengan mendoakan orang itu (tanpa membenarkan kesalahan).",
    ][d % 5];

    const tanggal = moment().tz("Asia/Jakarta").format("dddd, DD MMMM YYYY");

    return reply(
`✝️ *Renungan Harian*
📅 ${tanggal}

*Tema:* ${tema}
*Bacaan:* ${bacaan.ref}

*Renungan singkat:*
${bacaan.poin}
Hari ini, biarkan Tuhan memimpin responsmu. Jangan hanya fokus pada masalah, tapi pada Pribadi yang memegang hidupmu.

*Aplikasi:*
• ${aplikasi}

*Doa:*
${doa}`
    );
  }
}