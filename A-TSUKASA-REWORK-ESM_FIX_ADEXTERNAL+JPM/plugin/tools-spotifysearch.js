export const command = ["spotifysearch", "spotifys", "spotsearch"];

function pickPreview(preview) {
    if (!preview) return "No preview available";
    if (typeof preview === "string") return preview;
    return "No preview available";
}

export default async (m, { msg, riz, reply, qriz, id, q }) => {
    try {
        const query = (q || "").trim();
        if (!query) {
            return reply(
                `⚠️ Masukkan query!\n\nContoh:\n.spotifysearch serana`
            );
        }

        await riz.sendMessage(id, {
            react: { text: "⏳", key: msg.key }
        });

        const apiUrl = `https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(query)}`;
        const res = await fetch(apiUrl);
        const json = await res.json().catch(() => null);

        if (!json?.status) {
            return reply("❌ API error / status false.");
        }

        const list = Array.isArray(json.data) ? json.data : [];
        if (!list.length) {
            return reply(`❌ Tidak ada hasil untuk: *${query}*`);
        }

        const top = list.slice(0, 10);

        let out = `🎧 *SPOTIFY SEARCH*\n`;
        out += `🔎 Query: *${query}*\n`;
        out += `📦 Total: *${json.total_results || list.length}* hasil\n`;
        out += `🕒 ${json.timestamp ? `*${json.timestamp}*` : ""}\n\n`;

        top.forEach((v, i) => {
            out += `*#${i + 1} ${v.title || "Unknown Title"}*\n`;
            out += `• Artist: ${v.artist || "N/A"}\n`;
            out += `• Duration: ${v.duration || "N/A"}\n`;
            out += `• Album: ${v.album || "N/A"}\n`;
            out += `• Release: ${v.release_date || "N/A"}\n`;
            out += `• Preview: ${pickPreview(v.preview_url)}\n`;
            out += `• Link: ${v.track_url || "N/A"}\n`;
            if (i < top.length - 1) out += `\n━━━━━━━━━━━━━━\n\n`;
        });

        const firstThumb = top[0]?.thumbnail;

        if (firstThumb && typeof firstThumb === "string" && firstThumb.startsWith("http")) {
            await riz.sendMessage(
                id,
                {
                    image: { url: firstThumb },
                    caption: out
                },
                { quoted: qriz }
            );
        } else {
            reply(out);
        }
    } catch (e) {
        reply(`❌ Error: ${e.message}`);
    } finally {
        try {
            await riz.sendMessage(id, {
                react: { text: "", key: msg.key }
            });
        } catch {}
    }
};