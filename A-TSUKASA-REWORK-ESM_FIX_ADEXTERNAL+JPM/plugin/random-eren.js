export const command = ["eren"];

export default async function (m, { riz, reply, qriz, id }) {
  try {
    const erenList = [
      "https://i.pinimg.com/originals/74/cb/64/74cb64080d31a32c19751036c8dcb0a9.jpg",
      "https://i.pinimg.com/originals/50/07/c8/5007c8535e92efad5f3001872469677d.jpg",
      "https://i.pinimg.com/originals/60/a1/26/60a126782ec95cdf475df549b7ef753e.jpg",
      "https://i.pinimg.com/originals/90/d2/ba/90d2ba116ed3ca58799bb9bcb30e8cb2.jpg",
      "https://i.pinimg.com/originals/6c/8f/66/6c8f666b663ac65f11cba8dea74f9529.jpg",
      "https://i.pinimg.com/originals/90/82/39/9082399fcfc23c4bcd3e13854a41b756.jpg",
      "https://i.pinimg.com/originals/c5/5a/d5/c55ad567847ddcd15dec3a5dd4fa66cf.jpg",
      "https://i.pinimg.com/originals/3b/5f/43/3b5f433e8c3b67e5cf9c00b49ae26ad9.jpg",
      "https://i.pinimg.com/originals/1f/45/43/1f4543920d876ef60c391604a0005b3b.jpg",
      "https://i.pinimg.com/originals/6d/41/73/6d417366c8687c8d3e36c80859709a2e.jpg",
      "https://i.pinimg.com/originals/72/bd/99/72bd99a2463a959be90db95cf1dfec6b.jpg",
      "https://i.pinimg.com/originals/52/8f/fa/528ffaabf0c2cf2d501c2526a823f9bc.jpg",
      "https://i.pinimg.com/originals/cb/67/9a/cb679a33407e2f6fa8b67c348b0d0432.jpg",
      "https://i.pinimg.com/originals/b4/43/bb/b443bb9007bce06bfd2ebdb291b529ec.jpg",
      "https://i.pinimg.com/originals/ea/7c/71/ea7c71cec85b26cb6e050c84fc23a4e4.jpg",
      "https://i.pinimg.com/originals/7b/91/e4/7b91e48414ebc16f4263ad61060c3aa1.jpg",
      "https://i.pinimg.com/originals/1f/2f/ed/1f2fed339b1b2bf2669bb9f5e14c17bd.jpg",
      "https://i.pinimg.com/originals/f2/63/7e/f2637e62165f9497b996742c67ebd414.jpg",
    ];

    const randomImage = erenList[Math.floor(Math.random() * erenList.length)];

    await riz.sendMessage(id, { react: { text: "⏳", key: m.key } });

    await riz.sendMessage(
      id,
      { image: { url: randomImage }, caption: `🔥 *Eren Random Image* 🗡️` },
      { quoted: qriz }
    );

    await riz.sendMessage(id, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error("❌ Error Eren:", err);
    reply("⚠️ Gagal kirim gambar Eren.");
  }
}