import FormData from "form-data";
import { downloadContentFromMessage } from "baileys";

async function uploadUguuFromBuffer(buffer, filename = "image.jpg") {
    const form = new FormData();
    form.append("files[]", buffer, {
        filename,
        contentType: "image/jpeg"
    });

    const res = await fetch("https://uguu.se/upload.php", {
        method: "POST",
        body: form,
        headers: form.getHeaders()
    });

    const json = await res.json().catch(() => null);
    return json?.files?.[0]?.url || null;
}

async function getAnimeTitleAniList(anilistId) {
    const query = `
    query ($id: Int) {
        Media(id: $id, type: ANIME) {
            title {
                romaji
                english
                native
            }
        }
    }`;

    const variables = { id: Number(anilistId) };

    const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
    });

    const json = await res.json().catch(() => null);
    return json?.data?.Media?.title || {};
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}

function getBestFrame(r) {
    if (!r?.anilist || !r?.filename || !r?.at || !r?.tokenthumb) return null;
    return `https://api.trace.moe/image/${r.anilist}/${encodeURIComponent(r.filename)}?t=${r.at}&token=${r.tokenthumb}`;
}

export const command = ["whatanime", "trace"];

export default async (m, { msg, riz, reply, qriz, id }) => {
    try {
        const quoted =
            msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        const mediaType = quoted
            ? Object.keys(quoted).find(t => ["imageMessage"].includes(t))
            : null;
        const targetImage = mediaType
            ? quoted[mediaType]
            : msg?.message?.imageMessage;

        if (!targetImage) {
            return reply(
                `⚠️ Kirim/reply gambar dengan caption *.whatanime* / *.trace*\n\nSaran: pakai cut scene biar akurat.`
            );
        }

        const mime = targetImage?.mimetype || "";
        if (!/image/i.test(mime)) return reply("⚠️ File yang kamu kirim bukan gambar!");

        await riz.sendMessage(id, {
            react: { text: "⏳", key: msg.key }
        });

        let buffer = Buffer.from([]);
        if (mediaType) {
            const stream = await downloadContentFromMessage(targetImage, "image");
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        } else {
            const stream = await downloadContentFromMessage(targetImage, "image");
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        }

        if (!buffer.length) return reply("🍂 Gagal membaca gambar (buffer kosong).");

        const imageUrl = await uploadUguuFromBuffer(buffer, `trace_${Date.now()}.jpg`);
        if (!imageUrl) return reply("🍂 Gagal upload gambar ke Uguu.");

        const apiUrl = `https://api.trace.moe/search?url=${encodeURIComponent(imageUrl)}`;
        const res = await fetch(apiUrl);
        const data = await res.json().catch(() => null);

        if (!data?.result?.length) {
            return reply("🍂 Tidak ada anime yang terdeteksi dari gambar ini.");
        }

        const results = data.result.sort((a, b) => b.similarity - a.similarity);

        if ((results?.[0]?.similarity || 0) < 0.7) {
            return reply("🍂 Kemiripan terlalu rendah (< 70%). Coba gambar yang lebih jelas.");
        }

        let output = `*🔍 Hasil Pencarian Anime*\n\n`;

        for (const [i, r] of results.slice(0, 3).entries()) {
            const title = await getAnimeTitleAniList(r.anilist);

            output += `*🎬 Hasil #${i + 1}*\n`;
            output += `• *Romaji:* ${title.romaji || "N/A"}\n`;
            output += `• *English:* ${title.english || "N/A"}\n`;
            output += `• *Native:* ${title.native || "N/A"}\n`;
            output += `• *Episode:* ${r.episode || "N/A"}\n`;
            output += `• *Waktu:* ${formatTime(r.from)} - ${formatTime(r.to)}\n`;
            output += `• *Kecocokan:* ${(r.similarity * 100).toFixed(2)}%\n`;
            output += `• *Preview:* ${r.image || "N/A"}\n`;

            if (i < 2) output += "\n━━━━━━━━━━━━━━\n\n";
        }

        const best = results[0];
        const bestFrame = getBestFrame(best);

        if (bestFrame) {
            await riz.sendMessage(
                id,
                { image: { url: bestFrame }, caption: output },
                { quoted: qriz }
            );
        } else if (best.image) {
            await riz.sendMessage(
                id,
                { image: { url: best.image }, caption: output },
                { quoted: qriz }
            );
        } else {
            reply(output);
        }
    } catch (e) {
        reply(`🍂 Gagal memproses gambar: ${e.message}`);
    } finally {
        try {
            await riz.sendMessage(id, {
                react: { text: "", key: msg.key }
            });
        } catch {}
    }
};