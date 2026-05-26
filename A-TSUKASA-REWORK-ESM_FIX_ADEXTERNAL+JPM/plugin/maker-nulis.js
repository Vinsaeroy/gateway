import axios from "axios";

export const command = ["nulis", "tulis"];

export default async function nulisPlugin(m, ctx) {
    const {
        riz,
        id,
        q,
        msg,
        reply,
        reactm
    } = ctx;

    if (!q) return reply("textnya mana anjim???");

    try {
        await reactm("⏳");

        const apiUrl =
            "https://brat.siputzx.my.id/nulis?text=" +
            encodeURIComponent(q);

        const res = await axios.get(apiUrl, {
            responseType: "arraybuffer"
        });

        await riz.sendMessage(
            id,
            {
                image: Buffer.from(res.data),
                caption:
                    `📝 *Hasil Tulisan*\n\n` +
                    `📌 *Teks:* ${q}`
            },
            { quoted: msg }
        );

        await reactm("✅");

    } catch (err) {
        console.error("NULIS PLUGIN ERROR:", err);
        await reactm("❌");
        reply("❌ Error\nLogs: " + err.message);
    }
}