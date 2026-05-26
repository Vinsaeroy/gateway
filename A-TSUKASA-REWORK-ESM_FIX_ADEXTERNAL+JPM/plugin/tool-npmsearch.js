import "../config.js"

export const command = ["npmsearch", "npms", "npmsrch"]

export default async (
  m,
  { reply, riz, id, q, args, usedPrefix, command }
) => {
  const query = (q || (args || []).join(" ")).trim()
  if (!query) return reply(`Contoh: .npmsearch axios`)

  try { await riz.sendMessage(id, { react: { text: "⏳", key: m.key } }) } catch {}

  try {
    const { execFile } = await import("node:child_process")
    const { promisify } = await import("node:util")
    const pExecFile = promisify(execFile)

    const terms = query.split(/\s+/).filter(Boolean)
    const bin = process.platform === "win32" ? "npm.cmd" : "npm"

    const argsCli = ["search", "--json", "--searchlimit", "6", ...terms]

    const { stdout } = await pExecFile(bin, argsCli, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 25000
    })

    let results = []
    try { results = JSON.parse(stdout) } catch {}
    // normalisasi bentuk output
    if (results && results.objects && Array.isArray(results.objects)) {
      results = results.objects.map(o => o.package || o)
    }
    if (!Array.isArray(results)) results = []

    const top = results.slice(0, 6)
    if (!top.length) return reply("❌ Nggak ada hasil untuk query itu.")

    const lines = top.map((p, i) => {
      const name = p.name || p.package?.name || "-"
      const version = p.version || p.package?.version || "-"
      const desc = (p.description || p.package?.description || "").trim()
      const url = p.links?.npm || p.links?.homepage || p.links?.repository || ""
      return `*${i + 1}. ${name}@${version}*\n${desc || "-"}\nInstall: \`npm i ${name}\`${url ? `\n${url}` : ""}`
    }).join("\n\n")

    await riz.sendMessage(id, {
      text: `🔎 *NPM Search*: ${query}\n\n${lines}`
    }, { quoted: m })
  } catch (err) {
    try {
      const { default: axios } = await import("axios")
      const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=6`
      const { data } = await axios.get(url, { timeout: 20000 })
      const top = (data.objects || []).slice(0, 6).map(o => o.package)
      if (!top.length) return reply("❌ Nggak ada hasil untuk query itu.")

      const lines = top.map((p, i) =>
        `*${i + 1}. ${p.name}@${p.version}*\n${p.description || "-"}\nInstall: \`npm i ${p.name}\`\n${p.links?.npm || ""}`
      ).join("\n\n")

      await riz.sendMessage(id, {
        text: `🔎 *NPM Search* (fallback): ${query}\n\n${lines}`
      }, { quoted: m })
    } catch (e2) {
      console.error("npmsearch error:", err, e2)
      reply("⚠️ Gagal jalanin `npm search` maupun fallback API.")
    }
  } finally {
    try { await riz.sendMessage(id, { react: { text: "", key: m.key } }) } catch {}
  }
}