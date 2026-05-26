import fs from "fs";
import "../config.js";

const fle = new URL("../data/douyin_asupan.json", import.meta.url);
const r = fs.readFileSync(fle, "utf-8");
const ld = JSON.parse(r);

export const command = ["asupandouyin"];

export default async function handler(
    msg,
    {
        riz,
        id,
        reply,
        qriz,
        reactm,
        isPremiumUser,
        getUserLimit,
        useUserLimit,
        senderNum,
        DEFAULT_LIMIT
    }
) {
    if (!isPremiumUser) {
        return reply(`Khusus User Premium Bisa di beli di ${global.owner}`);
    }
    try {
        if (reactm) await reactm("🔥");
        const d = ld[Math.floor(Math.random() * ld.length)];
        await riz.sendMessage(
            id,
            {
                image: { url: d },
                caption: "Nih cuyy😋😍"
            },
            { quoted: qriz }
        );
    } catch (e) {
        reply(`❌ Error: ${e?.message ?? e}`);
    } finally {
        if (reactm) await reactm("");
    }
}
