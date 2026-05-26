import axios from "axios";

const PARSE_ENDPOINT =
  "https://api.vidssave.com/api/contentsite_api/media/parse";

const DEFAULT_FORM = {
  auth: "20250901majwlqo",
  domain: "api-ak.vidssave.com",
  origin: "cache"
};

const HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
  "content-type": "application/x-www-form-urlencoded",
  origin: "https://vidssave.com",
  referer: "https://vidssave.com/"
};

const isUrl = (s = "") => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

const toSeconds = v => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const secToClock = sec => {
  const s = Math.max(0, Math.floor(toSeconds(sec)));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = x => String(x).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
};

const pickBestAudio = (formats = []) => {
  const auds = formats.filter(f => (f?.type || "").toLowerCase() === "audio");
  if (!auds.length) return null;

  const score = f => {
    const fmt = String(f.format || "").toUpperCase();
    const q = String(f.quality || "").toUpperCase();
    const kbps = Number((q.match(/(\d+)\s*KBPS/) || [])[1] || 0);
    const isM4A = fmt === "M4A";
    const isOPUS = fmt === "OPUS";
    const isWEBM = fmt === "WEBM";
    const typeScore = isM4A ? 30 : isOPUS ? 20 : isWEBM ? 10 : 0;
    const size = Number(f.size || 0) || 0;
    return typeScore * 1e9 + kbps * 1e6 + size;
  };

  return auds.sort((a, b) => score(b) - score(a))[0];
};

const pickVideoByQuality = (formats = [], want = 720) => {
  const vids = formats.filter(f => (f?.type || "").toLowerCase() === "video");
  if (!vids.length) return null;

  const parseP = q =>
    Number((String(q).toUpperCase().match(/(\d+)\s*P/) || [])[1] || 0);

  const wantN = Number(want) || 720;

  const mp4 = vids.filter(v => String(v.format || "").toUpperCase() === "MP4");
  const pool = mp4.length ? mp4 : vids;

  const exact = pool.find(v => parseP(v.quality) === wantN);
  if (exact) return exact;

  const sorted = pool
    .filter(v => parseP(v.quality) > 0)
    .sort((a, b) => parseP(b.quality) - parseP(a.quality));

  const bestLE = sorted.find(v => parseP(v.quality) <= wantN);
  if (bestLE) return bestLE;

  return sorted[0] || pool[0];
};

const resolveFinalUrl = async url => {
  if (!url || !isUrl(url)) return url;
  try {
    const r = await axios.get(url, {
      maxRedirects: 5,
      timeout: 30000,
      headers: { "user-agent": HEADERS["user-agent"] },
      responseType: "stream",
      validateStatus: s => s >= 200 && s < 400
    });

    const finalUrl = r?.request?.res?.responseUrl || r?.headers?.location || url;
    try { r.data?.destroy?.(); } catch {}
    return finalUrl;
  } catch {
    return url;
  }
};

const ytdl = async link => {
  if (!link || !isUrl(link)) throw new Error("Link tidak valid.");

  const body = new URLSearchParams({ ...DEFAULT_FORM, link }).toString();

  const res = await axios.post(PARSE_ENDPOINT, body, {
    headers: HEADERS,
    timeout: 60000
  });

  const data = res?.data?.data;
  if (!data) throw new Error("Response parse kosong.");

  const { title, thumbnail, duration, resources } = data;

  return {
    title: title || "Unknown",
    thumbnail: thumbnail || "",
    duration: toSeconds(duration),
    formats: Array.isArray(resources)
      ? resources.map(r => ({
          type: r.type,
          quality: r.quality,
          format: r.format,
          size: r.size,
          url: r.download_url
        }))
      : []
  };
};

const download = async (link, format = "720") => {
  try {
    const info = await ytdl(link);

    if (String(format).toLowerCase() === "mp3" || String(format).toLowerCase() === "audio") {
      const picked = pickBestAudio(info.formats);
      if (!picked?.url) return { status: false, error: "Audio format tidak tersedia." };

      const finalUrl = await resolveFinalUrl(picked.url);
      const ext = String(picked.format || "").toLowerCase() || "m4a";

      return {
        status: true,
        result: {
          title: info.title,
          download: finalUrl,
          duration: secToClock(info.duration),
          durationSec: info.duration,
          quality: picked.quality,
          size: picked.size,
          ext,
          mimetype: ext === "opus" || ext === "webm" ? "audio/ogg; codecs=opus" : "audio/mp4"
        }
      };
    }

    const want = Number(String(format).replace(/[^0-9]/g, "")) || 720;
    const picked = pickVideoByQuality(info.formats, want);
    if (!picked?.url) return { status: false, error: "Video format tidak tersedia." };

    const finalUrl = await resolveFinalUrl(picked.url);
    const qNum = Number(String(picked.quality || "").toUpperCase().replace(/[^0-9]/g, ""));

    return {
      status: true,
      result: {
        title: info.title,
        download: finalUrl,
        duration: secToClock(info.duration),
        durationSec: info.duration,
        quality: qNum || want,
        size: picked.size,
        ext: String(picked.format || "mp4").toLowerCase(),
        mimetype: "video/mp4",
        thumbnail: info.thumbnail
      }
    };
  } catch (e) {
    return { status: false, error: e?.message || String(e) };
  }
};

export default { ytdl, download, resolveFinalUrl };