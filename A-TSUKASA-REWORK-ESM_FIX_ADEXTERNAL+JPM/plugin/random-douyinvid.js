import fetch from "node-fetch";
import "../config.js";

export const command = ["asupandouyinvid"];

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
    reactm("🔥");
        
        const response = await fetch("https://raw.githubusercontent.com/Rizkygamers/waifuim-img/e2d04e648ade34b74c28f5bbe199203e5735a766/douyinvid.json");
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
            return reply("❌ Data video tidak tersedia");
        }
        
        const randomVideo = data[Math.floor(Math.random() * data.length)];
        
        if (!randomVideo || typeof randomVideo !== 'string') {
            return reply("❌ Format data tidak valid");
        }
        
        await riz.sendMessage(
            id,
            {
                video: { url: randomVideo },
                caption: "Nih cuyy😋"
            },
            { quoted: qriz }
        );
        
    } catch (e) {
        console.error("Asupan Douyin Vid Error:", e);
        reply(`❌ Error: ${e?.message ?? e}`);
    } finally {
    reactm("");
    }
}