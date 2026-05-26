import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { downloadContentFromMessage } from "baileys";

export const command = ["tomp3"];

export default async function run(m, { riz, reply, qriz, id, msg, reactm }) {
  try {
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) return reply("⚠️ Balas video atau audio dulu!");

    const mediaType = Object.keys(quotedMsg).find(type =>
      ["audioMessage", "videoMessage"].includes(type)
    );
    if (!mediaType) return reply("⚠️ Yang direply harus video atau audio!");

    reactm("⏳");

    const stream = await downloadContentFromMessage(quotedMsg[mediaType], mediaType.includes("audio") ? "audio" : "video");

    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    const tempDir = path.resolve("./temp");
    await fs.promises.mkdir(tempDir, { recursive: true });

    const inputPath = path.join(tempDir, `input_${Date.now()}.dat`);
    const mp3Path = path.join(tempDir, `output_${Date.now()}.mp3`);

    await fs.promises.writeFile(inputPath, buffer);

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i", inputPath,
        "-vn",
        "-acodec", "libmp3lame",
        "-b:a", "192k",
        "-y",
        mp3Path,
      ]);

      ffmpeg.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
      ffmpeg.on("error", reject);
    });

    await riz.sendMessage(id, {
      audio: fs.readFileSync(mp3Path),
      mimetype: "audio/mpeg",
      ptt: false
    }, {
      quoted: qriz
    });

    await fs.promises.unlink(inputPath).catch(() => {});
    await fs.promises.unlink(mp3Path).catch(() => {});
  } catch (err) {
    console.error("❌ toMP3 Error:", err);
    reply(`⚠️ Gagal ubah ke MP3: ${err.message}`);
  }
}