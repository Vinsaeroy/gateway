import axios from "axios";

export const command = ["resepharian", "resep"];

export default async function run(msg, ctx) {
    const { riz, id, reply, qriz } = ctx;

    try {
        const url =
            "https://raw.githubusercontent.com/Rizkygamers/waifuim-img/refs/heads/main/resep.json";

        const res = await axios.get(url, { timeout: 10000 });
        const data = res.data;

        const list =
            data && data.resep_harian && Array.isArray(data.resep_harian)
                ? data.resep_harian
                : null;

        if (!list || list.length === 0) {
            return reply("⚠️ Data resep tidak ditemukan atau kosong.");
        }

        const parsed = list
            .map(item => {
                const keys = Object.keys(item || {});
                if (keys.length === 0) return null;
                const v = item[keys[0]];
                return typeof v === "string" ? v : JSON.stringify(v, null, 2);
            })
            .filter(Boolean);

        if (parsed.length === 0) {
            return reply("⚠️ Format data resep tidak sesuai.");
        }

        const pick = parsed[Math.floor(Math.random() * parsed.length)];
        await riz.sendMessage(
            id,
            {
                text: pick
            },
            { quoted: qriz }
        );
    } catch (err) {
        console.error(
            "resepharian plugin error:",
            err && err.message ? err.message : err
        );
        try {
            reply(
                "❌ Terjadi kesalahan saat mengambil resep. Coba lagi nanti."
            );
        } catch {}
    }
}
