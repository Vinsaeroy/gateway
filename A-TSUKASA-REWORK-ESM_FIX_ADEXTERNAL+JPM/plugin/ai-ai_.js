export const command = [
  "jeeves",
  "lumin",
  "turboseek"
]

const AI_ENDPOINT = {

  jeeves: q =>
    "https://api-faa.my.id/faa/jeeves-ai?prompt=" +
    encodeURIComponent(q),

  lumin: q =>
    "https://api.nexray.web.id/ai/lumin?text=" +
    encodeURIComponent(q),

  turboseek: q =>
    "https://api.nexray.web.id/ai/turboseek?text=" +
    encodeURIComponent(q)
}

const AI_NAME = {
  jeeves: "JEEVES",
  lumin: "LUMIN",
  turboseek: "TURBOSEEK"
}

function pickResult(json) {
  return (
    json?.result ||
    json?.data?.response ||
    json?.data?.result ||
    json?.data ||
    json?.response ||
    json?.message ||
    "❌ Tidak ada hasil."
  )
}

export default async (m, { command, q, reply }) => {
  try {
    if (!q) return reply(`❌ Contoh: .${command} Halo apa kabar?`)

    const url = AI_ENDPOINT[command]?.(q)
    if (!url) return reply("❌ Command tidak dikenali")

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json"
      }
    })

    if (!res.ok) return reply(`❌ API error: ${res.status}`)

    const json = await res.json()
    const out = pickResult(json)

    const name = AI_NAME[command] || String(command || "AI").toUpperCase()
    const body =
      typeof out === "string" ? out.trim() : JSON.stringify(out, null, 2)

    return reply(`${name}:\n\n${body}`)
  } catch (err) {
    return reply(`❌ Error: ${err.message}`)
  }
}