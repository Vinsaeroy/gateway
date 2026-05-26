import axios from "axios";

export default async function handler(m, ctx) {
  const {
    riz,
    reply,
    q,
    command,
    qriz,
    id,
    reactm
  } = ctx;

  if (!q) {
    return reply(
      `Example:\n.${command} agas|anjir emak teman gua|99|0`
    );
  }

reactm("⏳️")

  const [name, quote, likes, dislikes] = q.split("|");

  if (!name || !quote || !likes || !dislikes) {
    return reply(
      `Format salah!\nContoh:\n.${command} someone|anjir emak teman gua|99|0`
    );
  }

  try {
    const url = `https://api.deline.web.id/maker/fake-xnxx?name=${encodeURIComponent(
      name
    )}&quote=${encodeURIComponent(quote)}&likes=${likes}&dislikes=${dislikes}`;

    const res = await axios.get(url, {
      responseType: "arraybuffer"
    });

    await riz.sendMessage(
      id,
      {
        image: res.data,
        caption: "Success 🗿"
      },
      { quoted: qriz }
    );

  } catch (e) {
    console.error(e);
    reply("❌ Error bang, API nya lagi down.");
  }
}

export const command = ["fakenx", "fnxn", "fakexnxx"];