export const command = ["douyin", "dy", "douyindl"]

import "../config.js"
import axios from 'axios';
import FormData from "form-data";
import * as cheerio from "cheerio";

export default async (m, {
  reply, pushname, msg, riz, qriz, q, id, reactm
}) => {

  if (!q) return reply(`⚠️ Masukin link Douyin.\n\nContoh:\n.douyin https://v.douyin.com/xxxx/`);
  reactm("⏳");

  try {
    const calculateHash = (url, salt) => {
      const urlBase64 = Buffer.from(url, "utf-8").toString("base64");
      const saltBase64 = Buffer.from(salt, "utf-8").toString("base64");
      return urlBase64 + (url.length + 1000) + saltBase64;
    };

    const getDownloadToken = async () => {
      const response = await axios.get("https://snapdouyin.app/", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
        timeout: 60000,
      });

      const $ = cheerio.load(response.data);
      const token = $("input#token").attr("value");
      if (!token) throw new Error("Token not found in the webpage");
      return token;
    };

    const downloadDouyinVideo = async (videoUrl) => {
      const token = await getDownloadToken();
      const hash = calculateHash(videoUrl, "aio-dl");

      const formData = new URLSearchParams();
      formData.append("url", videoUrl);
      formData.append("token", token);
      formData.append("hash", hash);

      const response = await axios.post(
        "https://snapdouyin.app/wp-json/mx-downloader/video-data/",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          timeout: 60000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );

      return response.data;
    };

    const findFirstUrlDeep = (obj) => {
      const urls = [];
      const walk = (v) => {
        if (!v) return;
        if (typeof v === "string") {
          if (
            /^https?:\/\/.+/i.test(v) &&
            (v.includes(".mp4") ||
              v.includes("video") ||
              v.includes("douyin") ||
              v.includes("aweme") ||
              v.includes("snapcdn"))
          ) {
            urls.push(v);
          }
          return;
        }
        if (Array.isArray(v)) return v.forEach(walk);
        if (typeof v === "object") {
          for (const k of Object.keys(v)) walk(v[k]);
        }
      };
      walk(obj);
      return urls[0] || null;
    };

    const res = await downloadDouyinVideo(q);

    const videoUrl =
      res?.data?.no_watermark ||
      res?.data?.nwm ||
      res?.data?.video ||
      res?.data?.video_no_watermark ||
      res?.data?.download ||
      res?.data?.url ||
      findFirstUrlDeep(res);

    if (!videoUrl || typeof videoUrl !== "string") {
      return reply("❌ Gagal mengambil URL video dari response.");
    }

    await riz.sendMessage(
      id,
      { video: { url: videoUrl }, caption: "✅ Douyin downloaded" },
      { quoted: qriz }
    );
  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }

}