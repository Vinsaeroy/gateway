import axios from "axios";
import fs from "fs";
import { Sticker, StickerTypes } from "wa-sticker-formatter";
import { downloadContentFromMessage } from "baileys";
import UguuUpload from "../scrape/Uguu.js";
import CatboxMoe from "../scrape/CatBox.js";
import "../config.js";

export const command = ["smeme"];

async function getBuffer(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

export default async function smeme(m, ctx) {
    const { riz, msg, reply, q, id } = ctx;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return reply("❌ Reply gambar atau stiker!");

    const mediaMsg = quoted.imageMessage || quoted.stickerMessage;
    if (!mediaMsg) return reply("❌ Reply gambar atau stiker!");
    if (!q) return reply("contoh:\n.smeme atas|bawah\n.smeme atas\n.smeme |bawah");

    const type = quoted.imageMessage ? "image" : "sticker";
    const buffer = await getBuffer(mediaMsg, type);

    const tmp = `./temp_${Date.now()}.jpg`;
    fs.writeFileSync(tmp, buffer);

    let upload;
    try {
        upload = await UguuUpload(tmp, "smeme.jpg");
    } catch {
        upload = await CatboxMoe(tmp);
    }

    fs.unlinkSync(tmp);

    const bg = encodeURIComponent(upload.url);

    const text = q || "";
    let textAtas = "";
    let textBawah = "";

    if (text.includes("|")) {
        const [atas, bawah] = text.split("|").map(v => v.trim());
        if (atas) textAtas = atas;
        if (bawah) textBawah = bawah;
    } else if (text) {
        textAtas = text;
    }

    const apiUrl =
        `https://api.nexray.web.id/maker/smeme?` +
        `text_atas=${encodeURIComponent(textAtas)}` +
        `&text_bawah=${encodeURIComponent(textBawah)}` +
        `&background=${bg}`;

    const res = await axios.get(apiUrl, {
        responseType: "arraybuffer"
    });

    const sticker = new Sticker(res.data, {
        pack: global.pack,
        author: global.author,
        type: StickerTypes.FULL,
        quality: 50
    });

    await riz.sendMessage(id, await sticker.toMessage(), {
        quoted: msg
    });
}