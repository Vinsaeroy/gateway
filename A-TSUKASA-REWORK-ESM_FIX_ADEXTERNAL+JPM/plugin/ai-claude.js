export const command = ["claude", "cai", "clod"]
import fetch from "node-fetch"

export default async (m, { q, reply }) => {
  try {
    if (!q) return reply("❌ Contoh: .claude apa itu node js?")

    const api = "https://wewordle.org/gptapi/v1/web/turbo"

    const res = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Origin": "https://claude.online",
        "Referer": "https://claude.online/"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: q
          }
        ]
      })
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      return reply(`❌ API error: ${res.status}\n${errText}`)
    }

    const data = await res.json()

    const out =
      data?.result ||
      data?.data ||
      data?.answer ||
      data?.message.content ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.content ||
      JSON.stringify(data, null, 2)

    return reply(typeof out === "string" ? out.trim() : JSON.stringify(out, null, 2))
  } catch (e) {
    return reply(`❌ Error: ${e.message}`)
  }
}