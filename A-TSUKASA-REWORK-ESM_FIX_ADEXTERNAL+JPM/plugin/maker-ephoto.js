import axios from "axios"
import * as cheerio from "cheerio"
import FormData from "form-data"

export const command = [
  "glitchtext",
  "writetext",
  "advancedglow",
  "typographytext",
  "pixelglitch",
  "neonglitch",
  "flagtext",
  "flag3dtext",
  "deletingtext",
  "blackpinkstyle",
  "glowingtext",
  "underwatertext",
  "logomaker",
  "cartoonstyle",
  "papercutstyle",
  "watercolortext",
  "effectclouds",
  "blackpinklogo",
  "gradienttext",
  "summerbeach",
  "luxurygold",
  "multicoloyellowneon",
  "sandsummer",
  "galaxywallpaper",
  "1917style",
  "makingneon",
  "royaltext",
  "freecreate",
  "galaxystyle",
  "lighteffects"
]

const EFFECTS = {
  glitchtext: "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
  writetext: "https://en.ephoto360.com/write-text-on-wet-glass-online-589.html",
  advancedglow: "https://en.ephoto360.com/advanced-glow-effects-74.html",
  typographytext: "https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html",
  pixelglitch: "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html",
  neonglitch: "https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html",
  flagtext: "https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html",
  flag3dtext: "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html",
  deletingtext: "https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html",
  blackpinkstyle: "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html",
  glowingtext: "https://en.ephoto360.com/create-glowing-text-effects-online-706.html",
  underwatertext: "https://en.ephoto360.com/3d-underwater-text-effect-online-682.html",
  logomaker: "https://en.ephoto360.com/free-bear-logo-maker-online-673.html",
  cartoonstyle: "https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html",
  papercutstyle: "https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html",
  watercolortext: "https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html",
  effectclouds: "https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html",
  blackpinklogo: "https://en.ephoto360.com/create-blackpink-logo-online-free-607.html",
  gradienttext: "https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html",
  summerbeach: "https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html",
  luxurygold: "https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html",
  multicoloyellowneon: "https://en.ephoto360.com/create-multicoloyellow-neon-light-signatures-591.html",
  sandsummer: "https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html",
  galaxywallpaper: "https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html",
  "1917style": "https://en.ephoto360.com/1917-style-text-effect-523.html",
  makingneon: "https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html",
  royaltext: "https://en.ephoto360.com/royal-text-effect-online-free-471.html",
  freecreate: "https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html",
  galaxystyle: "https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html",
  lighteffects: "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html"
}

// ================= EPHOTO FUNCTION =================
async function ephoto(url, texk) {
  const form = new FormData()

  const gT = await axios.get(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"
    }
  })

  const $ = cheerio.load(gT.data)

  const token = $('input[name=token]').val()
  const build_server = $('input[name=build_server]').val()
  const build_server_id = $('input[name=build_server_id]').val()

  form.append("text[]", texk)
  form.append("token", token)
  form.append("build_server", build_server)
  form.append("build_server_id", build_server_id)

  const res = await axios({
    url,
    method: "POST",
    data: form,
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
      cookie: gT.headers["set-cookie"]?.join("; "),
      ...form.getHeaders()
    }
  })

  const $$ = cheerio.load(res.data)
  const json = JSON.parse($$('input[name=form_value_input]').val())

  json["text[]"] = json.text
  delete json.text

  const { data } = await axios.post(
    "https://en.ephoto360.com/effect/create-image",
    new URLSearchParams(json),
    {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        cookie: gT.headers["set-cookie"].join("; ")
      }
    }
  )

  return build_server + data.image
}

// ================= PLUGIN RUN =================
export default async function pluginRun(m, ctx) {
  const {
    command,
    q,
    reply,
    riz,
    qriz,
    id
  } = ctx

  if (!q) {
    return reply(`Contoh:\n.${command} Assistant`)
  }
  const link = EFFECTS[command]
  if (!link) return reply("❌ Efek tidak ditemukan.")

  try {
    const img = await ephoto(link, q)

    await riz.sendMessage(
      id,
      {
        image: { url: img },
        caption: "Nih 🤩"
      },
      { quoted: qriz }
    )
  } catch (err) {
    console.error("[EPHOTO ERROR]", err)
    reply("❌ Gagal membuat efek teks.")
  }
}