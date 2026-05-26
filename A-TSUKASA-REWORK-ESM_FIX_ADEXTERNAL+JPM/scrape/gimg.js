const REGEX = /\["(\bhttps?:\/\/[^"]+)",(\d+),(\d+)\],null/g;

const unicodeToString = content =>
  content.replace(/\\u[\dA-F]{4}/gi, match =>
    String.fromCharCode(parseInt(match.replace(/\\u/g, ""), 16))
  );

async function getFetch() {
  if (typeof globalThis.fetch === "function") return globalThis.fetch;
  const mod = await import("node-fetch");
  return mod.default || mod;
}

export default async function gis(searchTerm, options = {}) {
  if (!searchTerm || typeof searchTerm !== "string")
    throw new TypeError("searchTerm must be a string.");
  if (options && typeof options !== "object")
    throw new TypeError("options argument must be an object.");

  const fetch = await getFetch();

  const {
    query = {},
    userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
  } = options;

  const params = new URLSearchParams({
    ...query,
    udm: "2",
    tbm: "isch",
    q: searchTerm
  });

  const res = await fetch(`https://www.google.com/search?${params}`, {
    headers: {
      "User-Agent": userAgent,
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  if (!res.ok) {
    throw new Error(`Google request failed: ${res.status} ${res.statusText}`);
  }

  const content = await res.text();
  const results = [];

  REGEX.lastIndex = 0;

  let match;
  while ((match = REGEX.exec(content))) {
    results.push({
      url: unicodeToString(match[1]),
      height: Number(match[2]),
      width: Number(match[3])
    });
  }

  return results;
}