export const command = ["speechwriter"]
import axios from "axios"
import "../config.js"

export default async (m, {
  reply, pushname, q
}) => {

      if (!q) return reply("Contoh: .speechwriter Tulis pidato tentang pentingnya pendidikan");
      reply(mess.wait);
      try {
        let res = await axios.post("https://www.junia.ai/api/free-tools/generate", {
          details: q,
          op: "ai-speech-writer"
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-client-version': '4',
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.179 Mobile Safari/537.36',
            'x-requested-with': 'com.chromasterZ.vn',
            origin: 'https://www.junia.ai',
            referer: 'https://www.junia.ai/tools/ai-speech-writer',
            accept: '*/*',
          }
        });

        let hasil = res.data.result || res.data;
        if (!hasil) return reply("⚠️ Tidak ada hasil dari Speech Writer.");
        await reply(`*Speech Writer*\n\n${hasil}`);
      } catch (e) {
        console.error(e.response?.data || e.message);
        reply("❌ Layanan Speech Writer sedang error.");
      }

}