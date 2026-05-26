export const command = ["tebakmakanan"];

global.tebakMakanan = global.tebakMakanan || {};
const TEBAKMAKANAN_TIME_LIMIT = 60 * 1000;

const DATA = [
  { img: "https://telegra.ph/file/dcb89d83545f8e959b4d4.jpg", jawaban: "Aceh", deskripsi: "Makanan ini berasal dari Aceh, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/5b80850d1ddf479ab9705.jpg", jawaban: "Rendang", deskripsi: "Makanan ini berasal dari Sumatra Barat, Coba, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/a0856f4778d829f71b568.jpg", jawaban: "Bika Ambon", deskripsi: "Makanan ini berasal dari Sumatera Utara, Coba, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/d3716a69826476580e0e5.jpg", jawaban: "Pandap", deskripsi: "Makanan ini berasal dari Bengkulu, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/20377403173edd57a3cec.jpg", jawaban: "Gulai Belacan", deskripsi: "Makanan ini berasal dari Riau, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/0712a8819e93d51f54e7a.jpg", jawaban: "Mi Bangka", deskripsi: "Makanan ini berasal dari Bangka Belitung, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/0f380418f03bae73f3e2b.jpg", jawaban: "Pempek", deskripsi: "Makanan ini berasal dari Sumatera Selatan, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/fe12abe4a626b3634ecfa.jpg", jawaban: "Seruit", deskripsi: "Makanan ini berasal dari Lampung, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/b24a29edc60a1d52cbc29.jpg", jawaban: "Sate Banten", deskripsi: "Makanan ini berasal dari Banten, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/c26c3dd6d47ea2d498ed7.jpg", jawaban: "Kerak Telor", deskripsi: "Makanan ini berasal dari Jakarta, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/578e2f51f7894dcc28dc4.jpg", jawaban: "Karedok", deskripsi: "Makanan ini berasal dari Jawa Barat, Gado-Gado nya orang sunda, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/4030b9a47547e78809c58.jpg", jawaban: "serabi", deskripsi: "Makanan ini berasal dari Jawa Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/c8cdabe1d8c0e8a68ce1e.jpg", jawaban: "Lumpia", deskripsi: "Makanan ini berasal dari Semarang, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/bcaf4782058877f4b6445.jpg", jawaban: "Garang Asem", deskripsi: "Makanan ini berasal dari Jawa Tengah, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/8c0b19286d3fff5b97c23.jpg", jawaban: "Nasi Gudeg", deskripsi: "Makanan ini berasal dari Yogyakarta, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/d3371daad5f9c93d9960a.jpg", jawaban: "Rujak Cingur", deskripsi: "makanan ini berasal dari Surabaya , coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/1f7a4de251768b3ba8603.jpg", jawaban: "Ayam Betutu", deskripsi: "Makanan ini berasal dari Bali, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/76f88ee6d1ad976c70d36.jpg", jawaban: "Catemak Jagung", deskripsi: "Makanan ini berasal dari Nusa Tenggara Timur, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/e0f76d8c582ff94da6461.jpg", jawaban: "Ayam Taliwang", deskripsi: "Makanan ini berasal dari Nusa Tenggara Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/b0dcb7973ac50ce181feb.jpg", jawaban: "Bubur Pedas Sambas", deskripsi: "Makanan ini berasal dari Kalimantan Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/a217238e8a953dfaf9fd1.jpg", jawaban: "Kepiting Soka", deskripsi: "Makanan ini berasal dari Kalimantan Utara, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/395a56ef910097e7ab325.jpg", jawaban: "Soto Banjar", deskripsi: "Makanan ini berasal dari Kalimantan Selatan, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/78335090ae9b0cb43b97c.jpg", jawaban: "Juhu Singkah", deskripsi: "Makanan ini berasal dari Kalimantan Tengah, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/abc90f7e8a7f1eb405bfe.jpg", jawaban: "Ayam Cincane", deskripsi: "Makanan ini berasal dari Kalimantan Timur, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/2fc61b6d6e781db5c0eb0.jpg", jawaban: "Binte Biluhut", deskripsi: "Makanan ini berasal dari Gorontaloa, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/643651ca38ebb241397d6.jpg", jawaban: "Sup Konro", deskripsi: "Makanan ini berasal dari Makasar Sulawesi Selatan, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/335c45530915637d6bac3.jpg", jawaban: "Sup Ikan Jantung Pisang", deskripsi: "Makanan ini berasal dari Sulawesi Tengah, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/026bc85cfd9c3be8de3a1.jpg", jawaban: "Lapa Lapa", deskripsi: "Makanan ini berasal dari Sulawesi Tenggara, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/8a84c732bc17b03f4fda0.jpg", jawaban: "Bubur Manado", deskripsi: "Makanan ini berasal dari Sulawesi Utara, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/a2155b3d2c86b89d67deb.jpg", jawaban: "Ikan Asar", deskripsi: "Makanan ini berasal dari Maluku, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/8810d4b9454eea9235eab.jpg", jawaban: "Gohu Ikan", deskripsi: "Makanan ini berasal dari Maluku Utara, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/d9c47b9254c0e4e4dabea.jpg", jawaban: "Ikan Bakar Manokwari", deskripsi: "Makanan ini berasal dari Papua Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/7ee30f344f7875ce60c35.jpg", jawaban: "Bubur Sagu", deskripsi: "Makanan ini berasal dari Papua Timur, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/d54efbddc5d9ffbf15a7b.jpg", jawaban: "Kue Begea", deskripsi: "Makanan ini berasal dari Papua Tengah, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/04bdc9bb70456cab07255.jpg", jawaban: "Kare Kameng", deskripsi: "Makanan ini berasal dari Aceh, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/0d881941212f60e3a2a8b.jpg", jawaban: "Ayam Pinadar", deskripsi: "Makanan ini berasal dari Batak Toba, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/ce12f3525908a5954a026.jpg", jawaban: "Anyang Pakis", deskripsi: "Makanan ini berasal dari Sumatera Utara, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/571b381324928749346bc.jpg", jawaban: "Bihun Bebek", deskripsi: "Makanan ini berasal dari Medan, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/3b36b8963774bf61577c3.jpg", jawaban: "Kacimuih", deskripsi: "Makanan ini berasal dari Sumatera Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/b03422cea70bcd121ac7d.jpg", jawaban: "Gulai Ikan Patin", deskripsi: "Makanan ini berasal dari Jambi, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/94fd859c4e08607481e53.jpg", jawaban: "Nasi Lengko", deskripsi: "Makanan ini berasal dari Jawa Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/7808cf8332529688bdc7c.jpg", jawaban: "Tapai Ketan", deskripsi: "Makanan ini berasal dari Jawa Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/cf31f802a90dff7a32326.jpg", jawaban: "Rujak Kangkung", deskripsi: "Makanan ini berasal dari Bali, Coba tebak apa nama makanan ini..." },
  { img: "https://i.supa.codes/6S8Ay7", jawaban: "Tempe Mendoan", deskripsi: "Makanan ini berasal dari Jawa Tengah, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/7d0015947a03c062d5f17.jpg", jawaban: "Woku", deskripsi: "Makanan ini berasal dari Sulawesi Utara, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/60de1e9a41d22b8a2f74d.jpg", jawaban: "Ikan Bakar Kuah Kuning", deskripsi: "Makanan ini berasal dari Papua Selatan, Coba tebak apa nama makanan ini..." },
  { img: "https://telegra.ph/file/a5083f29ffbb98c85fe7f.jpg", jawaban: "Gorengan", deskripsi: "Makanan ini berasal dari Indonesia, Coba tebak apa nama makanan ini..." },
  { img: "https://files.catbox.moe/1xd9jd.webp", jawaban: "Opor Ayam", deskripsi: "Makanan ini berasal dari Jawa Tengah, Coba tebak apa nama makanan ini..." },
  { img: "https://files.catbox.moe/go8nye.avif", jawaban: "Coto Makasar", deskripsi: "Makanan ini berasal dari Kota Makasar, Coba tebak apa nama makanan ini..." },
  { img: "https://files.catbox.moe/v15o77.jpg", jawaban: "Batagor", deskripsi: "Makan ini berasal dari Bandung, Coba tebak apa nama makanan ini..." },
  { img: "https://files.catbox.moe/2rc90m.jpeg", jawaban: "Dodol", deskripsi: "Makan ini berasal dari Jawa Barat, Coba tebak apa nama makanan ini..." },
  { img: "https://files.catbox.moe/jrw4ke.jpg", jawaban: "Peyeum", deskripsi: "Makan ini berasal dari Jawa Barat, Coba tebak apa nama makanan ini..." }
];

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

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// biar "Coto Makasar" == "coto-makasar!!!" tetep dianggap bener
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default async function tebakMakananPlugin(msg, ctx) {
  const { riz, id, body, msg: qmsg, reply, reactm } = ctx;

  // =========================
  // HANDLER DETEK REPLY JAWABAN
  // =========================
  try {
    const ctxInfo = getContextInfo(msg);
    const replyTargetId =
      ctxInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.key?.id ||
      ctxInfo?.quotedMessage?.imageMessage?.contextInfo?.stanzaId ||
      ctxInfo?.quotedMessage?.stickerMessage?.contextInfo?.stanzaId ||
      null;

    // mirip asahotak: kalau replyTargetId ada di global, berarti ini jawaban game
    if (replyTargetId && global.tebakMakanan[replyTargetId]) {
      const soal = global.tebakMakanan[replyTargetId];

      const userAns = (body || "").trim();
      const realAns = soal.answer;

      if (norm(userAns) === norm(realAns)) {
        clearTimeout(soal.timeout);

        await riz.sendMessage(
          id,
          { text: `🎉 Benar!\nJawaban: *${String(soal.answer).toUpperCase()}*` },
          { quoted: msg }
        );

        delete global.tebakMakanan[replyTargetId];
      } else {
        await riz.sendMessage(id, { text: "❌ Salah, coba lagi!" }, { quoted: msg });
      }
      return;
    }
  } catch (err) {
    console.error("TebakMakanan Reply Error:", err);
  }

  // =========================
  // COMMAND START
  // =========================
  if (ctx.command === "tebakmakanan") {
    await reactm("⏳");

    try {
      if (!Array.isArray(DATA) || DATA.length === 0) {
        await reactm("❌");
        return reply("❌ Data tebak makanan kosong.");
      }

      const soal = pickRandom(DATA);

      const sent = await riz.sendMessage(
        id,
        {
          image: { url: soal.img },
          caption:
`🍽️ *TEBAK MAKANAN*

${soal.deskripsi}

Balas pesan ini untuk menjawab.

⏰ ${TEBAKMAKANAN_TIME_LIMIT / 1000} detik`
        },
        { quoted: qmsg }
      );

      const qid = sent?.key?.id;

      const timeout = setTimeout(async () => {
        if (global.tebakMakanan[qid]) {
          await riz.sendMessage(
            id,
            { text: `⏰ Waktu habis!\nJawaban: *${String(soal.jawaban).toUpperCase()}*` },
            { quoted: sent }
          );
          delete global.tebakMakanan[qid];
        }
      }, TEBAKMAKANAN_TIME_LIMIT);

      global.tebakMakanan[qid] = {
        answer: soal.jawaban,
        timeout
      };

      await reactm("✅");
    } catch (err) {
      console.error("TebakMakanan Error:", err);
      reply("❌ Gagal kirim soal tebak makanan.");
    }
  }
}