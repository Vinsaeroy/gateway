export const command = ["capcut"];

import axios from "axios";
import zlib from "zlib";
import "../config.js";

async function cangcutApi(url) {
  const headers = {
    'Host': '3bic.com',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'Origin': 'https://3bic.com',
    'Referer': 'https://3bic.com/',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
  };

  const payload = {
    url
  };

  const res = await axios.post(
    'https://3bic.com/api/download',
    payload,
    {
      headers,
      responseType: 'arraybuffer',
      decompress: false
    }
  );

  let data = res.data;
  const encoding = res.headers['content-encoding'];

  if (encoding === 'br') {
    data = zlib.brotliDecompressSync(data);
  } else if (encoding === 'gzip') {
    data = zlib.gunzipSync(data);
  } else if (encoding === 'deflate') {
    data = zlib.inflateSync(data);
  }

  const json = JSON.parse(data.toString());

  if (json.originalVideoUrl && json.originalVideoUrl.startsWith('/')) {
    json.originalVideoUrl = 'https://3bic.com' + json.originalVideoUrl;
  }

  return json;
}

export default async (m, {
  riz, reply, qriz, id, q
}) => {
  try {
    if (!q) return reply("⚠️ Masukkan link videonya.");

    reply(mess.wait)

    const data = await cangcutApi(q);
    if (!data.originalVideoUrl) {
      return reply("❌ Gagal ambil link video.");
    }

    // Download video buffer
    const vid = await axios.get(data.originalVideoUrl, {
      responseType: "arraybuffer"
    });

    await riz.sendMessage(
      id,
      {
        video: Buffer.from(vid.data),
        mimetype: "video/mp4",
        caption: "🎬 *Done!*"
      },
      {
        quoted: qriz
      }
    );

  } catch (e) {
    console.error("CANGCUT ERROR:", e);
    reply("❌ Gagal mengambil video.");
  }
};