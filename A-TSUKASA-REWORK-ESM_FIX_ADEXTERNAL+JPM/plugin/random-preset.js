import fs from "fs";
import path from "path";
import "../config.js";

export const command = ["preset"];

export default async (
    m,
    {
        reply,
        pushname,
        msg,
        riz,
        qriz,
        id,
        isPremiumUser,
        useUserLimit,
        getUserLimit,
        DEFAULT_LIMIT,
        senderNum
    }
) => {
    const dataPath = path.resolve("./data/presets.json");
    if (!fs.existsSync(dataPath)) return reply("❌ file.json tidak ditemukan!");

    let raw = fs.readFileSync(dataPath, "utf8");
    let json;
    try {
        json = JSON.parse(raw);
    } catch (e) {
        return reply("❌ file.json error (tidak bisa parse JSON)");
    }

    const list = json.data_preset || [];
    if (!Array.isArray(list) || list.length === 0)
        return reply("❌ Tidak ada preset di file.json!");

    if (!isPremiumUser) {
        const bisa = useUserLimit(senderNum, 3);
        if (!bisa) {
            return reply(
                `❌ Limit kamu sudah habis.\n\n` +
                    `Silakan hubungi owner untuk isi ulang premium / limit:\n` +
                    `${global.owner}`
            );
        }

        const sisa = getUserLimit(senderNum);
        reply(
            `🔢 Limit terpakai 3x.\n` +
                `Sisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
        );
    }

    const pick = list[Math.floor(Math.random() * list.length)];

    const videoUrl = pick.video;
    const presetUrl = pick.preset;

    await riz.sendMessage(id, { react: { text: "⏳", key: msg.key } });

    try {
        await riz.sendMessage(
            id,
            {
                video: { url: videoUrl },
                caption: `🎛️ *Preset:* ${presetUrl}`
            },
            { quoted: qriz }
        );

        await riz.sendMessage(id, { react: { text: "✅", key: msg.key } });
    } catch (err) {
        await riz.sendMessage(id, { react: { text: "❌", key: msg.key } });
        reply("❌ Gagal mengirim video preset.");
    }
};
