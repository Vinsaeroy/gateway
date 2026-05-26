import axios from "axios";
import FormData from "form-data";
import { downloadContentFromMessage } from "baileys";

async function wastedGenerator(inputBuffer, options = {}) {
  if (!inputBuffer) throw new Error("Input gambar kosong");

  const buffer = Buffer.isBuffer(inputBuffer)
    ? Buffer.from(inputBuffer)
    : Buffer.from(new Uint8Array(inputBuffer));

  const {
    bannerTopPercent = 50,
    bannerWidthPercent = 80,
    isPublic = false
  } = options;

  const form = new FormData();
  form.append("image", buffer, {
    filename: "image.jpg",
    contentType: "image/jpeg"
  });

  form.append("bannerTopPercent", String(bannerTopPercent));
  form.append("bannerWidthPercent", String(bannerWidthPercent));
  form.append("isPublic", String(isPublic));

  const res = await axios.post("https://wastedgenerator.com/generate", form, {
    headers: {
      ...form.getHeaders(),
      origin: "https://wastedgenerator.com",
      referer: "https://wastedgenerator.com/",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107 Safari/537.36"
    },
    maxBodyLength: Infinity,
    timeout: 60000
  });

  if (!res.data?.success || !res.data?.filePath) {
    throw new Error("API gagal membuat gambar");
  }

  return {
    success: true,
    url: "https://wastedgenerator.com" + res.data.filePath,
    filePath: res.data.filePath
  };
}

async function toBufferFromImageMessage(imageMsg) {
  const stream = await downloadContentFromMessage(imageMsg, "image");
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

function getContextInfo(msg) {
  const m = msg?.message || {};
  return (
    m.extendedTextMessage?.contextInfo ||
    m.imageMessage?.contextInfo ||
    m.videoMessage?.contextInfo ||
    m.documentMessage?.contextInfo ||
    m.buttonsResponseMessage?.contextInfo ||
    m.listResponseMessage?.contextInfo ||
    m.templateButtonReplyMessage?.contextInfo ||
    m.interactiveResponseMessage?.contextInfo ||
    m.ephemeralMessage?.message?.extendedTextMessage?.contextInfo ||
    m.ephemeralMessage?.message?.imageMessage?.contextInfo ||
    m.ephemeralMessage?.message?.videoMessage?.contextInfo ||
    null
  );
}

function unwrapMessageContainer(quotedMessage) {
  if (!quotedMessage) return null;

  if (quotedMessage.viewOnceMessageV2?.message)
    return quotedMessage.viewOnceMessageV2.message;
  if (quotedMessage.viewOnceMessageV2Extension?.message)
    return quotedMessage.viewOnceMessageV2Extension.message;

  if (quotedMessage.ephemeralMessage?.message)
    return quotedMessage.ephemeralMessage.message;

  return quotedMessage;
}

function pickImageMessageFromMsg(msgObj) {
  if (!msgObj) return null;
  if (msgObj.imageMessage) return msgObj.imageMessage;
  if (msgObj.message?.imageMessage) return msgObj.message.imageMessage;
  return null;
}

export const command = ["wasted"];

export default async function handler(m, ctx) {
  const {
    riz,
    id,
    msg,
    reply,
    reactm,
    qriz,
    isPremiumUser,
    senderNum,
    useUserLimit,
    getUserLimit,
    DEFAULT_LIMIT
  } = ctx;

  try {
    const contextInfo = getContextInfo(msg);
    const quotedRaw = contextInfo?.quotedMessage || null;
    const quotedUnwrapped = unwrapMessageContainer(quotedRaw);
    const quotedImg = pickImageMessageFromMsg(quotedUnwrapped);

    const selfImg =
      msg.message?.imageMessage ||
      msg.message?.ephemeralMessage?.message?.imageMessage ||
      msg.message?.viewOnceMessageV2?.message?.imageMessage ||
      msg.message?.viewOnceMessageV2Extension?.message?.imageImageMessage ||
      msg.message?.viewOnceMessageV2Extension?.message?.imageMessage ||
      null;

    const targetImgMsg = quotedImg || selfImg;

    if (!targetImgMsg) {
      return reply("📷 Reply gambar / kirim gambar dengan caption *.wasted*");
    }

    if (!isPremiumUser) {
      const bisa = useUserLimit(senderNum, 1);
      if (!bisa) {
        return reply(
          `❌ Limit kamu sudah habis.\nKetik *.ceklimit* buat cek sisa limit.`
        );
      }
      const sisa = getUserLimit(senderNum);
      await reply(
        `🔢 Limit terpakai 1x.\nSisa limit: *${sisa}* / ${DEFAULT_LIMIT}`
      );
    }

    await reactm("⏳");

    const imgBuffer = await toBufferFromImageMessage(targetImgMsg);

    const result = await wastedGenerator(imgBuffer, {
      bannerTopPercent: 50,
      bannerWidthPercent: 80,
      isPublic: false
    });

    await riz.sendMessage(
      id,
      {
        image: { url: result.url },
        caption: "🔫 *Wasted!*"
      },
      { quoted: qriz }
    );

    await reactm("✅");
  } catch (e) {
    console.error("WASTED ERROR:", e);
    reply("🚨 Error: " + (e?.message || e));
  }
}