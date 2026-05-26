/**
 ╔══════════════════════
      ⧉  [lolinime/lolianime] — [anime img]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Creator  : SXZnightmare (modded)
*/

const list = [
  "https://i.ibb.co/NgpMG6xJ/2cf0f2cfac6a.jpg",
  "https://i.ibb.co/XxtL2MDY/5204e7617dcf.jpg",
  "https://i.ibb.co/d00V3Ckf/b1b3a77df703.jpg",
  "https://i.ibb.co/whm36YvN/47c970def7e8.jpg",
  "https://i.ibb.co/YTLTdYkP/960eb35996d4.jpg",
  "https://i.ibb.co/rG006Nz4/8a4fd7dce6bd.jpg",
  "https://i.ibb.co/yF4C6MQL/1980cc531d55.jpg",
  "https://i.ibb.co/Z1kRgBd3/c56ae5147cfc.jpg",
  "https://i.ibb.co/67n7z0G4/e66905434b07.jpg",
  "https://i.ibb.co/cS5pJVwp/6c68767f7943.jpg",
  "https://i.ibb.co/fVjPk6rH/a26058361c62.jpg",
  "https://i.ibb.co/5WdBydjr/b5e47fdef6de.jpg",
  "https://i.ibb.co/pBsF0K2H/60ddcedd71ee.jpg",
  "https://i.ibb.co/KzSpQdXB/559898108b4c.jpg",
  "https://i.ibb.co/nqtVRcQG/255eaaf2818d.jpg",
  "https://i.ibb.co/dJP4RQ0r/9cfae87a5956.jpg",
  "https://i.ibb.co/VpSnW2BJ/f360929b6f7f.jpg",
  "https://i.ibb.co/zh3Pcf6d/d45706bd63ff.jpg",
  "https://i.ibb.co/vxJmb8K5/0b461672ec48.jpg",
  "https://i.ibb.co/bgGZF8Kr/f2a1c81ebadb.jpg",
  "https://i.ibb.co/F4C3zR5d/046416f10f34.jpg",
  "https://i.ibb.co/pBp373Cc/7e420dfe6a12.jpg",
  "https://i.ibb.co/mrrgrHMH/ed1a72673e90.jpg",
  "https://i.ibb.co/VYmZXMhX/8d2d85de6abd.jpg",
  "https://i.ibb.co/7x6h0ynk/a5523da70d48.jpg",
  "https://i.ibb.co/8hMxkVz/0c3c5bd56fc1.jpg",
  "https://i.ibb.co/Ktx67Yd/f656e9617304.jpg",
  "https://i.ibb.co/DHK0p2fC/b32876bf236a.jpg",
  "https://i.ibb.co/SXYx8JDT/0f67466b3a71.jpg"
];

export const command = ["lolinime", "lolianime"];

export default async function handler(msg, { riz, id, reply, qriz, reactm }) {
  try {
    if (reactm) await reactm("🎀");

    const pick = list[Math.floor(Math.random() * list.length)];

    await riz.sendMessage(
      id,
      { image: { url: pick }, caption: "✨ Random Loli Anime ✨" },
      { quoted: qriz }
    );

  } catch (e) {
    reply(`❌ Error: ${e?.message ?? e}`);
  } finally {
    if (reactm) await reactm("");
  }
}