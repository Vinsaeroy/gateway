import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { downloadContentFromMessage, getContentType } from "baileys";

export const command = ["top4top", "bb"];

async function top4topUpload(filePath) {
  const f = new FormData();
  f.append("file_0_", fs.createReadStream(filePath), path.basename(filePath));
  f.append("submitr", "[ رفع الملفات ]");

  const html = await axios
    .post("https://top4top.io/index.php", f, {
      headers: {
        ...f.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
        Accept: "text/html",
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 60_000,
    })
    .then((x) => x.data)
    .catch(() => null);

  if (!html) return { status: "error" };

  const get = (re) => {
    const m = String(html).match(re);
    return m ? m[1] : null;
  };

  const result =
    get(/value="(https:\/\/[a-z]\.top4top\.io\/m_[^"]+)"/) ||
    get(/https:\/\/[a-z]\.top4top\.io\/m_[^\s"'<>]+/) ||
    get(/value="(https:\/\/[a-z]\.top4top\.io\/p_[^"]+)"/) ||
    get(/https:\/\/[a-z]\.top4top\.io\/p_[^\s"'<>]+/);

  const del =
    get(/value="(https:\/\/top4top\.io\/del[^"]+)"/) ||
    get(/https:\/\/top4top\.io\/del[^\s"'<>]+/);

  return { result, delete: del };
}

function getExtFromMime(mime = "") {
  if (!mime) return "";
  const clean = mime.split(";")[0]; // buang charset dll
  const ext = clean.split("/")[1];
  return ext ? "." + ext.toLowerCase() : "";
}

export default async function (msg, { riz, id, m, reply }) {
  const Xp = m?.Xp ? m.Xp : async () => {};
  const Xd = m?.Xd ? m.Xd : async () => {};
  const Xg = m?.Xg ? m.Xg : async () => {};

  const ctx =
    msg?.message?.extendedTextMessage?.contextInfo ||
    msg?.message?.imageMessage?.contextInfo ||
    msg?.message?.videoMessage?.contextInfo ||
    msg?.message?.stickerMessage?.contextInfo ||
    msg?.message?.documentMessage?.contextInfo ||
    null;

  const quoted = ctx?.quotedMessage || null;
  const targetMsg = quoted || msg?.message;

  const type = getContentType(targetMsg);
  const supported = ["documentMessage", "audioMessage", "videoMessage", "imageMessage"];
  if (!supported.includes(type)) {
    return reply(
      "Reply file *audio/video/image/document* lalu ketik:\n" +
        "• .top4top\n• .bb"
    );
  }

  const node = targetMsg[type];

  const tmpDir = path.resolve("./tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // ====== FORMAT ASLI ======
  let fileName = node?.fileName;
  if (!fileName) {
    const ext = getExtFromMime(node?.mimetype);
    fileName = `top4top_${Date.now()}${ext}`;
  }

  const safeName = String(fileName)
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 150);

  const tmpPath = path.join(tmpDir, `${Date.now()}_${safeName}`);

  try {
    await Xp();

    let streamType = "document";
    if (type === "imageMessage") streamType = "image";
    if (type === "videoMessage") streamType = "video";
    if (type === "audioMessage") streamType = "audio";

    const stream = await downloadContentFromMessage(node, streamType);

    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    fs.writeFileSync(tmpPath, buffer);

    const up = await top4topUpload(tmpPath);
    if (!up?.result) {
      await Xg();
      return reply("❌ Gagal upload ke top4top.");
    }

    await Xd();

    const caption =
  `✓ *TOP4TOP UPLOAD*\n\n` +
  `• Result : ${up.result}\n` +
  `• Delete : ${up.delete || "-"}`;

const targetId = up.result;
return riz.sendMessage(
  id,
  {
    text: caption,
    interactiveButtons: [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "Salin Result",
          copy_code: targetId,
        }),
      },
    ],
  },
  { quoted: msg }
);
  } catch (e) {
    await Xg();
    return reply("❌ Error: " + (e?.message || e));
  } finally {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
  }
}