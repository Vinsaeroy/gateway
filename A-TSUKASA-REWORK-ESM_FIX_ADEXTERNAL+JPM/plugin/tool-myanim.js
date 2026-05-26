import axios from "axios";
import * as cheerio from "cheerio";

export const command = ["topanime", "animesearch"];

const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";

function cut(s, n) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}

async function topAnime() {
  const { data } = await axios.get("https://myanimelist.net/topanime.php", {
    headers: { "User-Agent": ua, Accept: "text/html" },
    timeout: 20000,
  });

  const $ = cheerio.load(data);
  const animeList = [];

  $(".ranking-list").each((_, element) => {
    const rank = $(element).find(".rank").text().trim();
    const a = $(element).find(".title h3 a");
    const title = a.text().trim();
    const url = a.attr("href") || "";
    const score = $(element).find(".score span").text().trim();
    const cover =
      $(element).find(".title img").attr("data-src") ||
      $(element).find(".title img").attr("src") ||
      "";

    const info = $(element)
      .find(".information")
      .text()
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    const type = info[0] || "";
    const release = info[1] || "";
    const members = info[2] || "";

    if (title && url) {
      animeList.push({ rank, title, url, score, cover, type, release, members });
    }
  });

  return animeList;
}

async function animeSearch(query) {
  if (!query) throw new Error("Query is required");

  const { data } = await axios.get(
    `https://myanimelist.net/anime.php?q=${encodeURIComponent(query)}&cat=anime`,
    { headers: { "User-Agent": ua, Accept: "text/html" }, timeout: 20000 }
  );

  const $ = cheerio.load(data);
  const animeList = [];

  $("table tbody tr").each((_, element) => {
    const cover =
      $(element).find("td:nth-child(1) img").attr("data-src") ||
      $(element).find("td:nth-child(1) img").attr("src") ||
      "";

    const title = $(element).find("td:nth-child(2) strong").text().trim();
    const url = $(element).find("td:nth-child(2) a").attr("href") || "";
    const type = $(element).find("td:nth-child(3)").text().trim();
    const episodes = $(element).find("td:nth-child(4)").text().trim();
    const score = $(element).find("td:nth-child(5)").text().trim();
    const description =
      $(element)
        .find("td:nth-child(2) .pt4")
        .text()
        .replace("read more.", "")
        .trim() || "No Desc";

    if (title && url) {
      animeList.push({ title, url, type, episodes, score, cover, description });
    }
  });

  return animeList;
}

export default async function run(_msg, ctx) {
  const { reply, command: cmd, q } = ctx;

  try {
    if (cmd === "topanime") {
      const results = await topAnime();
      if (!results.length) return reply("No top anime found.");

      const out = results.slice(0, 10).map((a) => {
        const info = [a.type, a.release].filter(Boolean).join(" - ");
        const extra = [a.members].filter(Boolean).join(" | ");
        return `*${a.rank}. ${a.title}*\nScore: ${a.score || "N/A"}\nInfo: ${
          info || "N/A"
        }${extra ? `\nMembers: ${extra}` : ""}\nURL: ${a.url}`;
      });

      return reply(out.join("\n\n"));
    }

    if (cmd === "animesearch") {
      if (!q)
        return reply("Contoh: .animesearch Naruto\nContoh: .animesearch One Piece");

      const results = await animeSearch(q);
      if (!results.length) return reply(`No results found for "${q}".`);

      const out = results.slice(0, 5).map((a, i) => {
        const eps = a.episodes && a.episodes !== "-" ? a.episodes : "N/A";
        const type = a.type || "N/A";
        const score = a.score || "N/A";
        return `*${i + 1}. ${a.title}*\nType: ${type} (${eps} eps)\nScore: ${score}\nDesc: ${cut(
          a.description,
          140
        )}\nURL: ${a.url}`;
      });

      return reply(out.join("\n\n"));
    }

    return reply("Command tidak dikenal.");
  } catch (e) {
    return reply(`Error: ${String(e?.message || e)}`);
  }
}