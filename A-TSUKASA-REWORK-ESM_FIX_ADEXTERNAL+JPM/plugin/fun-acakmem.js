export const command = [
  "gay",
  "lesbi",
  "jelek",
  "ganteng",
  "cantik",
  "pintar",
  "bodoh",
  "sangean",
  "wibu",
  "anjing",
  "setan",
  "iblis",
 "tolol",
 "puki",
 "dakjal"
];

export default async function (m, { riz, id, groupMetadata, command, reply }) {
  try {
    const members = groupMetadata.participants.map(p => p.id);
    if (members.length < 1) {
      return reply("Grupnya sepi banget cuy, isi dulu kek.");
    }

    const target = members[Math.floor(Math.random() * members.length)];

    const teks = `👀 Anak *${command}* adalah: @${target.split("@")[0]}`;

    await riz.sendMessage(id, {
      text: teks,
      mentions: [target]
    });

  } catch (err) {
    console.error("RANDOM STATUS ERROR:", err);
    reply("Error bang, script-nya lagi stress.");
  }
}