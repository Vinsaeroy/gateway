export const command = ["charanime"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const data = [
  {
    title: "Shingeki no Kyojin Movie: Kanketsu-hen - The Last Attack",
    name: "Leonhart, Annie",
    image: "https://cdn.myanimelist.net/images/characters/9/206357.jpg",
    tags: ["Leonhart", "Annie"],
    japaneseName: "(アニ・レオンハート)"
  },
  {
    title: "Seishun Buta Yarou wa Randoseru Girl no Yume wo Minai",
    name: "Toyohama, Nodoka",
    image: "https://cdn.myanimelist.net/images/characters/4/598438.jpg",
    tags: ["Toyohama", "Nodoka"],
    japaneseName: "(豊浜 のどか)"
  },
  {
    title: "Tanoshii Muumin Ikka",
    name: "Little My",
    image: "https://cdn.myanimelist.net/images/characters/10/320010.jpg",
    tags: ["Little My", "Little My"],
    japaneseName: "(ミィ)"
  },
  {
    title: "Shin Evangelion Movie:||",
    name: "Souryuu, Asuka Langley",
    image: "https://cdn.myanimelist.net/images/characters/12/79465.jpg",
    tags: ["Souryuu", "Asuka Langley"],
    japaneseName: "(惣流・アスカ・ラングレー)"
  },
  {
    title: "Natsume Yuujinchou",
    name: "Kogitsune",
    image: "https://cdn.myanimelist.net/images/characters/6/160259.jpg",
    tags: ["Kogitsune", "Kogitsune"],
    japaneseName: "(子狐)"
  },
  {
    title: "Nodame Cantabile",
    name: "Chiaki, Shinichi",
    image: "https://cdn.myanimelist.net/images/characters/12/80560.jpg",
    tags: ["Chiaki", "Shinichi"],
    japaneseName: "(千秋 真一)"
  },
  {
    title: "Bleach: Sennen Kessen-hen",
    name: "Kuchiki, Byakuya",
    image: "https://cdn.myanimelist.net/images/characters/7/100098.jpg",
    tags: ["Kuchiki", "Byakuya"],
    japaneseName: "(朽木 白哉)"
  },
  {
    title: "Youkoso Jitsuryoku Shijou Shugi no Kyoushitsu e 2nd Season",
    name: "Ichinose, Honami",
    image: "https://cdn.myanimelist.net/images/characters/14/539075.jpg",
    tags: ["Ichinose", "Honami"],
    japaneseName: "(一之瀬 帆波)"
  },
  {
    title: "Lupin III: Part 5",
    name: "Mine, Fujiko",
    image: "https://cdn.myanimelist.net/images/characters/14/329615.jpg",
    tags: ["Mine", "Fujiko"],
    japaneseName: "(峰 不二子)"
  },
  {
    title: "Fruits Basket 2nd Season",
    name: "Souma, Shigure",
    image: "https://cdn.myanimelist.net/images/characters/12/388998.jpg",
    tags: ["Souma", "Shigure"],
    japaneseName: "(草摩 紫呉)"
  },
  {
    title: "Haikyuu!! Movie 2: Shousha to Haisha",
    name: "Sugawara, Koushi",
    image: "https://cdn.myanimelist.net/images/characters/15/285904.jpg",
    tags: ["Sugawara", "Koushi"],
    japaneseName: "(菅原 孝支)"
  },
  {
    title: "Ginga Eiyuu Densetsu",
    name: "Attenborough, Dusty",
    image: "https://cdn.myanimelist.net/images/characters/8/43802.jpg",
    tags: ["Attenborough", "Dusty"],
    japaneseName: "(ダスティ・アッテンボロー)"
  },
  {
    title: "Howl no Ugoku Shiro",
    name: "King of Ingary",
    image: "https://cdn.myanimelist.net/images/characters/15/555891.jpg",
    tags: ["King of Ingary", "King of Ingary"],
    japaneseName: "(国王)"
  },
  {
    title: "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai",
    name: "Sakurajima, Mai",
    image: "https://cdn.myanimelist.net/images/characters/2/366639.jpg",
    tags: ["Sakurajima", "Mai"],
    japaneseName: "(桜島 麻衣)"
  },
  {
    title: "Kono Subarashii Sekai ni Shukufuku wo!",
    name: "Luna",
    image: "https://cdn.myanimelist.net/images/characters/16/305489.jpg",
    tags: ["Luna", "Luna"],
    japaneseName: "(ルナ)"
  },
  {
    title: "Non Non Biyori Movie: Vacation",
    name: "Miyauchi, Hikage",
    image: "https://cdn.myanimelist.net/images/characters/2/254703.jpg",
    tags: ["Miyauchi", "Hikage"],
    japaneseName: "(宮内 ひかげ)"
  },
  {
    title: "Douluo Dalu 2nd Season",
    name: "Zhu, Zhuqing",
    image: "https://cdn.myanimelist.net/images/characters/3/467185.jpg",
    tags: ["Zhu", "Zhuqing"],
    japaneseName: "(朱 竹清)"
  },
  {
    title: "Girls Band Cry",
    name: "Awa, Subaru",
    image: "https://cdn.myanimelist.net/images/characters/16/512878.jpg",
    tags: ["Awa", "Subaru"],
    japaneseName: "(安和 すばる)"
  },
  {
    title: "Shiguang Dailiren: Yingdu Pian",
    name: "Lu, Guang",
    image: "https://cdn.myanimelist.net/images/characters/11/464608.jpg",
    tags: ["Lu", "Guang"],
    japaneseName: "(陸 光)"
  },
  {
    title: "Bakuman. 2nd Season",
    name: "Fukuda, Shinta",
    image: "https://cdn.myanimelist.net/images/characters/6/112128.jpg",
    tags: ["Fukuda", "Shinta"],
    japaneseName: "(福田 真太)"
  },
  {
    title: "Hunter x Hunter: Greed Island",
    name: "Morow, Hisoka",
    image: "https://cdn.myanimelist.net/images/characters/3/174561.jpg",
    tags: ["Morow", "Hisoka"],
    japaneseName: "(ヒソカ・モロウ)"
  },
  {
    title: "Spy x Family Season 2",
    name: "Forger, Yor",
    image: "https://cdn.myanimelist.net/images/characters/11/457934.jpg",
    tags: ["Forger", "Yor"],
    japaneseName: "(ヨル・フォージャー)"
  },
  {
    title: "Mushishi: Hihamukage",
    name: "Ginko",
    image: "https://cdn.myanimelist.net/images/characters/14/303453.jpg",
    tags: ["Ginko", "Ginko"],
    japaneseName: "(ギンコ)"
  },
  {
    title: "Ansatsu Kyoushitsu",
    name: "Akabane, Karma",
    image: "https://cdn.myanimelist.net/images/characters/4/274913.jpg",
    tags: ["Akabane", "Karma"],
    japaneseName: "(赤羽 業)"
  },
  {
    title: "Shingeki no Kyojin: The Final Season - Kanketsu-hen",
    name: "Levi",
    image: "https://cdn.myanimelist.net/images/characters/2/241413.jpg",
    tags: ["Levi", "Levi"],
    japaneseName: "(リヴァイ)"
  },
  {
    title: "Chihayafuru 2",
    name: "Sakurazawa, Midori",
    image: "https://cdn.myanimelist.net/images/characters/11/262731.jpg",
    tags: ["Sakurazawa", "Midori"],
    japaneseName: "(桜沢 翠)"
  },
  {
    title: "Made in Abyss Movie 2: Hourou Suru Tasogare",
    name: "Mitty",
    image: "https://cdn.myanimelist.net/images/characters/12/369728.jpg",
    tags: ["Mitty", "Mitty"],
    japaneseName: "(ミーティ)"
  },
  {
    title: "Shinseiki Evangelion",
    name: "Ikari, Gendou",
    image: "https://cdn.myanimelist.net/images/characters/11/53131.jpg",
    tags: ["Ikari", "Gendou"],
    japaneseName: "(碇 ゲンドウ)"
  },
  {
    title: "Kimi ni Todoke 3rd Season",
    name: "Jounouchi, Souichi",
    image: "https://cdn.myanimelist.net/images/characters/10/79778.jpg",
    tags: ["Jounouchi", "Souichi"],
    japaneseName: "(城ノ内 宗一)"
  },
  {
    title: "Gintama: Shinyaku Benizakura-hen",
    name: "Kagura",
    image: "https://cdn.myanimelist.net/images/characters/2/505912.jpg",
    tags: ["Kagura", "Kagura"],
    japaneseName: "(神楽)"
  }
];

export default async function run(msg, ctx) {
  const { riz, reply, qriz } = ctx;

  try {
    if (!data.length) return reply("❌ Data charanime kosong.");

    const item = pickRandom(data);
    const title = item?.title || "-";
    const name = item?.name || "-";
    const img = item?.image;
    const jp = item?.japaneseName || "-";
    const tags = Array.isArray(item?.tags) ? item.tags.join(", ") : "-";

    if (!img) return reply("❌ Gambar tidak tersedia.");

    const caption =
      `✨ *CHAR ANIME RANDOM*\n\n` +
      `📺 *Anime:* ${title}\n` +
      `👤 *Nama:* ${name}\n` +
      `🈶 *Japanese:* ${jp}\n` +
      `🏷️ *Tags:* ${tags}`;

    await riz.sendMessage(ctx.id, { image: { url: img }, caption }, { quoted: qriz });
  } catch (e) {
    return reply("❌ Error.\nDetail: " + (e?.message || String(e)));
  }
}