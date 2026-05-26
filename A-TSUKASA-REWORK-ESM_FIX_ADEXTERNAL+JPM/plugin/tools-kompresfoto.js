export const command = ["tiny", "kompresimg", "kompresfoto"];
import {
  downloadContentFromMessage
} from "baileys"
import axios from "axios";
import sharp from "sharp";
import fs from "fs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default async (m, {
  riz, reply, id, qriz, msg
}) => {
  try {
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    let mediaMessage = null;
    if (quoted?.imageMessage) mediaMessage = quoted.imageMessage;
    else if (msg.message?.imageMessage) mediaMessage = msg.message.imageMessage;
    else if (msg.message?.documentMessage?.mimetype?.startsWith("image/"))
      mediaMessage = msg.message.documentMessage;

    if (!mediaMessage) {
      return reply(`Reply foto atau kirim foto dengan command .tiny`);
    }

    const stream = await downloadContentFromMessage(mediaMessage, "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    if (!buffer.length) return reply("Gambar tidak terbaca.");
    if (buffer.length > MAX_SIZE) return reply("Ukuran gambar maksimal 5MB!");

    const beforeSize = buffer.length;

    buffer = await sharp(buffer)
    .resize({
      width: Math.floor(0.6 * 1024)
    }) // 600px
    .toBuffer();

    // TinyJPG compress
    async function tinyOnce(buf, cookies = "") {
      const res = await axios.post("https://tinyjpg.com/backend/opt/shrink", buf, {
        headers: {
          "Content-Type": "image/png",
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://tinyjpg.com/",
          "Origin": "https://tinyjpg.com",
          "Cookie": cookies
        },
        responseType: "json"
      });
      return res.data;
    }

    async function fetchOutput(url) {
      const res = await axios.get(url, {
        responseType: "arraybuffer"
      });
      return Buffer.from(res.data);
    }

    async function tinyCompress(buf, times = 3) {
      for (let i = 0; i < times; i++) {
        const json = await tinyOnce(buf);
        buf = await fetchOutput(json.output.url);
      }
      return buf;
    }

    const compressed = await tinyCompress(buffer, 3);

    await riz.sendMessage(
      id,
      {
        image: compressed,
        caption: `*Kompresi berhasil!*\n\n` +
        `• Sebelum: ${(beforeSize / 1024).toFixed(2)} KB\n` +
        `• Sesudah: ${(compressed.length / 1024).toFixed(2)} KB`
      },
      {
        quoted: qriz
      }
    );

  } catch (e) {
    console.error("KOMPRES FOTO ERROR:", e);
    reply("❌ Gagal memproses kompresi.");
  }
};