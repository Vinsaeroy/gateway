import * as cheerio from "cheerio";

export const command = ["waparse", "wachannel"];

function parseFollowers(desc = "") {
    const m =
        desc.match(/([\d.,]+)\s*followers/i) ||
        desc.match(/([\d.,]+)\s*pengikut/i);

    if (!m) return null;

    const num = m[1].replace(/[.,]/g, "");
    const n = parseInt(num, 10);
    return Number.isFinite(n) ? n : null;
}

export default async (m, { msg, riz, reply, qriz, id, q }) => {
    try {
        const input = (q || "").trim();
        if (!input)
            return reply(
                `*Contoh:* .waparse https://whatsapp.com/channel/xxxxx`
            );

        await riz.sendMessage(id, {
            react: { text: "⏳", key: msg.key }
        });

        const url = input;
        const regex =
            /^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]+/i;

        if (!regex.test(url)) {
            return reply(
                "🍂 *URL tidak valid.* Pastikan link WhatsApp Channel publik."
            );
        }

        const res = await fetch(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
                Accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
        });

        if (!res.ok) {
            return reply("🍂 *Gagal mengambil halaman channel.*");
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        const name =
            $("meta[property='og:title']").attr("content")?.trim() ||
            "Tidak diketahui";

        const description =
            $("meta[property='og:description']").attr("content")?.trim() || "";

        const image =
            $("meta[property='og:image']").attr("content")?.trim() || null;

        const followers = parseFollowers(description);

        const caption = `📢 *Wa Channel Parse*

🧩 *Nama Channel:* ${name}
👥 *Followers:* ${
            followers !== null
                ? followers.toLocaleString("id-ID")
                : "Tidak diketahui"
        }
📝 *Deskripsi:* ${description || "Tidak tersedia"}

🔗 *Source:* ${url}`.trim();

        if (image && /^https?:\/\//i.test(image)) {
            await riz.sendMessage(
                id,
                {
                    image: { url: image },
                    caption
                },
                { quoted: qriz }
            );
        } else {
            reply(caption);
        }
    } catch (e) {
        reply(`🍂 *Terjadi error saat parsing channel.*\n${e.message}`);
    } finally {
        try {
            await riz.sendMessage(id, {
                react: { text: "", key: msg.key }
            });
        } catch {}
    }
};