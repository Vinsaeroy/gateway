import fs from "fs";
import path from "path";
import JavaScriptObfuscator from "javascript-obfuscator";
import * as terser from "terser";
import "../config.js"

export const command = ["encjs"];

function getQuotedMessage(msg) {
  return msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}

function detectQuotedType(qm) {
  if (!qm) return null;
  const keys = Object.keys(qm);
  if (keys.includes("documentMessage")) return "documentMessage";
  if (keys.includes("extendedTextMessage")) return "extendedTextMessage";
  return keys[0] || null;
}

async function streamToBuffer(stream) {
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }
  return buffer;
}

export default async function run(msg, ctx) {
  const { riz, id, reply, isOwner, isPremiumUser, getUserLimit, useUserLimit, senderNum, DEFAULT_LIMIT } = ctx;

  if (!isOwner) {
    return reply(mess.owner)
  }

  const quoted = getQuotedMessage(msg);
  if (!quoted) {
    return reply("❌ Reply *file .js* dengan perintah *.encjs*");
  }

  const qType = detectQuotedType(quoted);
  if (qType !== "documentMessage" && qType !== "extendedTextMessage") {
    return reply("❌ Reply harus berupa *document .js* (atau teks JS).");
  }
  
      if (!isPremiumUser) {
        const bisa = useUserLimit(senderNum, 2);
        if (!bisa) {
            return reply(
                `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
            );
        }
    const sisa = getUserLimit(senderNum);
    reply(
        `🔢 Limit terpakai 2x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
    );
}

  let srcName = `file_${Date.now()}.js`;
  let srcCode = "";

  if (qType === "documentMessage") {
    const dm = quoted.documentMessage;
    const fileName = dm?.fileName || srcName;
    const mime = (dm?.mimetype || "").toLowerCase();

    const isJsByName =
      fileName.toLowerCase().endsWith(".js") ||
      fileName.toLowerCase().endsWith(".mjs") ||
      fileName.toLowerCase().endsWith(".cjs");

    const isJsByMime =
      mime.includes("javascript") ||
      mime.includes("application/octet-stream") ||
      mime.includes("text/plain");

    if (!isJsByName && !isJsByMime) {
      return reply("❌ File harus *.js / .mjs / .cjs*.");
    }

    const { downloadContentFromMessage } = await import("baileys");
    const stream = await downloadContentFromMessage(dm, "document");
    const buf = await streamToBuffer(stream);

    if (!buf?.length) {
      return reply("❌ Gagal ambil file. Coba kirim ulang.");
    }

    srcName = fileName;
    srcCode = buf.toString("utf8");
  }

  if (qType === "extendedTextMessage") {
    srcCode = quoted?.extendedTextMessage?.text || "";
    if (!srcCode.trim()) {
      return reply("❌ Teks JS kosong.");
    }
    srcName = `text_${Date.now()}.js`;
  }

  let minified = srcCode;

  try {
    const min = await terser.minify(srcCode, {
      module: true,
      compress: {
        passes: 3,
        drop_console: false,
        drop_debugger: true,
        keep_infinity: true,
      },
      mangle: {
        toplevel: true,
      },
      format: {
        comments: false,
      },
    });

    if (min?.code) {
      minified = min.code;
    }
  } catch {
    minified = srcCode;
  }

  let obf = "";

  try {
    const result = JavaScriptObfuscator.obfuscate(minified, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.6,
      debugProtection: false,
      debugProtectionInterval: 0,
      disableConsoleOutput: false,
      identifierNamesGenerator: "hexadecimal",
      numbersToExpressions: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 4,
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayCallsTransformThreshold: 1,
      stringArrayEncoding: ["base64"],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 5,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersParametersMaxCount: 5,
      stringArrayWrappersType: "function",
      sourceMap: false,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
    });

    obf = result.getObfuscatedCode();
  } catch (e) {
    return reply(`❌ Obfuscate gagal: ${e?.message || e}`);
  }

  const base = path.basename(srcName).replace(/\.(mjs|cjs|js)$/i, "");
  const outName = `obf_${base}.js`;
  const tmpPath = `./temp_encjs_${Date.now()}.js`;

  try {
    fs.writeFileSync(tmpPath, obf, "utf8");

    await riz.sendMessage(
      id,
      {
        document: fs.readFileSync(tmpPath),
        mimetype: "application/javascript",
        fileName: outName,
        caption: `✅ Obfuscation selesai.\n📄 Output: ${outName}`,
      },
      { quoted: msg }
    );
  } catch (e) {
    return reply(`❌ Gagal kirim file: ${e?.message || e}`);
  } finally {
    try {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    } catch {}
  }
}