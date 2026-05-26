import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import "../config.js"

export const command = ["gethtml"];

export default async function getHtmlPlugin(m, ctx) {
    const {
        riz,
        id,
        q,
        msg,
        reply,
        senderNum,
        reactm,
        isPremiumUser
    } = ctx;
    
        if (!isPremiumUser) {
        return reply(`Khusus User Premium Bisa di beli di ${global.owner}`);
    }

    if (!q) {
        return reply("Contoh:\n.gethtml https://example.com");
    }

    if (!/^https?:\/\//i.test(q)) {
        return reply("❌ URL tidak valid (harus http / https)");
    }

    try {
        await reactm("⏳");

        const res = await fetch(q, {
            headers: {
                "User-Agent": "Mozilla/5.0 (gethtml-plugin)"
            },
            timeout: 15000
        });

        if (!res.ok) {
            await reactm("❌");
            return reply(`❌ Gagal ambil HTML\nStatus: ${res.status}`);
        }

        const html = await res.text();

        const tmpDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        const filePath = path.join(
            tmpDir,
            `html_${Date.now()}.html`
        );

        fs.writeFileSync(filePath, html);

        await riz.sendMessage(
            id,
            {
                document: fs.readFileSync(filePath),
                mimetype: "text/html",
                fileName: "source.html"
            },
            { quoted: msg }
        );

        fs.unlinkSync(filePath);
        await reactm("✅");

    } catch (err) {
        console.error("GETHTML PLUGIN ERROR:", err);
        await reactm("❌");
        reply("❌ Error saat mengambil HTML\n" + err.message);
    }
}