// plugin/playstore.js
export const command = ["playstore"];
import axios from "axios"

export default async function handler(msg, ctx) {
    const { riz, id, sender, reply, q, qriz } = ctx;

    try {
        if (!q) return reply("❌ Contoh: .playstore WhatsApp");

        await reply("🔍 Sedang mencari di Play Store...");

        const { data } = await axios.get("https://api.jarroffc.my.id/search/playstore", {
            params: {
                apikey: "jarroffc",
                q: q
            }
        });

        if (!data?.result?.length) return reply("❌ Aplikasi tidak ditemukan.");

        const list = data.result.slice(0, 5);

        const hasil = list.map((v, i) => {
            return `📱 *${i + 1}. ${v.nama || "No name"}*
👤 Developer: ${v.developer || "Tidak diketahui"}
⭐ Rating: ${v.rate2 || v.rate || "No rating"}
🔗 Link: ${v.link}
👨‍💻 Developer Link: ${v.link_dev}`;
        }).join("\n\n");

        const caption = `*Playstore Search Result 📲*\n\n${hasil}`;

        await riz.sendMessage(
            id,
            {
                image: {
                    url: list[0].img || "https://files.catbox.moe/dklg5y.jpg"
                },
                caption
            },
            { quoted: qriz }
        );

    } catch (err) {
        console.error("❌ PLAYSTORE ERROR:", err);
        reply("❌ Terjadi kesalahan: " + (err.message || "Unknown error"));
    }
}