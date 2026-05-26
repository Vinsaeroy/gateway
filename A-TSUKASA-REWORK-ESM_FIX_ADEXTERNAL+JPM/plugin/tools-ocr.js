import fs from "fs";
import axios from "axios";
import '../config.js';
import UguuUpload from '../scrape/Uguu.js';
import {
  downloadContentFromMessage
} from "baileys";

export const command = ["ocr"];

export default async function (m, { riz, reply, msg }) {
  try {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) return reply("⚠️ Balas gambar dengan command *.ocr*");

    const mediaType = Object.keys(quotedMsg).find((t) => ["imageMessage"].includes(t));
    if (!mediaType) return reply("⚠️ Yang direply harus gambar ya!");

    reply(mess.wait);

    const stream = await downloadContentFromMessage(quotedMsg[mediaType], "image");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    if (!buffer.length) return reply("❌ Gagal ambil gambar!");

    const tempFile = `./temp_ocr_${Date.now()}.jpg`;
    fs.writeFileSync(tempFile, buffer);

    const uploaded = await UguuUpload(tempFile, `ocr_${Date.now()}.jpg`);
    fs.unlinkSync(tempFile);

    if (!uploaded?.url || !uploaded.url.startsWith("http")) return reply("❌ Gagal upload ke Uguu.");

    const apiUrl = `https://api.elrayyxml.web.id/api/tools/ocr?url=${encodeURIComponent(uploaded.url)}`;
    const res = await axios.get(apiUrl);

    const data = res.data;
    if (data?.status && data?.result?.text) {
      reply(`📝 *Hasil OCR:*\n\n${data.result.text}`);
    } else {
      reply("⚠️ Gagal ambil teks dari hasil OCR.");
    }

  } catch (err) {
    console.error("❌ OCR Error:", err);
    reply("⚠️ Terjadi kesalahan saat proses OCR, coba lagi nanti.");
  }
}