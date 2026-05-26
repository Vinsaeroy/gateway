import axios from "axios";

export const command = ["ytvid", "ytaud"];

const API = "https://api.nekolabs.web.id/dwn/youtube/v2";

function pickBestAudio(medias = []) {
  const audios = medias.filter(m => m?.type === "audio" && m?.url);
  if (!audios.length) return null;

  const score = a => {
    const bitrate = Number(a.bitrate) || 0;
    const isDrc = a?.isDrc || /drc/i.test(String(a?.label || ""));
    const extBonus = a?.extension === "m4a" ? 20 : a?.extension === "mp3" ? 10 : 0;
    return bitrate + extBonus - (isDrc ? 50 : 0);
  };

  audios.sort((a, b) => score(b) - score(a));
  return audios[0];
}

function pickBestVideo(medias = [], height = 360) {
  const videos = medias.filter(m => m?.type === "video" && m?.url);
  if (!videos.length) return null;

  const targetLabel = `${Number(height) || 360}p`;

  const muxedExact = videos.find(
    v =>
      v?.is_audio === true &&
      (v?.label === targetLabel || v?.qualityLabel === targetLabel || v?.quality === targetLabel)
  );
  if (muxedExact) return muxedExact;

  const muxed = videos.filter(v => v?.is_audio === true);
  if (muxed.length) {
    muxed.sort((a, b) => {
      const da = Math.abs((Number(a?.height) || 0) - height);
      const db = Math.abs((Number(b?.height) || 0) - height);
      return da - db;
    });
    return muxed[0];
  }

  videos.sort((a, b) => {
    const da = Math.abs((Number(a?.height) || 0) - height);
    const db = Math.abs((Number(b?.height) || 0) - height);
    return da - db;
  });
  return videos[0];
}

async function fetchInfo(ytUrl) {
  const { data } = await axios.get(API, {
    params: { url: ytUrl },
    timeout: 30000
  });

  if (!data?.success) throw new Error("API success false");
  if (!data?.result?.success) throw new Error("Result success false");
  if (data?.result?.error) throw new Error("API error true");

  return data.result;
}

export default async function handler(m, ctx) {
  const { command, q, reply, riz, id, msg } = ctx;

  if (!q)
    return reply(
      `❌ Masukkan link YouTube\n\nContoh:\n.ytvid https://youtube.com/watch?v=xxxx | 360\n.ytaud https://youtube.com/watch?v=xxxx`
    );

  reply("⏳ Sedang diproses, mohon tunggu...");

  try {
    if (command === "ytvid") {
      let [url, quality] = q.split("|").map(v => v.trim());
      const height = Number(quality) || 360;

      const info = await fetchInfo(url);
      const media = pickBestVideo(info.medias, height);
      if (!media?.url) throw new Error("Video tidak ditemukan");

      const warnNoAudio = media?.is_audio ? "" : "\n\n⚠ Video ini kemungkinan *tanpa suara* (video-only).";

      await riz.sendMessage(
        id,
        {
          video: { url: media.url },
          caption:
            `🎥 *YouTube Video*\n` +
            `• Judul: ${info.title || "-"}\n` +
            `• Channel: ${info.author || "-"}\n` +
            `• Quality: ${media.label || media.qualityLabel || `${media.height || height}p`}\n` +
            `• Format: ${media.extension || "-"}${warnNoAudio}`
        },
        { quoted: msg }
      );
    }

    if (command === "ytaud") {
      const info = await fetchInfo(q);
      const media = pickBestAudio(info.medias);
      if (!media?.url) throw new Error("Audio tidak ditemukan");

      await riz.sendMessage(
        id,
        {
          audio: { url: media.url },
          mimetype: "audio/mp4",
          fileName: `${(info.title || "youtube").slice(0, 60)}.m4a`
        },
        { quoted: msg }
      );
    }
  } catch (e) {
    console.error("YT Nekolabs Error:", e?.message || e);
    reply("❌ Gagal mengambil media dari API. Coba link lain / ulangi beberapa saat lagi.");
  }
}