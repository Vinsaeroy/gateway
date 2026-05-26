export const command = ["mikasa"];

export default async function (m, { riz, reply, qriz, id }) {
  try {
    const mikasaList = [
      "https://i.pinimg.com/originals/a4/f4/79/a4f4793ca387e7fe2b74cec830a84499.jpg",
      "https://i.pinimg.com/originals/ea/bd/6c/eabd6c33883f46e571c88c7b8db82e04.jpg",
      "https://i.pinimg.com/originals/75/ae/8f/75ae8ffaae892626c4bd270ca39a8d63.jpg",
      "https://i.pinimg.com/originals/13/36/8b/13368be909d4d4e05077d299956dafe3.jpg",
      "https://i.pinimg.com/originals/ec/7b/3d/ec7b3d252ba6adaa23a089903f340c5d.jpg",
      "https://i.pinimg.com/originals/08/d0/6c/08d06c91a1d671ab0ae2ad3857a1a6ed.jpg",
      "https://i.pinimg.com/originals/01/82/75/0182751d3c0ac5d56ea657f1aeb7da98.jpg",
      "https://i.pinimg.com/originals/4a/e6/c7/4ae6c74595764600ec06918e06a1c034.jpg",
      "https://i.pinimg.com/originals/a5/bc/96/a5bc9633d76f990ab9a7f18a07651d8e.jpg",
      "https://i.pinimg.com/originals/8e/f6/7b/8ef67bcb60cd498924b16089268b0366.jpg",
      "https://i.pinimg.com/originals/6c/f8/db/6cf8dbebbaf7b1973da05541418cb357.jpg",
      "https://i.pinimg.com/originals/b4/fa/88/b4fa88c26a7b431764435131f38872cd.jpg",
      "https://i.pinimg.com/originals/10/df/e3/10dfe34514273608a93284ab85e6cad9.jpg",
      "https://i.pinimg.com/originals/02/26/51/022651c514cc58ec7efed85ebdf41afa.jpg",
      "https://i.pinimg.com/originals/83/17/1f/83171fb418bb85c3fe9a3aa5797a08a1.jpg",
      "https://i.pinimg.com/originals/29/09/7e/29097e1b175db3058dc1832f5fb5d934.jpg",
      "https://i.pinimg.com/originals/e3/00/1f/e3001fa8c227405e406910c30e54a0a0.jpg",
    ];

    const randomImage = mikasaList[Math.floor(Math.random() * mikasaList.length)];

    await riz.sendMessage(id, { react: { text: "⏳", key: m.key } });

    await riz.sendMessage(
      id,
      { image: { url: randomImage }, caption: `⚔️ *Mikasa Random Image* 🧣` },
      { quoted: qriz }
    );

    await riz.sendMessage(id, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error("❌ Error Mikasa:", err);
    reply("⚠️ Gagal kirim gambar Mikasa.");
  }
}