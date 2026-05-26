import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { downloadContentFromMessage } from "baileys";

export const command = ["tovn"];

export default async function run(
    m,
    {
        riz,
        reply,
        qriz,
        id,
        msg,
        reactm,
        isPremiumUser,
        getUserLimit,
        useUserLimit,
        senderNum,
        DEFAULT_LIMIT
    }
) {
    try {
        const quotedMsg =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) return reply("⚠️ Balas audio dulu ya!");

        const mediaType = Object.keys(quotedMsg).find(type =>
            ["audioMessage"].includes(type)
        );
        if (!mediaType) return reply("⚠️ Yang direply harus audio!");

        if (!isPremiumUser) {
            const bisa = useUserLimit(senderNum, 1);
            if (!bisa) {
                return reply(
                    `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
                );
            }
            const sisa = getUserLimit(senderNum);
            reply(
                `🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
            );
        }

        reactm("⏳");

        const stream = await downloadContentFromMessage(
            quotedMsg[mediaType],
            "audio"
        );
        let buffer = Buffer.from([]);
        for await (const chunk of stream)
            buffer = Buffer.concat([buffer, chunk]);

        const tempDir = path.resolve("./temp");
        await fs.promises.mkdir(tempDir, { recursive: true });

        const audioPath = path.join(tempDir, `input_${Date.now()}.mp3`);
        const opusPath = path.join(tempDir, `output_${Date.now()}.opus`);
        await fs.promises.writeFile(audioPath, buffer);

        await new Promise((resolve, reject) => {
            const ffmpeg = spawn("ffmpeg", [
                "-i",
                audioPath,
                "-c:a",
                "libopus",
                "-b:a",
                "128k",
                "-ar",
                "16000",
                "-ac",
                "1",
                "-vbr",
                "on",
                "-application",
                "voip",
                "-f",
                "opus",
                "-y",
                opusPath
            ]);

            ffmpeg.on("close", code => {
                if (code === 0) resolve();
                else reject(new Error(`FFmpeg exited with code ${code}`));
            });
            ffmpeg.on("error", reject);
        });

        await riz.sendMessage(
            id,
            {
                audio: fs.readFileSync(opusPath),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            },
            { quoted: qriz }
        );

        await fs.promises.unlink(audioPath).catch(() => {});
        await fs.promises.unlink(opusPath).catch(() => {});
    } catch (err) {
        console.error("❌ toVN Error:", err);
        reply(`⚠️ Gagal ubah ke VN: ${err.message}`);
    }
}
