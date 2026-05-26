export const command = ["fbdl", "fb", "facebook"]

import "../config.js"
import axios from 'axios';
import FormData from "form-data";
import * as cheerio from "cheerio";

export default async (m, {
  reply, pushname, msg, riz, qriz, q, id, isPremiumUser, useUserLimit, getUserLimit, senderNum, DEFAULT_LIMIT
}) => {

        if (!q) return reply("🔗 Masukkan URL Facebook!\nContoh: *.fb https://fb.watch/xxxxx");
        if (!q.includes('facebook.com') && !q.includes('fb.watch')) return reply("⚠️ URL tidak valid, pastikan itu link Facebook!");
        
    if (!isPremiumUser) {
        const bisa = useUserLimit(senderNum, 1);
        if (!bisa) {
            return reply(
                `❌ Limit kamu sudah habis.\n\n
            Silakan hubungi owner untuk isi ulang premium / limit:\n
            ${global.owner}`
            );
        }
    const sisa = getUserLimit(senderNum);
    reply(
        `🔢 Limit terpakai 1x.\nSisa limit kamu: *${sisa}* / ${DEFAULT_LIMIT}`
    );
}
        
        await riz.sendMessage(id, {
          react: {
            text: "⏳", key: msg.key
          }
        });

        async function downloadFacebook(url) {
          try {
            const {
              data
            } = await axios.post('https://yt5s.io/api/ajaxSearch', new URLSearchParams( {
                q: url,
                vt: 'home'
              }), {
                headers: {
                  "Accept": "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "Content-Type": "application/x-www-form-urlencoded"
                }
              });
            if (data.status !== "ok") throw new Error("Gagal mengambil data dari server.");

            const $ = cheerio.load(data.data);
            const thumb = $('img').attr("src");
            const links = [];
            $('table tbody tr').each((_, el) => {
              const quality = $(el).find('.video-quality').text().trim();
              const link = $(el).find('a.download-link-fb').attr("href");
              if (quality && link) links.push({
                quality, link
              });
            });

            if (links.length > 0) return {
              type: "video",
              thumb,
              media: links[0].link
            };
            else if (thumb) return {
              type: "image",
              media: thumb
            };
            throw new Error("Tidak ada media yang bisa diunduh.");
          } catch (error) {
            return {
              error: error.message
            };
          }
        }

        try {
          const res = await downloadFacebook(q);
          if (res.error) {
            await riz.sendMessage(id, {
              react: {
                text: "❌", key: msg.key
              }
            });
            return reply(`❌ Error: ${res.error}`);
          }

          if (res.type === "video") {
            await riz.sendMessage(id, {
              video: {
                url: res.media
              },
              caption: "🌸 Nih~ video Facebook buat onii-chan 💕",
              quoted: qriz
            });
          } else if (res.type === "image") {
            await riz.sendMessage(id, {
              image: {
                url: res.media
              },
              caption: "✅ Gambar dari Facebook!",
              quoted: qriz
            });
          }
        } catch (e) {
          console.error("FB Download Error:", e);
          reply("❌ Gagal mengunduh media.");
        } finally {
          await riz.sendMessage(id, {
            react: {
              text: "", key: msg.key
            }
          });
        }

}