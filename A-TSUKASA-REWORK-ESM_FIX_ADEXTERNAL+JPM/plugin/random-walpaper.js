export const command = ["walpaper", "wallpaper"];

const wallpapers = [
  "https://images.pexels.com/photos/18870635/pexels-photo-18870635.jpeg",
  "https://images.pexels.com/photos/18870637/pexels-photo-18870637.jpeg",
  "https://images.pexels.com/photos/34934422/pexels-photo-34934422.jpeg",
  "https://images.pexels.com/photos/28577085/pexels-photo-28577085.jpeg",
  "https://images.pexels.com/photos/16390238/pexels-photo-16390238.jpeg",
  "https://images.pexels.com/photos/16155466/pexels-photo-16155466.jpeg",
  "https://images.pexels.com/photos/27428446/pexels-photo-27428446.jpeg",
  "https://images.pexels.com/photos/16390239/pexels-photo-16390239.jpeg",
  "https://images.pexels.com/photos/16390240/pexels-photo-16390240.jpeg",
  "https://images.pexels.com/photos/19773767/pexels-photo-19773767.jpeg",
  "https://images.pexels.com/photos/16177539/pexels-photo-16177539.jpeg",
  "https://images.pexels.com/photos/17120096/pexels-photo-17120096.jpeg",
  "https://images.pexels.com/photos/16155467/pexels-photo-16155467.jpeg",
  "https://images.pexels.com/photos/16155463/pexels-photo-16155463.jpeg",
  "https://images.pexels.com/photos/16675692/pexels-photo-16675692.jpeg",
  "https://images.pexels.com/photos/16177239/pexels-photo-16177239.jpeg",
  "https://images.pexels.com/photos/16675703/pexels-photo-16675703.jpeg",
  "https://images.pexels.com/photos/19773741/pexels-photo-19773741.jpeg",
  "https://images.pexels.com/photos/17660924/pexels-photo-17660924.jpeg",
  "https://images.pexels.com/photos/33733963/pexels-photo-33733963.jpeg",
  "https://images.pexels.com/photos/16155478/pexels-photo-16155478.jpeg",
  "https://images.pexels.com/photos/29626184/pexels-photo-29626184.jpeg",
  "https://images.pexels.com/photos/29626189/pexels-photo-29626189.jpeg",
  "https://images.pexels.com/photos/19773683/pexels-photo-19773683.jpeg",
  "https://images.pexels.com/photos/16177235/pexels-photo-16177235.jpeg",
  "https://images.pexels.com/photos/16155462/pexels-photo-16155462.jpeg",
  "https://images.pexels.com/photos/16155465/pexels-photo-16155465.jpeg",
  "https://images.pexels.com/photos/19859505/pexels-photo-19859505.jpeg",
  "https://images.pexels.com/photos/16177296/pexels-photo-16177296.jpeg",
  "https://images.pexels.com/photos/16155459/pexels-photo-16155459.jpeg",
  "https://images.pexels.com/photos/16155464/pexels-photo-16155464.jpeg",
  "https://images.pexels.com/photos/29626232/pexels-photo-29626232.jpeg",
  "https://images.pexels.com/photos/29626244/pexels-photo-29626244.jpeg",
  "https://images.pexels.com/photos/16177292/pexels-photo-16177292.jpeg",
  "https://images.pexels.com/photos/16390236/pexels-photo-16390236.jpeg",
  "https://images.pexels.com/photos/16155522/pexels-photo-16155522.jpeg",
  "https://images.pexels.com/photos/29626231/pexels-photo-29626231.jpeg",
  "https://images.pexels.com/photos/16675647/pexels-photo-16675647.jpeg",
  "https://images.pexels.com/photos/16390241/pexels-photo-16390241.jpeg",
  "https://images.pexels.com/photos/19859502/pexels-photo-19859502.jpeg",
  "https://images.pexels.com/photos/18870661/pexels-photo-18870661.jpeg",
  "https://images.pexels.com/photos/17660925/pexels-photo-17660925.jpeg",
  "https://images.pexels.com/photos/17189400/pexels-photo-17189400.jpeg",
  "https://images.pexels.com/photos/29626191/pexels-photo-29626191.jpeg",
  "https://images.pexels.com/photos/16177234/pexels-photo-16177234.jpeg",
  "https://images.pexels.com/photos/16177294/pexels-photo-16177294.jpeg",
  "https://images.pexels.com/photos/16177538/pexels-photo-16177538.jpeg",
  "https://images.pexels.com/photos/31439184/pexels-photo-31439184.jpeg",
  "https://images.pexels.com/photos/16155519/pexels-photo-16155519.jpeg",
  "https://images.pexels.com/photos/16177540/pexels-photo-16177540.jpeg"
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function run(msg, ctx) {
  const { riz, reply, qriz } = ctx;

  try {
    if (!wallpapers.length) return reply("❌ List wallpaper kosong.");

    const url = pickRandom(wallpapers);

    await riz.sendMessage(
      ctx.id,
      {
        image: { url },
        caption: "🖼️ Wallpaper random"
      },
      { quoted: qriz }
    );
  } catch (e) {
    const msgErr =
      (e && (e.output?.payload?.message || e.message))
        ? (e.output?.payload?.message || e.message)
        : String(e);

    return reply("❌ Gagal kirim wallpaper.\nDetail: " + msgErr);
  }
}