import axios from "axios";

export const command = ["cecanchina", "cecan-china", "cecankorea", "cecan-korea", "cecanvietnam", "cecan-vietnam"];

export default async function handler(m, PLUGIN_CTX) {
    const { riz, id, command, qriz, reply } = PLUGIN_CTX;
    
    const apiMap = {
        "cecanchina": "china",
        "cecan-china": "china",
        "cecankorea": "korea",
        "cecan-korea": "korea",
        "cecanvietnam": "vietnam",
        "cecan-vietnam": "vietnam"
    };
    
    const country = apiMap[command];
    if (!country) return;

    const apiUrl = `https://api.nekolabs.web.id/random/girl/${country}`;

    try {
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer'
        });
        
        await riz.sendMessage(id, { 
            image: response.data,
            caption: `✨ ${command}`
        }, { quoted: qriz });
    } catch (error) {
        console.error("API Error:", error);
        await reply("❌ Gagal mengambil gambar. Coba lagi nanti.");
    }
}