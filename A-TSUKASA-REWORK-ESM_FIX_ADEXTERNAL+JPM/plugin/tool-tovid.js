import axios from "axios";
import FormData from "form-data";
import * as cheerio from "cheerio";
import { downloadContentFromMessage } from "baileys";

export const command = ["tovid", "tomp4", "stiker2vid"];

async function webp2mp4Buffer(webpBuffer) {
  const form = new FormData();
  form.append("new-image", webpBuffer, {
    filename: "image.webp",
    contentType: "image/webp",
  });

  const res1 = await axios.post("https://ezgif.com/webp-to-mp4", form, {
    headers: {
      ...form.getHeaders(),
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: (s) => s >= 200 && s < 400,
  });

  const $1 = cheerio.load(res1.data);
  const action1 = $1("form").attr("action");
  if (!action1) throw new Error("Ezgif: form action tidak ketemu (step1).");

  const form2 = new FormData();
  $1("form input[name]").each((_, el) => {
    const name = $1(el).attr("name");
    const val = $1(el).attr("value") ?? "";
    if (name) form2.append(name, val);
  });

  const url2 = new URL(action1, "https://ezgif.com").toString();
  const res2 = await axios.post(url2, form2, {
    headers: {
      ...form2.getHeaders(),
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      referer: "https://ezgif.com/webp-to-mp4",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: (s) => s >= 200 && s < 400,
  });

  const $2 = cheerio.load(res2.data);
  const src =
    $2("div#output p.outfile video source").attr("src") ||
    $2("div#output video source").attr("src");

  if (!src) throw new Error("Ezgif: hasil video tidak ketemu (step2).");

  return new URL(src, res2.request?.res?.responseUrl || url2).toString();
}

export default async function (msg, { riz, id, m, reply, qriz }) {
  try {
    const quotedMsg =
      msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
      msg?.message;

    const sticker =
      quotedMsg?.stickerMessage || msg?.message?.stickerMessage || null;

    if (!sticker) {
      return reply(
        "Balas *stiker gerak* lalu ketik *.tovid*\n\nCatatan: khusus stiker (webp)."
      );
    }

    await m.Xp()

    const stream = await downloadContentFromMessage(sticker, "sticker");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    if (!buffer.length) throw new Error("Gagal download stiker.");

    const mp4Url = await webp2mp4Buffer(buffer);

    await riz.sendMessage(
      id,
      {
        video: { url: mp4Url },
        mimetype: "video/mp4",
        caption: "stiker → video",
      },
      { quoted: msg }
    )
    
    