// plugin/alkitab.js
import axios from "axios";

const BASE_URL = "https://api.ayt.co/v1";
const SOURCE = "whatsapp-bot.local"; // TODO: ganti sesuai identitas kamu (domain/web/app)

export const command = [
  "alkitab",
  "bacaan",
  "cariayat",
  "searchayat", // alias
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseSingleAyat(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return null;

  const book = parts[0];
  const rest = parts.slice(1).join(" ");

  const m = rest.match(/^(\d+)\s*[:.]\s*(\d+)$/);
  if (!m) return null;

  return { book, chapter: m[1], verse: m[2] };
}

async function getVerse(book, chapter, verse) {
  const url =
    `${BASE_URL}/bible.php?book=${encodeURIComponent(book)}` +
    `&chapter=${encodeURIComponent(chapter)}` +
    `&verse=${encodeURIComponent(verse)}` +
    `&source=${encodeURIComponent(SOURCE)}`;

  const { data } = await axios.get(url, { timeout: 15000 });
  return data;
}

async function getPassage(passage) {
  const url =
    `${BASE_URL}/passage.php?passage=${encodeURIComponent(passage)}` +
    `&source=${encodeURIComponent(SOURCE)}`;

  const { data } = await axios.get(url, { timeout: 15000 });
  return data;
}

async function searchAyat(keyword) {
  const url =
    `${BASE_URL}/search.php?search=${encodeURIComponent(keyword)}` +
    `&source=${encodeURIComponent(SOURCE)}`;

  const { data } = await axios.get(url, { timeout: 15000 });
  return data;
}

function formatSingleVerse(obj) {
  const keys = Object.keys(obj || {});
  if (!keys.length) return null;

  const entry = obj[keys[0]];
  if (!entry?.info || !entry?.data) return null;

  const info = entry.info;
  const aytNode = entry.data.ayt || entry.data.AYT || entry.data;
  const text = aytNode?.text || "";

  const bookName = info.book_name || info.book_abbr || "??";
  const chapter = info.chapter || "?";
  const verse = info.verse || "?";

  return { ref: `${bookName} ${chapter}:${verse}`, text };
}

function flattenPassage(data, maxVerses = 20) {
  const arr = Array.isArray(data) ? data : [];
  const lines = [];
  let refHeader = null;

  for (const item of arr) {
    if (!refHeader && item?.ref) refHeader = item.ref;

    const res = item?.res || {};
    const bookKey = Object.keys(res)[0];
    if (!bookKey) continue;

    const bookData = res[bookKey];
    const chapters = bookData?.data || {};
    const chapterKey = Object.keys(chapters)[0];
    if (!chapterKey) continue;

    const versesObj = chapters[chapterKey] || {};
    for (const v of Object.values(versesObj)) {
      if (lines.length >= maxVerses) break;
      lines.push(`${v.verse ?? "?"}. ${v.text ?? ""}`.trim());
    }
    if (lines.length >= maxVerses) break;
  }

  return { refHeader, lines };
}

export default async function run(msg, ctx) {
  const { command: cmd, q, reply } = ctx;

  if (cmd === "alkitab") {
    if (!q) {
      return reply("Contoh: *.alkitab Mat 28:19*");
    }
    const parsed = parseSingleAyat(q);
    if (!parsed) {
      return reply("❌ Format salah. Contoh: *.alkitab Mat 28:19*");
    }

    try {
      const data = await getVerse(parsed.book, parsed.chapter, parsed.verse);
      const result = formatSingleVerse(data);
      if (!result) return reply("❌ Ayat tidak ditemukan.");

      return reply(`📖 *${result.ref}*\n\n${result.text}`);
    } catch (e) {
      console.error("ALKITAB verse error:", e);
      return reply("⚠️ Gagal ambil ayat. Coba lagi.");
    }
  }

  if (cmd === "bacaan") {
    if (!q) return reply("Contoh: *.bacaan Mat 28:16-20*");

    try {
      const data = await getPassage(q);
      const { refHeader, lines } = flattenPassage(data, 20);
      if (!lines.length) return reply("❌ Bacaan tidak ditemukan.");

      const note = lines.length >= 20 ? "\n\n(ditampilkan maksimal 20 ayat)" : "";
      return reply(`📖 *${refHeader || q}*\n\n${lines.join("\n")}${note}`);
    } catch (e) {
      console.error("ALKITAB passage error:", e);
      return reply("⚠️ Gagal ambil bacaan. Coba lagi.");
    }
  }

  if (cmd === "cariayat" || cmd === "searchayat") {
    if (!q) return reply("Contoh: *.cariayat kasih Allah*");

    try {
      const data = await searchAyat(q);
      const docsObj = data?.response?.docs || {};
      const docs = Object.values(docsObj);
      if (!docs.length) return reply("❌ Tidak ketemu ayat yang cocok.");

      docs.sort((a, b) => parseFloat(b.relevance || "0") - parseFloat(a.relevance || "0"));
      const top = docs.slice(0, 5);

      const out = top.map((d, i) => {
        const ref = `${d.name || d.abbr || "??"} ${d.chapter || "?"}:${d.verse || "?"}`;
        return `${i + 1}. *${ref}*\n${d.text || ""}`;
      }).join("\n\n");

      return reply(`🔎 *Hasil cari ayat*\nKata kunci: _${q}_\n\n${out}`);
    } catch (e) {
      console.error("ALKITAB search error:", e);
      return reply("⚠️ Gagal cari ayat. Coba lagi.");
    }
  }
}