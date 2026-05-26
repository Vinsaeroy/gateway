import axios from "axios";
import * as cheerio from "cheerio";

async function searchKomik(query) {
  const { data: html } = await axios.get("https://komikindo.ch", {
    params: { s: query },
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 20000,
  });

  const $ = cheerio.load(html);
  const result = [];

  $(".animposx").each((_, el) => {
    const title = $(el).find("h3").text().trim();
    const imageUrl =
      $(el).find("img").attr("data-src") || $(el).find("img").attr("src") || "";
    const rating = $(el).find(".rating").text().trim();
    const linkKomik = $(el).find(".tt > h3 > a").attr("href") || "";

    if (title && linkKomik) {
      result.push({ title, imageUrl, rating, linkKomik });
    }
  });

  return result;
}

async function getDetail(url) {
  const { data: html } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    timeout: 20000,
  });

  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text().trim() ||
    "Komikindo";

  const imageUrl =
    $(".thumb img").attr("data-src") || $(".thumb img").attr("src") || "";

  const rating = ($(".rating").text().trim().match(/\d+(\.\d+)?/) || [])[0] || "N/A";

  const detail = [];
  $(".spe span").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const parts = text.split(":");
    if (parts.length >= 2) detail.push(parts.slice(1).join(":").trim());
  });

  return {
    title,
    imageUrl,
    rating,
    link: url,
    judulAlternatif: detail[0] || "-",
    status: detail[1] || "-",
    pengarang: detail[2] || "-",
    ilustrator: detail[3] || "-",
    grafis: detail[4] || "-",
    tema: detail[5] || "-",
    jenisKomik: detail[6] || "-",
    official: detail[7] || "-",
    informasi: detail[8] || "-",
  };
}

export const command = ["komikindo"];

export default async function komikindoPlugin(msg, ctx) {
  const { body, q, reply, riz, id, qriz, sender } = ctx;

  const usedPrefix =
    (global.prefix || ["."]).find((p) => (body || "").startsWith(p)) || ".";

  const text = (q || "").trim();

  if (!text) {
    return reply(
      `📚 *KomikIndo*\n\n` +
        `• ${usedPrefix}komikindo <judul>\n` +
        `• ${usedPrefix}komikindo detail <link>\n\n` +
        `Contoh:\n${usedPrefix}komikindo return of top class master`
    );
  }

  if (/^detail\s+/i.test(text)) {
    const url = text.replace(/^detail\s+/i, "").trim();
    if (!/^https?:\/\//i.test(url)) return reply("❌ Link tidak valid");

    await reply("🔍 Mengambil detail komik...");
    try {
      const d = await getDetail(url);

      const cap =
        `📖 *${d.title}*\n` +
        `⭐ Rating: ${d.rating}\n\n` +
        `• Judul Alt : ${d.judulAlternatif}\n` +
        `• Status    : ${d.status}\n` +
        `• Pengarang : ${d.pengarang}\n` +
        `• Ilustrator: ${d.ilustrator}\n` +
        `• Grafis    : ${d.grafis}\n` +
        `• Tema      : ${d.tema}\n` +
        `• Jenis     : ${d.jenisKomik}\n` +
        `• Official  : ${d.official}\n\n` +
        `🔗 ${d.link}`;

      if (d.imageUrl) {
        return riz.sendMessage(
          id,
          { image: { url: d.imageUrl }, caption: cap, mentions: [sender] },
          { quoted: qriz || msg }
        );
      }

      return reply(cap);
    } catch (e) {
      console.error(e);
      return reply("❌ Gagal mengambil detail komik");
    }
  }

  await reply("🔎 Mencari komik...");

  try {
    const res = await searchKomik(text);
    if (!res.length) return reply("❌ Komik tidak ditemukan");

    let out = `📚 *Hasil Pencarian KomikIndo*\n\n`;
    res.slice(0, 10).forEach((v, i) => {
      out += `${i + 1}. *${v.title}*\n⭐ ${v.rating || "-"}\n🔗 ${v.linkKomik}\n\n`;
    });

    out += `Ketik:\n${usedPrefix}komikindo detail <link>`;
    return reply(out);
  } catch (e) {
    console.error(e);
    return reply("❌ Error saat mencari komik");
  }
}