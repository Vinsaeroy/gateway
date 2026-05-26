export const command = ["dongeng"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function cleanText(s = "") {
  return String(s)
    .replace(/&nbsp;?/gi, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const dongeng = [
  {
    creator: "Finix-UI",
    judul: "Dongeng Burung Merak yang Angkuh dan Bangau (Aesop) | DONGENG ANAK DUNIA",
    penulis: "Unknown",
    isi: "Dongeng burung merak yang angkuh dan bangau - Seekor burung merak yang berjalan dengan penuh keangkuhan, suatu hari bertemu dengan seekor burung bangau, dan untuk membuat sang Bangau kagum, dia merentangkan bulunya yang indah di bawah sinar matahari.\n\n\"Lihat,\" katanya. \"Dapatkah kamu mengalahkan keindahan ku? Saya bermandikan kemewahan dan pelangi, sedangkan bulu mu kusam kelabu seperti debu!\"\n\nSang Bangau merentangkan sayapnya lebar-lebar dan terbang jauh tinggi ke atas.\n\n\"Ikutilah saya kalau kamu bisa,\" Kata sang Bangau. Tetapi sang Merak hanya bisa berdiri terpaku karena burung merak termasuk jenis burung yang tidak dapat terbang, sedangkan sang Bangau terbang melayang-layang di langit biru dengan bebasnya.\n\nJadi pembelajaran yang dapat kita teladani dari dongeng burung merak yang angkuh dan bangau ini adalah:\n\nJanganlah kita menyombongkan diri terhadap apa yang kita miliki.\n\nLihat Dongeng Berikutnya\n\nDONGENG INDONESIA  DONGENG MANCANEGARA  VIDEO DONGENG\n\nKembali ke Home"
  },
  {
    creator: "Finix-UI",
    judul: "Dongeng Banteng Yang Berkelahi dan Katak di Rawa-rawa (Aesop) | DONGENG ANAK DUNIA",
    penulis: "Unknown",
    isi: "Dongeng banteng yang berkelahi dan katak di rawa-rawa - Dua ekor banteng berkelahi dengan sengitnya di dekat suatu rawa-rawa. Katak tua yang hidup di rawa-rawa menjadi gemetar ketakutan saat melihat perkelahian sengit itu.\n\n\"Apa yang kamu takutkan?\" kata katak yang masih muda.\n\n\"Tidakkah kamu melihat,\" balas sang Katak Tua, \"bahwa banteng yang kalah akan terdorong menuju ke rawa-rawa di sini, dan kita semua akan terinjak sampai masuk ke dalam lumpur?\"\n\nBenar apa kata sang Katak Tua itu, tidak berapa lama kemudian, banteng yang kalah terdorong sampai ke rawa-rawa, dan telapak kakinya yang besar dan keras tanpa sengaja menginjak beberapa katak di rawa-rawa tersebut hingga tewas.\n\nJadi pembelajaran yang dapat kita teladani dari dongeng banteng yang berkelahi dan katak di rawa-rawa ini adalah:\n\nHindarilah perkelahian dan janganlah terlibat dalam perkelahian karena damai itu jauh lebih indah.\n\nLihat Dongeng Berikutnya\n\nDONGENG INDONESIA  DONGENG MANCANEGARA  VIDEO DONGENG\n\nKembali ke Home"
  },
  {
    creator: "Finix-UI",
    judul: "Raja yang Bijaksana",
    penulis: "rina",
    isi: "Dahulu kala, ada seorang raja yang bijaksana memimpin disuatu kerajaan. Suatu hari, ada dua orang datang menghadap sang Raja. Mereka sedang bertengkar dan memperdebatkan sesuatu. Mereka menemui Raja untuk menemukan solusi yang mereka perdebatkan.\n\n“Ada masalah apa kalian berdua?” tanya Raja.\n\n“Dia telah mencuri buah manggaku,” ucap seorang diantara mereka, yang paling tua.\n\nMendengar itu, si Muda langsung ribut. “Aku tidak mengambil mangganya, Raja. Aku berani bersumpah!”\n\n“Aku melihat dia mencuri mangga di depan rumahku tengah malam. Tatkala aku memergokinya, ia berhasil lari. Namun, aku mendapatkan salah satu sandalnya. Keesokan harinya, aku pergi mencari si pemilik sandal itu. Ternyata, sandal satunya itu ada di rumahnya. Berarti ia pelakunya!” kata si Tua sedikit emosi.\n\nSi Muda langsung mengelak. “Sandal itu ada di halaman rumahku, namun bukan berarti aku pencurinya. Pencuri itu menjebakku dengan meletakkan sandalnya di depan rumahku agar kau menuduh aku sebagai pelakunya!”\n\n“Aku tidak percaya padamu! Aku yakin kaulah pelakunya! Kau juga sering melakukan kejahatan. Kau terkenal sebagai pemuda yang kasar dan suka minum di kampung ini. Aku yakin bahwa kau jugalah yang mencuri buah manggaku!” balas si Tua.\n\n“Aku mengerti permasalahan kalian. Sebelum aku memutuskan, aku ingin kau membawa sandal yang kau temukan itu padaku,” kata Raja.\n\n“Aku membawanya, Raja!” kata si Tua, lalu mengeluarkan sandal itu dari dalam tasnya. Si Muda meliriknya dengan kesal.\n\n“Pakailah sandal itu, Muda!” perintah Raja. Si Muda lalu memakainya. Alhasil, sandal itu tidak muat, terlalu kecil.\n\n“Sekarang aku mengerti. Apakah kau benar-benar melihat siapa pencuri manggamu itu?” tanya Raja.\n\n“Sebenarnya aku tidak melihat wajahnya, Raja. Wajahnya ditutupi dengan sarung.\n\n“Aku mengerti. Kau sedang dalam emosi. Kau hanya melihat ia dari sisi buruknya. Aku berpendapat bahwa bukan dia yang mencuri manggamu. Namun, kuharap, ini menjadi pelajaran bagi kalian berdua. Jangan menuduh orang sembarangan. Dan kau juga si Muda, kau harus menjaga sikap dan perbuatanmu selama ini,” kata si Raja.\n\n“Kuharap kalian berdua bisa berbaikan kembali dan saling memaafkan,” lanjut Raja.\n\nSi Muda dan si Tua pun menyadari kesalahannya masing-masing. Mereka saling bersalaman dan meminta maaf.\n\nNasihat: Berprasangka baiklah terhadap satu hal yang belum kamu ketahui kebenarannya. Bijaksanalah dalam membuat keputusan."
  },
  {
    creator: "Finix-UI",
    judul: "Karang Laut",
    penulis: "rina",
    isi: "Didasar lautan biru yang luas, hiduplah sekelompok karang laut. Mereka hidup dengan damai dan menjadi tempat tinggal bagi banyak hewan laut. Para hewan sangat menyayangi dan melindungi mereka. Seiring waktu, karang laut tumbuh besar dan semakin berguna bagi ikan-ikan laut.\n\nPada musim hujan yang berkepanjangan, air laut semakin naik. Banyak ikan ketakutan dengan isu banjir karena air laut semakin meluap, angin laut kencang, juga hujan turun tak kunjung reda.\n\n“Bagaimana jika banjir terjadi?” kata Nemo si Ikan.\n\n“Aku takut kita akan terseret kepermukaan laut. Tubuh kita yang kecil tidak akan bisa menahan pasang air laut. Kita akan terdampar dan terlempar kepinggir laut. Tubuh kita akan terbawa arus air laut ke daratan,” kata seekor anak ikan Paus.\n\nSuatu hari, apa yang mereka perbincangkan terjadi. Air laut tiba-tiba pasang dan terjadi badai besar. Ikan-ikan dan hewan laut lain tidak bisa menahan kuatnya arus laut yang menerjang. Air itu menyeret tubuh mereka ke permukaan.\n\nBanjir juga terjadi di daratan. Semua orang meneriakkan tsunami sambil berlarian. Namun, karang laut tidak terbawa arus laut yang menerjang itu. Tubuhnya kuat dan tetap tertancap di dasar laut. Ia tidak ikut terseret dan terbawa ke pinggir laut. Karang laut tetap bertahan ditempatnya.\n\nNasihat:\n\nJadilah anak yang kuat dan pemberani. Hadapi dengan gagah berani cobaan hidup yang datang menerpa."
  },
  {
    creator: "Finix-UI",
    judul: "Dongeng Monyet dan Kucing Memanggang Kacang (Aesop) | DONGENG ANAK DUNIA",
    penulis: "Unknown",
    isi: "Dongeng Monyet dan Kucing memanggang - Dahulu kala, ada seekor kucing dan monyet yang hidup berdampingan sebagai hewan peliharaan di suatu rumah. Mereka berteman baik dan sering melakukan kenakalan bersama-sama. Yang ada di pikiran mereka hanyalah makan, dan mereka tidak peduli bagaimana cara mendapatkannya.\n\nSuatu hari mereka duduk di perapian sambil membakar kacang kastanya (chestnut). Bagaimana cara mereka mengeluarkan kacang tersebut dari panggangan api? Inilah yang menjadi pertanyaan bagi mereka.\n\n\"Saya dengan senang hati akan mengeluarkan kacang tersebut dari panggangan api,\" kata monyet yang licik, \"tetapi kamu lebih ahli dalam hal ini dibandingkan saya. Tariklah keluar kacang-kacang tersebut dari api dan kita akan membaginya dengan adil.\"\n\nSang Kucing lalu menjulurkan tangannya dengan hati-hati, lalu dengan cepat menarik kacang yang sangat panas dari panggangan api. Ia mengulangi lagi dan menarik kacang tersebut keluar sedikit demi sedikit, dan pada usaha ketiganya, sang Kucing berhasil menarik keluar kacang tersebut. Aksi ini dilanjutkan beberapa kali terhadap kacang yang masih ada dalam panggangan. Secepat tangannya yang menarik kacang tersebut dari api, secepat itu pula sang Monyet mengambil dan memakannya.\n\nSaat sang pemilik rumah pulang, kedua hewan yang nakal ini lari terbirit-birit menyembunyikan diri, dan sang Kucing yang bekerja keras hingga telapaknya melepuh oleh panas api, tidak mendapatkan satu buah kacang pun. Semenjak saat itu, ia tidak pernah lagi mau berurusan dengan sang Monyet yang licik.\n\nJadi pembelajaran yang dapat kita teladani dari dongeng monyet dan kucing memanggang kacang ini adalah:\n\nOrang yang memberikan pujian palsu, mempunyai maksud yang tidak baik yaitu untuk memanfaatkan.\n\nLihat Dongeng Berikutnya\n\nDONGENG INDONESIA  DONGENG MANCANEGARA  VIDEO DONGENG\n\nKembali ke Home"
  },
  {
    creator: "Finix-UI",
    judul: "Perkelahian Ayam dan Burung Elang",
    penulis: "rina",
    isi: "Suatu hari disuatu kandang ayam, ada dua ayam jantan yang sedang berkelahi. Mereka berkelahi dengan serius dan saling mematuk satu sama lain. Hingga akhirnya, salah satu dari mereka kalah dan mundur. Satunya lagi merasa sebagai pemenangnya dan sangat senang.\n\nUntuk mengumumkan kemenangannya dan menunjukkan kehebatannya, ia terbang ke atas atap kandang dan meninggikan dadanya. Ia bersuara lantang dan berniat untuk mengumumkan kemenangannya, seekor Elang yang terbang di atas langit melihatnya.\n\nElang itu merasakan si Ayam pemenang sebagai sasaran yang empuk. Ia langsung turun dan dengan cepat menyambar tubuh si Ayam pemenang yang berdiri di atas atap. Ayam itu dibawanya menuju sarangnya untuk dijadikan santapan.\n\nSementara itu, si Ayam kalah melihat kejadian itu. Ia lalu terbang dan berdiri di atas atap dan mengumumkan kemenangannya. Ia menggantikan si Ayam pemenang yang sudah menjadi makanan si burung Elang.\n\nNasihat: Bersikaplah dengan rendah hati. Kesombongan hanya akan menimbulkan malapetaka yang mencelakai diri sendiri."
  },
  {
    creator: "Finix-UI",
    judul: "Saudagar Kaya yang Pelit",
    penulis: "rina",
    isi: "Dahulu kala, ada seorang saudagar kaya yang sangat pelit. Kekayaannya tersebar dimana-mana. Rumahnya besar dan hartanya banyak. Namun, ia sangat pelit. Ia tidak mau membantu orang yang sulit dan tidak pernah bersedekah.\n\nPekerjaannya sehari-hari adalah berdagang perabot rumah tangga. Ia sering berbelanja ke kota dan dijual di kampungnya. Karena pelit, tidak ada seorang pun yang suka padanya.\n\nSuatu hari, ia pergi ke kota untuk belanja perabot. Ia pun meninggalkan rumahnya dan menguncinya rapat. Ternyata, ia lupa mematikan sekring listriknya. Saat di kota, seseorang menelponnya. Ia sangat terkejut dan kaget ketika ia tahu rumahnya kebakaran.\n\nApi berusaha dipadamkan, namun harta dan perabotnya sudah tidak bisa diselamatkan. Semuanya ludes terbakar. Rumah, perabot, dan hartanya habis ditelan si jago merah. Ia pun langsung pulang dan menangis melihat rumahnya. Akhirnya, ia jatuh miskin.\n\nNasihat: Saat kamu punya banyak, bagilah kepada orang yang tidak punya. Janganlah menjadi orang yang pelit dan sombong."
  },
  {
    creator: "Finix-UI",
    judul: "Beruang dan Lebah",
    penulis: "rina",
    isi: "Suatu ketika, Beruang sedang berjalan-jalan di dalam hutan. Saat itu, ia menemukan sebuah sarang lebah disuatu pohon yang tumbang. Ia pun mengendus-endus sarang lebah itu.\n\nSetelahnya, ia berniat untuk mengambil madu dalam sarang lebah tersebut.\n\nKebetulan, ada dua ekor lebah yang datang dan membawa madu. Melihat Beruang berniat mengambil madu mereka, lebah-lebah itu menyengat Beruang dari belakang. Setelahnya, mereka bersembunyi di dalam lubang pohon.\n\nBeruang langsung marah dan meloncat ke pohon yang tumbang. Ia mencakar-cakar pohon dan menghancurkan sarang lebah. Seketika itu juga, lebah-lebah dalam sarang keluar dan menyengat Beruang. Beruang pun menjadi tidak berdaya ketika semua lebah marah dan menyengat tubuhnya.\n\nNasihat:\n\nPintar-pintarlah dalam mengendalikan emosi. Jika dituruti, emosi hanya akan menyebabkan kerugian untuk diri sendiri dan orang lain."
  }
];

export default async function run(msg, ctx) {
  const { reply } = ctx;

  try {
    if (!dongeng.length) return reply("❌ Data dongeng kosong.");

    const item = pickRandom(dongeng) || {};
    const judul = cleanText(item.judul || "Tanpa Judul");
    const penulis = cleanText(item.penulis || "Unknown");
    const isi = cleanText(item.isi || "");

    if (!isi) return reply("❌ Isi dongeng kosong.");

    const text =
      `📖 *${judul}*\n` +
      `✍️ Penulis: *${penulis}*\n\n` +
      `${isi}`;

    return reply(text);
  } catch (e) {
    return reply("❌ Error.\nDetail: " + (e?.message || String(e)));
  }
}