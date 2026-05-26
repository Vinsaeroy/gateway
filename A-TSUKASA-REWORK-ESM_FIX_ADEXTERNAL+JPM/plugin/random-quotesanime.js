export const command = ["quotesanime", "qanime", "animequote"];

export default async function (m, { reply }) {
  const data = [
  {
    "🎁 *Quotes": "Kata-kata dapat menyakiti seseorang. Meskipun kau menyesalinya, kau takkan pernah bisa menarik kembali (kata-kata yang telah kau ucapkan).*",
    "☘️ *Character": "Jun Naruse*",
    "🍁 *Anime": "Kokoro ga Sakebitagatterunda.*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Jika peringkat (dalam pertandingan) membuatmu khawatir. (Tenang saja) kau sudah mendapatkan peringkat pertama di dalam hatiku.*",
    "☘️ *Character": "Keima Katsuragi*",
    "🍁 *Anime": "Kami nomi zo Shiru Sekai*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Para penguasa itu seperti hewan ternak yang hanya memakan jabatan.*",
    "☘️ *Character": "Marrine Kreische*",
    "🍁 *Anime": "Grancrest Senki*",
    "🍁 *Episode": "Episode 20*"
  },
  {
    "🎁 *Quotes": "Dia lebih mencemaskan temannya daripada dirinya sendiri. Dia lebih mementingkan temannya. Aku menghormati perasaannya. Jika kau ingin mencapai sesuatu, kau harus berusaha keras untuk mencapai semuanya.*",
    "☘️ *Character": "Subaru Natsuki*",
    "🍁 *Anime": "Re:Zero kara Hajimeru Isekai Seikatsu*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Karena aku tak memiliki harta sama sekali, yang bisa aku berikan hanyalah waktu, perasaan, masa depan, kehidupan dan hal-hal samar lainnya.*",
    "☘️ *Character": "Hachiman Hikigaya*",
    "🍁 *Anime": "Yahari Ore no Seishun Love Comedy wa Machigatteiru. Kan*",
    "🍁 *Episode": "Episode 11*"
  },
  {
    "🎁 *Quotes": "Suna, kali ini aku tak akan salah lagi. Tapi, jika aku kehilangan arah dan mulai mengambil jalan yang salah, tolong pukul aku.*",
    "☘️ *Character": "Takeo Gouda*",
    "🍁 *Anime": "Ore Monogatari!!*",
    "🍁 *Episode": "Episode 24*"
  },
  {
    "🎁 *Quotes": "Kejujuran yang kau perlihatkan saat kau mengungkapkan perasaanmu benar-benar murni dan manis.*",
    "☘️ *Character": "Suzuno Kamazuki*",
    "🍁 *Anime": "Hataraku Maou-sama!*",
    "🍁 *Episode": "Episode 8*"
  },
  {
    "🎁 *Quotes": "Kami (berdua) yang telah terluka saling mengharapkan hal yang sama.Jika besok kau mati, maka aku tidak keberatan jika besok hidupku juga berakhir.Jika hari ini kau tetap hidup, aku pun juga akan hidup.*",
    "☘️ *Character": "Koyomi Araragi*",
    "🍁 *Anime": "Kizumonogatari III: Reiketsu-hen*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Kalau ada gadis cantik yang sedang kesulitan, pria baik (pasti) akan menyelamatkannya.*",
    "☘️ *Character": "Rita Ainsworth*",
    "🍁 *Anime": "Sakurasou no Pet na Kanojo*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Mereka bilang orang itu bisa berubah, tapi apa yang seperti itu bisa terjadi? Jika mereka (manusia) memutuskan untuk terbang, pasti akan tumbuh sayap? Aku tak berpikir seperti itu. Kau tak perlu merubah dirimu, (tapi) rubahlah cara berfikirmu. Kau harus menjadi dirimu sendiri. Kau harus membuat cara terbangmu sendiri, meskipun kau masih tetap menjadi dirimu sendiri.*",
    "☘️ *Character": "Sora*",
    "🍁 *Anime": "No Game No Life*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Yakinlah pada dirimu sendiri! Semuanya akan baik baik saja! Semakin keras kau berusaha, kau pasti akan semakin beruntung!*",
    "☘️ *Character": "Miyano*",
    "🍁 *Anime": "Tanaka-kun wa Itsumo Kedaruge*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Mengetahui orang lain mau membaca tulisanku yang kusukai dan mereka memberikan kesan yang cukup bagus itu sangat menyenangkan.*",
    "☘️ *Character": "Yoshiteru Zaimokuza*",
    "🍁 *Anime": "Yahari Ore no Seishun Love Comedy wa Machigatteiru*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Seluruh tubuhku telah berlumuran darah. Karena aku, puluhan ribu orang telah kehilangan nyawanya. Aku tak pantas hidup bahagia.*",
    "☘️ *Character": "Marrine Kreische*",
    "🍁 *Anime": "Grancrest Senki*",
    "🍁 *Episode": "Episode 20*"
  },
  {
    "🎁 *Quotes": "Hanya karena semua orang melakukan dan mengatakan hal yang sama, itu tak menjamin kebenaran.*",
    "☘️ *Character": "Sakuta Azusagawa*",
    "🍁 *Anime": "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai*",
    "🍁 *Episode": "Episode 3*"
  },
  {
    "🎁 *Quotes": "Temanku akan menang meski kutinggalkan mereka!*",
    "☘️ *Character": "Akiteru Tsukishima*",
    "🍁 *Anime": "Haikyuu!!: Karasuno Koukou VS Shiratorizawa Gakuen Koukou*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Setiap orang memiliki langkah mereka sendiri.*",
    "☘️ *Character": "Miwako Tomobe*",
    "🍁 *Anime": "Seishun Buta Yarou wa Bunny Girl Senpai no Yume wo Minai*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Semua hal yang terjadi di depanku adalah masalah yang hanya bisa diselesaikan oleh diriku sendiri.*",
    "☘️ *Character": "Hachiman Hikigaya*",
    "🍁 *Anime": "Yahari Ore no Seishun Love Comedy wa Machigatteiru. Zoku*",
    "🍁 *Episode": "Episode 4*"
  },
  {
    "🎁 *Quotes": "Seseorang tidak akan berjuang sekeras itu jika dia tidak menyukainya.*",
    "☘️ *Character": "Keiko Ayano*",
    "🍁 *Anime": "Sword Art Online*",
    "🍁 *Episode": "Episode 4*"
  },
  {
    "🎁 *Quotes": "Yusa-san mencoba membuatku berhenti menyukaimu dan berkata kalau aku akan menyesal nantinya. Tapi, aku menyukaimu dengan kemauanku sendiri. Maka dari itu, suka ataupun tidak suka, aku sendiri yang memutuskannya.*",
    "☘️ *Character": "Chiho Sasaki*",
    "🍁 *Anime": "Hataraku Maou-sama!*",
    "🍁 *Episode": "Episode 8*"
  },
  {
    "🎁 *Quotes": "Mengabdikan diri untuk pendidikan adalah suatu bentuk kerja keras.*",
    "☘️ *Character": "Mayoi Hachikuji*",
    "🍁 *Anime": "Monogatari Series: Second Season*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Aku sangat menyukai kerendahan hatimu yang bahkan tak kausadari telah menjadi daya tarikmu.*",
    "☘️ *Character": "Neko Fujinomiya*",
    "🍁 *Anime": "Masamune-kun no Revenge*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Kau tak boleh bilang \"hidup sendiri\" ketika banyak orang yang mengkhawatirkan dirimu.*",
    "☘️ *Character": "Akari Kawamoto*",
    "🍁 *Anime": "3-gatsu no Lion*",
    "🍁 *Episode": "Episode 11*"
  },
  {
    "🎁 *Quotes": "Di lingkungan orang-orang dewasa, setiap kerja keras akan selalu mendapat imbalan.*",
    "☘️ *Character": "Yoshifumi Nitta*",
    "🍁 *Anime": "Hinamatsuri*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Temanku akan menang meski kutinggalkan mereka!*",
    "☘️ *Character": "Akiteru Tsukishima*",
    "🍁 *Anime": "Haikyuu!!: Karasuno Koukou VS Shiratorizawa Gakuen Koukou*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Kecantikan seorang makhluk itu akan terlihat indah saat mereka masih alami.*",
    "☘️ *Character": "Itsuki Hashima*",
    "🍁 *Anime": "Imouto sae Ireba Ii.*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Mari kita bersaing secara sehat agar nantinya takkan ada penyesalan diantara kita.*",
    "☘️ *Character": "Crusch Karsten*",
    "🍁 *Anime": "Re:Zero kara Hajimeru Isekai Seikatsu*",
    "🍁 *Episode": "Episode 15*"
  },
  {
    "🎁 *Quotes": "Saling menerima cinta satu sama lain adalah hal yang wajar. Jika dunia melarangnya, aku akan mengubah dunia ini meskipun harus menghancurkannya.*",
    "☘️ *Character": "Theo Cornaro*",
    "🍁 *Anime": "Grancrest Senki*",
    "🍁 *Episode": "Episode 20*"
  },
  {
    "🎁 *Quotes": "Aku tidak peduli! Selama aku bisa terus bersama dengan dirimu, bagiku sudah cukup. Tidak, bahkan itulah yang aku inginkan!*",
    "☘️ *Character": "Koyuki Hinashi*",
    "🍁 *Anime": "Fuuka*",
    "🍁 *Episode": "Episode 11*"
  },
  {
    "🎁 *Quotes": "Aku hanya ingin melihatmu membuktikan bahwa kerja keras pasti membawa hasil yang memuaskan.*",
    "☘️ *Character": "Sorata Kanda*",
    "🍁 *Anime": "Sakurasou no Pet na Kanojo*",
    "🍁 *Episode": "Episode 15*"
  },
  {
    "🎁 *Quotes": "Tugas kami sebagai orang biasa adalah untuk memastikan bahwa potensi yang tak bisa dimengerti itu bisa terwujud.*",
    "☘️ *Character": "Sora*",
    "🍁 *Anime": "No Game No Life*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Aku memiliki kehidupan yang kosong, tak ada apapun kecuali perasaanku padamu.(Meskipun) aku juga tidak punya pedang, tapi hatiku ingin menjadi seorang kesatria.*",
    "☘️ *Character": "Akitoshi Daimon*",
    "🍁 *Anime": "Sket Dance*",
    "🍁 *Episode": "Episode 41*"
  },
  {
    "🎁 *Quotes": "Melihat seorang murid yang menatap masa depannya itu begitu indah.*",
    "☘️ *Character": "Souma*",
    "🍁 *Anime": "Demi-chan wa Kataritai*",
    "🍁 *Episode": "Episode 10*"
  },
  {
    "🎁 *Quotes": "Mungkin ada kalanya (kau) merasa bingung dan merasa kesal karena kenyataan tidak berjalan sesuai dengan harapan. Tapi, hal yang kau pelajari tidak akan pernah mengkhianatimu.*",
    "☘️ *Character": "Tooru Miyagishi*",
    "🍁 *Anime": "Hanasaku Iroha*",
    "🍁 *Episode": "Episode 21*"
  },
  {
    "🎁 *Quotes": "Aku ingin menikmati hubungan asmara ini, bukan hasilnya.*",
    "☘️ *Character": "Mari Shiina*",
    "🍁 *Anime": "Renai Boukun*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Tertawa karena baca manga komedi dapat melatih otot perut. Terkejut karena baca manga horor dapat melatih otot punggung. Berdebar-debar karena baca manga romatis dapat melatih otot jantung. Membaca manga edisi khusus setebal 932 halaman dapat melatih otot bisep. Orang-orang yang terlibat dengan manga harus melatih otot dengan manga.*",
    "☘️ *Character": "Ami Kakei*",
    "🍁 *Anime": "Kakushigoto*",
    "🍁 *Episode": "Episode 3*"
  },
  {
    "🎁 *Quotes": "Pemandangan yang kurasa membosankan...Pemandangan di mana Kou-chan berada (ternyata) sangat indah.*",
    "☘️ *Character": "Ohana Matsumae*",
    "🍁 *Anime": "Hanasaku Iroha*",
    "🍁 *Episode": "Episode 24*"
  },
  {
    "🎁 *Quotes": "Apa kalian menyukai sekolah?Aku sangat menyukainya. Kalian mungkin menganggapnya aneh, tapi sekolah adalah tempat yang hebat.*",
    "☘️ *Character": "Yuki Takeya*",
    "🍁 *Anime": "Gakkou Gurashi!*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Ada hal yang tak pernah bisa dilihat sebelum melangkah. Karena itu, aku melangkah tanpa rasa takut.*",
    "☘️ *Character": "Itsuki Hashima*",
    "🍁 *Anime": "Imouto sae Ireba Ii.*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Jangan pernah mati hanya karena hal-hal yang konyol.*",
    "☘️ *Character": "Eris*",
    "🍁 *Anime": "Kono Subarashii Sekai ni Shukufuku wo!: Kono Subarashii Choker ni Shukufuku wo!Kono Subarashii Sekai ni Shukufuku wo! OV*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Ketika bersama denganmu, segalanya jadi menyenangkan.*",
    "☘️ *Character": "Yukiko Asai*",
    "🍁 *Anime": "Nijiiro Days*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Aku takkan punya kehidupan yang cukup jika hanya mengandalkan keberuntungan saja.*",
    "☘️ *Character": "Shikamaru Nara*",
    "🍁 *Anime": "Naruto Shippuden*",
    "🍁 *Episode": "Episode 16*3"
  },
  {
    "🎁 *Quotes": "Aku tidak mau mengorbankan apapun atau menyeret siapapun hanya untuk menang.*",
    "☘️ *Character": "Makoto Tsukimoto*",
    "🍁 *Anime": "Ping Pong The Animation*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Tak masalah kalau melarikan diri untuk tetap hidup.Karena kau bukan hewan ternak yang tak punya tempat untuk melarikan diri.*",
    "☘️ *Character": "Kouchou*",
    "🍁 *Anime": "Gin no Saji*",
    "🍁 *Episode": "Episode 11*"
  },
  {
    "🎁 *Quotes": "Sesedih apapun suatu ingatan, setelah diceritakan semuanya hanya akan jadi suatu cerita.*",
    "☘️ *Character": "Ougi Oshino*",
    "🍁 *Anime": "Owarimonogatari*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Jangan buang rasa kesalmu. Karena itu akan jadi bukti kalau kau masih belum menyerah pada dirimu sendiri.*",
    "☘️ *Character": "Ryouma Kurogane*",
    "🍁 *Anime": "Rakudai Kishi no Cavalry*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Sebagai senior dalam menjalani hidup, (aku) yang berada sedikit didepannya akan menunjukkannya jalan menuju kebahagiaan.*",
    "☘️ *Character": "Koyomi Araragi*",
    "🍁 *Anime": "Owarimonogatari*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Kita tidak akan bisa berbuat apa-apa jika kita terpisah. (Tapi) ketika seseorang bertemu dengan yang lainnya (semua akan berubah).Sekarang, di suatu tempat mungkin sedang terjadi suatu pertemuan yang dapat mengubah dunia.Mungkin hal itu terjadi di suatu negara yang sangat jauh. Mungkin juga berada di sisi planet ini.Atau mungkin itu berada di klub voli kecil, di sebuah SMA biasa, di sebuah negara kepulauan kecil di timur.Kupikir pertemuan itu terjadi di sini, di Karasuno. Aku tahu aku tak bisa membuktikan apa yang kukatakan, tapi aku sangat yakin. Aku yakin mulai dari sekarang, kalian akan menjadi lebih kuat lagi!*",
    "☘️ *Character": "Ittetsu Takeda*",
    "🍁 *Anime": "Haikyuu!!*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Datang ke tempatmu sudah cukup untuk menyembuhkan satu hatiku.*",
    "☘️ *Character": "Yuuka Kobayakawa*",
    "🍁 *Anime": "Shoujo-tachi wa Kouya wo Mezasu*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Namaku adalah Nasa Yuzaki, seorang yang lebih cepat dari Nasa, seorang yang akan mencapai kecepatan cahaya.*",
    "☘️ *Character": "Nasa Yuzaki*",
    "🍁 *Anime": "Tonikaku Kawaii*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Orang-orang sering melihat ke langit ketika mereka sedang bingung.*",
    "☘️ *Character": "Tooru Miyamae*",
    "🍁 *Anime": "Seiren*",
    "🍁 *Episode": "Episode 8*"
  },
  {
    "🎁 *Quotes": "Memang benar, akulah yang gila. Aku dibutakan delusi chuunibyou dan terpengaruh rasa keadilan murahan.*",
    "☘️ *Character": "Yuu Ishigami*",
    "🍁 *Anime": "Kaguya-sama wa Kokurasetai?: Tensai-tachi no Renai Zunousen*",
    "🍁 *Episode": "Episode 11*"
  },
  {
    "🎁 *Quotes": "Hanya orang bodoh yang memainkan game yang tak bisa dia menangkan.*",
    "☘️ *Character": "Sora*",
    "🍁 *Anime": "No Game No Life*",
    "🍁 *Episode": "Episode 5*"
  },
  {
    "🎁 *Quotes": "Kau akan membenci dirimu sendiri jika kau melakukan apa yang kau benci.*",
    "☘️ *Character": "Chihiro Sengoku*",
    "🍁 *Anime": "Sakurasou no Pet na Kanojo*",
    "🍁 *Episode": "Episode 19*"
  },
  {
    "🎁 *Quotes": "Aku masih bisa berjuang (sampai sekarang) itu karena kau percaya padaku. Terima kasih Airi, aku bersyukur telah mempercayaimu.*",
    "☘️ *Character": "Satoru Fujinuma*",
    "🍁 *Anime": "Boku dake ga Inai Machi*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Manusia bisa saling berkumpul, saling membantu, dan menyelesaikan sesuatu. Namun peradaban mereka gampang sekali dimusnahkan oleh para naga. Jadi kurasa naga lebih hebat (dari manusia).*",
    "☘️ *Character": "Tooru*",
    "🍁 *Anime": "Kobayashi-san Chi no Maid Dragon*",
    "🍁 *Episode": "Episode 5*"
  },
  {
    "🎁 *Quotes": "Jangan lari lagi...Jangan pergi ke tempat yang tidak bisa kucapai.Bersamalah denganku selamanya...*",
    "☘️ *Character": "Kouko Kaga*",
    "🍁 *Anime": "Golden Time*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Dia lebih mencemaskan temannya daripada dirinya sendiri. Dia lebih mementingkan temannya. Aku menghormati perasaannya. Jika kau ingin mencapai sesuatu, kau harus berusaha keras untuk mencapai semuanya.*",
    "☘️ *Character": "Subaru Natsuki*",
    "🍁 *Anime": "Re:Zero kara Hajimeru Isekai Seikatsu*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Cinta adalah kekonyolan dan tak ada gunanya jika dibandingkan dengan belajar.*",
    "☘️ *Character": "Fuutarou Uesugi*",
    "🍁 *Anime": "Gotoubun no Hanayome*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Cinta sejati adalah cinta yang tak dipengaruhi oleh penampilan. Jika penampilan orang bisa mempengaruhi perasaanmu, maka cintamu itu palsu.*",
    "☘️ *Character": "Chika Fujiwara*",
    "🍁 *Anime": "Kaguya-sama wa Kokurasetai?: Tensai-tachi no Renai Zunousen*",
    "🍁 *Episode": "Episode 5*"
  },
  {
    "🎁 *Quotes": "Kupikir kalau aku hidup dengan jujur pada diriku sendiri, aku tak akan punya penyesalan. Tapi ternyata itu salah...*",
    "☘️ *Character": "Hime Onizuka*",
    "🍁 *Anime": "Sket Dance*",
    "🍁 *Episode": "Episode 3*"
  },
  {
    "🎁 *Quotes": "Dalam game, mustahil mengetahui aturan atau tujuan seseorang, karena ada 7 milyar pemain yang bergerak sesuai kenginannya.*",
    "☘️ *Character": "Sora*",
    "🍁 *Anime": "No Game No Life*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Kerinduan mencengkeram orang lebih kuat daripada racun, dan lebih dalam daripada penyakit.*",
    "☘️ *Character": "Lyza*",
    "🍁 *Anime": "Made in Abyss*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Aku akan terus mengatakannya!Jangan pernah berhenti membuat game, jangan berhenti berkarya.Kau tidak boleh menyerah mengejar impianmu.*",
    "☘️ *Character": "Iori Hashima*",
    "🍁 *Anime": "Saenai Heroine no Sodatekata ♭*",
    "🍁 *Episode": "Episode 10*"
  },
  {
    "🎁 *Quotes": "Setelah kematian, kalian akan dikirim ke \"surga\" atau \"neraka\".*",
    "☘️ *Character": "Decim*",
    "🍁 *Anime": "Death Parade*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Tidur itu sangat penting. Kurang tidur bisa berdampak buruk pada pekerjaan, dan kesehatanmu. Tidur di kursi bisa menghilangkan rasa penatmu untuk sementara, tapi tidak baik untuk punggungmu.*",
    "☘️ *Character": "Umiko Ahagon*",
    "🍁 *Anime": "New Game!!*",
    "🍁 *Episode": "Episode 4*"
  },
  {
    "🎁 *Quotes": "Kadang-kadang pria harus melindungi sesuatu, walaupun dia harus membuang kehormatannya sendiri.*",
    "☘️ *Character": "Kanichi Konishi*",
    "🍁 *Anime": "Shokugeki no Souma*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Bermuka dua? Aku rasa lebih dari itu. Dia sangat terburu-buru mencari apa yang telah dicuri darinya, lalu dia berhenti menolongku. Malahan dia kepikiran alasan yang tidak masuk akal untuk memonta tolong agar aku tak merasa berhutang kepadanya, meskipun aku adalah orang asing. Siapapun yang hidup seperti itu akhirnya akan menyia-nyiakan seluruh hidupnya!*",
    "☘️ *Character": "Subaru Natsuki*",
    "🍁 *Anime": "Re:Zero kara Hajimeru Isekai Seikatsu*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Kadang-kadang pria harus melindungi sesuatu, walaupun dia harus membuang kehormatannya sendiri.*",
    "☘️ *Character": "Kanichi Konishi*",
    "🍁 *Anime": "Shokugeki no Souma*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Aku tidak benci bekerja keras. Belajar untuk melakukan sesuatu yang sebelumnya tidak bisa ku lakukan itu bukan hal buruk.*",
    "☘️ *Character": "Subaru Natsuki*",
    "🍁 *Anime": "Re:Zero kara Hajimeru Isekai Seikatsu*",
    "🍁 *Episode": "Episode 4*"
  },
  {
    "🎁 *Quotes": "Mustahil menyelamatkan semua orang. Menyelamatkan banyak orang harus dibayar dengan menghancurkan sebagian kecil orang lainnya.*",
    "☘️ *Character": "Archer*",
    "🍁 *Anime": "Fate/stay night: Unlimited Blade Works 2nd Season*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Walau dunia ini memusuhimu, aku akan tetap di sampingmu.*",
    "☘️ *Character": "Miyabi Azumaya*",
    "🍁 *Anime": "Dimension W*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Atasan yang lebih baik, membawa perusahaan lebih baik. Tak ada gunanya mempermasalahkan siapa atasanmu!*",
    "☘️ *Character": "Daikichi Kawachi*",
    "🍁 *Anime": "Usagi Drop*",
    "🍁 *Episode": "Episode 3*"
  },
  {
    "🎁 *Quotes": "Aku percaya kepadamu.*",
    "☘️ *Character": "Raphtalia*",
    "🍁 *Anime": "Tate no Yuusha no Nariagari*",
    "🍁 *Episode": "Episode 4*"
  },
  {
    "🎁 *Quotes": "Ketika ada sesuatu yang populer, itu artinya yang lainnya tidak populer.*",
    "☘️ *Character": "Deishuu Kaiki*",
    "🍁 *Anime": "Koyomimonogatari*",
    "🍁 *Episode": "Episode 5*"
  },
  {
    "🎁 *Quotes": "Orang-orang berkata kalau orang yang meninggal akan pergi ke surga. Tapi menurutku tidak begitu. Aku pikir jika kita mati, kita akan pergi ke hati seseorang. Kita akan tinggal dalam kenangan mereka dan terus hidup. Seperti ayah dan ibu yang tinggal di hati kami. Tapi karena waktu, kenangan pun memudar. Jadi itulah mengapa orang-orang berharap untuk meninggalkan sesuatu agar tidak dilupakan dan tidak pernah dilupakan.*",
    "☘️ *Character": "Kaito Kirishima*",
    "🍁 *Anime": "Ano Natsu de Matteru*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Meski kita hidup dalam peraturan, kita tak bisa menyalamatkan siapapun. Meski aku harus melanggar peraturan, aku takkan membiarkan siapapun menghalangi mimpiku.*",
    "☘️ *Character": "Shirou Kotomine*",
    "🍁 *Anime": "Fate/Apocrypha*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Lupakan orang yang meninggalkanmu, dan persiapkan dirimu untuk cinta yang baru. Itulah yang harus dilakukan dalam menjalani cinta.*",
    "☘️ *Character": "Kagura*",
    "🍁 *Anime": "Gintama*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Genos, sejak awal karena keinginan besarku yang ingin menjadi pahlawanlah yang mendorongku untuk berlatih sangat keras.karena itulah aku menjadi sekuat ini.*",
    "☘️ *Character": "Saitama*",
    "🍁 *Anime": "One Punch Man*",
    "🍁 *Episode": "Episode 6*"
  },
  {
    "🎁 *Quotes": "Bukan masalah benci atau tidaknya. Ibuku adalah Ibuku, takkan pernah berubah. Apapun yang terjadi, dialah yang melahirkanku.*",
    "☘️ *Character": "Asuka Tanaka*",
    "🍁 *Anime": "Hibike! Euphonium 2*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Aku tidak suka hubungan yang tidak jelas.*",
    "☘️ *Character": "Hitagi Senjougahara*",
    "🍁 *Anime": "Bakemonogatari*",
    "🍁 *Episode": "Episode 5*"
  },
  {
    "🎁 *Quotes": "Orang-orang terlalu mengistimewakan sesuatu yang tak bisa dilihat.*",
    "☘️ *Character": "Mahito*",
    "🍁 *Anime": "Jujutsu Kaisen*",
    "🍁 *Episode": "Episode 10*"
  },
  {
    "🎁 *Quotes": "Kita memang menemui jalan buntu, tapi aku takkan berhenti. Demi mereka yang telah tiada, aku harus tetap maju. Sebagai Putri Hyland, sebagai seseorang yang membimbing negri ini menuju keadilan, tolong pinjamkanlah kekuatan kalian.*",
    "☘️ *Character": "Alisha Diphda*",
    "🍁 *Anime": "Tales of Zestiria the X Season 2*",
    "🍁 *Episode": "Episode 3*"
  },
  {
    "🎁 *Quotes": "Melihatnya bekerja keras untuk membenciku, entah mengapa agak menyenangkan.*",
    "☘️ *Character": "Ohana Matsumae*",
    "🍁 *Anime": "Hanasaku Iroha*",
    "🍁 *Episode": "Episode 3*"
  },
  {
    "🎁 *Quotes": "Pasti sangat sulit berusaha melakukan apa yang diinginkan. (Sebenarnya) aku tidak terlalu mengerti, tapi pasti butuh kerja keras untuk mendapatkan hasilnya. Meskipun (kadang) memiliki impian itu membuatmu sulit (menjalani hidup).*",
    "☘️ *Character": "Yuusuke Fujisaki*",
    "🍁 *Anime": "Sket Dance*",
    "🍁 *Episode": "Episode 42*"
  },
  {
    "🎁 *Quotes": "Entah itu orang suci ataupun pendosa, semua orang punya hak untuk menegakkan keadilan mereka. Menolak keadilan mereka dan membunuhnya adalah hal tabu bagiku.*",
    "☘️ *Character": "Brad Blackstone*",
    "🍁 *Anime": "Taboo Tattoo*",
    "🍁 *Episode": "Episode 9*"
  },
  {
    "🎁 *Quotes": "Kemenangan sejati bukanlah saat kau menang melawan yang kuat.Melainkan saat kau berhasil melindungi sesuatu yang berharga bagimu.*",
    "☘️ *Character": "Duy Might*",
    "🍁 *Anime": "Naruto Shippuden*",
    "🍁 *Episode": "Episode 41*9"
  },
  {
    "🎁 *Quotes": "Setiap jomblo yang punya hewan peliharaan pasti merasakan kebahagiaan palsu*",
    "☘️ *Character": "Mayumi Nishikino*",
    "🍁 *Anime": "Bokura wa Minna Kawaisou*",
    "🍁 *Episode": "Episode 11*"
  },
  {
    "🎁 *Quotes": "Kau adalah seorang profesional, tapi jika kau tak bisa menyeimbangkan antara pembunuh (profesi) dan guru (tuntutan peran dalam profesi), maka ini (sekolah) adalah tempat terburuk bagi orang profesional sepertimu.*",
    "☘️ *Character": "Tadaomi Karasuma*",
    "🍁 *Anime": "Ansatsu Kyoushitsu*",
    "🍁 *Episode": "Episode 4*"
  },
  {
    "🎁 *Quotes": "Aku tahu jika kau sedang berbohong. Aku tahu kalau kau juga tak bisa mengatakan alasannya. Jadi, kau tak perlu meyakinkanku, menutupi semuanya dengan kebohongan, atau menyalahkan dirimu sendiri seperti itu. Karena aku percaya padamu.*",
    "☘️ *Character": "Rem*",
    "🍁 *Anime": "Re:Zero kara Hajimeru Isekai Seikatsu*",
    "🍁 *Episode": "Episode 19*"
  },
  {
    "🎁 *Quotes": "Semua bergantung pada tampan atau tidaknya seseorang. Itulah pedoman hidupku. Jika tidak tampan, berarti bukan laki-laki.*",
    "☘️ *Character": "Masamune Makabe*",
    "🍁 *Anime": "Masamune-kun no Revenge*",
    "🍁 *Episode": "Episode 1*"
  },
  {
    "🎁 *Quotes": "Entah itu jalan yang lurus ataupun jalan yang menyesatkan, selama kami masih bisa berjalan di sampingmu, kami tak peduli ke manapun kami pergi.*",
    "☘️ *Character": "Toushirou Hijikata*",
    "🍁 *Anime": "Gintama°*",
    "🍁 *Episode": "Episode 48*"
  },
  {
    "🎁 *Quotes": "Kau harus punya mata dan keberanian untuk mengatakan yang bagus ya bagus, dan jelek ya jelek.*",
    "☘️ *Character": "Utaha Kasumigaoka*",
    "🍁 *Anime": "Saenai Heroine no Sodatekata ♭*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Memang benar kalau aku putus asa dengan dunia nyata. Tapi aku tidak putus asa dengan diriku sendiri. Yang memutuskan apakah hidupku membosankan, menyenangkan atau biasa-biasa saja bukalah dunia ini, tapi diriku sendiri. Selama aku memiliki kemauan, tak ada yang mustahil. Kau pun juga bisa melakukan apapun yang kau inginkan.*",
    "☘️ *Character": "Keima Katsuragi*",
    "🍁 *Anime": "Kami nomi zo Shiru Sekai II*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Sejak kecil, aku selalu membayangkan pemandangan indah yang ada di mana-mana. Pemandangan yang selalu aku lihat dan tak terhitung dalam mimpiku. Tapi aku belum pernah kesana. Mereka mengatakan itu adalah efek samping dari Antifeminas milik Inglobe yang ada pada diriku. Tapi aku tak peduli dengan penyebab itu, Aku hanya ingin mencari sesuatu. Karena itu aku melakukan perjalanan.*",
    "☘️ *Character": "Ichika Takatsuki*",
    "🍁 *Anime": "Ano Natsu de Matteru*",
    "🍁 *Episode": "Episode 2*"
  },
  {
    "🎁 *Quotes": "Bagi yang berusaha maka Tuhan akan tersenyum padamu, itu adalah bohong.Tapi, takdir Tuhan akan berkedip padamu.*",
    "☘️ *Character": "Kumiko Oumae*",
    "🍁 *Anime": "Hibike! Euphonium*",
    "🍁 *Episode": "Episode 12*"
  },
  {
    "🎁 *Quotes": "Perempuan yang sedang jatuh cinta bisa menentang Tuhan.*",
    "☘️ *Character": "Tsushima*",
    "🍁 *Anime": "Toaru Majutsu no Index III*",
    "🍁 *Episode": "Episode 8*"
  },
  {
    "🎁 *Quotes": "Aku tidak bisa fokus karena terpana olehmu.*",
    "☘️ *Character": "Fuutarou Uesugi*",
    "🍁 *Anime": "Gotoubun no Hanayome*",
    "🍁 *Episode": "Episode 10*"
  },
  {
    "🎁 *Quotes": "Seekor ikan, baik yang tinggal di air jernih atau kotor, selama ikan itu terus berenang ke depan, dia akan tumbuh dengan indah.*",
    "☘️ *Character": "Koro-sensei*",
    "🍁 *Anime": "Ansatsu Kyoushitsu*",
    "🍁 *Episode": "Episode 7*"
  },
  {
    "🎁 *Quotes": "Wanita itu orang yang realistis. Kami tidak percaya hanya pada kata-kata.*",
    "☘️ *Character": "Aiza Nagi*",
    "🍁 *Anime": "Shigatsu wa Kimi no Uso*",
    "🍁 *Episode": "Episode 17*"
  },
  {
    "🎁 *Quotes": "Tidak ada kebahagiaan yang begitu berat hingga membuatmu hancur. Kebahagiaan itu bukanlah (suatu hal yang) berat maupun ringan. Jangan berlebihan menganggap kebahagiaan. Semua jenis kebahagiaan akan cocok untukmu. Jadi jangan membenci kebahagiaan seperti itu. Jangan membenci dunia, jangan membenci semua hal. Jangan membenci dirimu sendiri. Semua jenis kebencian di dalam dirimu semuanya akan kuterima dan kutanggung untukmu. Aku ingin kau lebih mencintai dirimu sendiri.*",
    "☘️ *Character": "Koyomi Araragi*",
    "🍁 *Anime": "Owarimonogatari*",
    "🍁 *Episode": "Episode 5*"
  }
];

  const pick = data[Math.floor(Math.random() * data.length)];

  const text = `🎌 *Quotes Anime Random*\n\n${pick["🎁 *Quotes"]}\n${pick["☘️ *Character"]}\n${pick["🍁 *Anime"]}\n${pick["🍁 *Episode"]}`;

  reply(text);
}