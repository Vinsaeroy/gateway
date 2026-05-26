export const command = ["katabijak", "bijak", "motivasi"];

export default async function (m, { reply }) {

    const quotes = [
 "☘️ Jika tak cinta, katakan saja. Jangan memberi harapan hampa, karena seseorang akan terluka. Jangan manfaatkan cinta!",
 "☘️ Meski bersahabat, kalian tak harus selalu bersama. Punya waktu sendiri itu penting. Tapi jangan lupakan mereka saat kamu menemukan cinta.",
 "☘️ Jika dia mencintaimu, dia akan serius. Kalau dia mempertahankanmu tapi tak serius, tinggalkan.",
 "☘️ Mewujudkan keinginan adalah hadiah terbesar sejak kita lahir.",
 "☘️ Bersama orang lain aku mungkin malu-malu, tapi bersama sahabat aku jadi gila.",
 "☘️ Jangan putus asa soal cinta. Selalu ada yang mencintaimu tulus, meski bukan yang kamu mau.",
 "☘️ Saat hubungan berakhir, bukan berarti berhenti saling mencintai, hanya berhenti saling menyakiti.",
 "☘️ Kebahagiaanku sempurna jika senyum ibu adalah karena aku.",
 "☘️ Kadang masalah adalah sahabat terbaik. Mereka membuatmu kuat dan mendekatkanmu pada Tuhan.",
 "☘️ Sahabat tidak selalu menjadi pahlawan, tapi mereka selalu datang di waktu yang tepat.",
 "☘️ Begitu sulitnya mencari teman yang tetap peduli meski lama tak jumpa.",
 "☘️ Tak ada kata terlambat untuk berubah. Masa lalu hanyalah proses pendewasaan.",
 "☘️ Saat merasa tidak perlu belajar lagi, di situlah kamu harus belajar tentang rendah hati.",
 "☘️ Cinta sejati adalah ketika kamu bisa tersenyum walau dia mencintai orang lain.",
 "☘️ Jangan hidup di masa lalu, mereka hanya kenangan. Masa depanlah tempat impianmu.",
 "☘️ Sahabat sejati menangis saat kamu pergi, sahabat palsu pergi saat kamu menangis.",
 "☘️ Cintai apa adanya. Dunia ini tak ada yang abadi.",
 "☘️ Jika tak mampu membahagiakan orang lain, jangan menambah dukanya.",
 "☘️ Rasa takut sering kali tidak beralasan.",
 "☘️ Kehadiranmu membuatku merasa sempurna.",
 "☘️ Cinta yang dekat dan mesra bisa hambar setelah menikah, maka berhati-hatilah pada cinta yang terpisah jarak.",
 "☘️ Kesuksesan terbesar adalah mampu bangkit dari kegagalan.",
 "☘️ Sahabat akan datang ketika dunia menjauh.",
 "☘️ Saat pesimis, bayangkan euforia keberhasilan yang akan kamu raih.",
 "☘️ Cinta itu aneh. Kamu benci dia, tapi saat dia bilang 'I love you', hatimu bilang 'Me too'.",
 "☘️ Hidup bukan mencari yang terbaik, tapi menerima bahwa kamu adalah kamu.",
 "☘️ Jika teman hanya ada saat bahagia, sahabat ada di segala suasana.",
 "☘️ Cintailah seseorang apa adanya, bukan karena ingin dia jadi seperti kemauanmu.",
 "☘️ Untuk bahagia, jangan hanya cari hal yang membahagiakan. Temukan yang menyedihkan dan hentikan.",
 "☘️ Persahabatan adalah ikatan yang tak mudah putus.",
 "☘️ Hidup selalu punya dua sisi. Kamu memilih mau lihat sisi terang atau gelapnya.",
 "☘️ Seseorang bisa membuatmu tersenyum hanya dengan membayangkannya.",
 "☘️ Yang penting bukan apa yang kamu tahu, tapi apa yang mau kamu pelajari.",
 "☘️ Mencintai karena agama dan kebaikan akan membawa kebahagiaan.",
 "☘️ Jadi diri sendiri agar cinta yang datang tidak salah orang.",
 "☘️ Sikap hidup menentukan bagaimana hidup memperlakukan kita.",
 "☘️ Saat kamu memilih satu cinta, pasti ada hati lain yang menangis.",
 "☘️ Tantangannya bukan mengatur waktu, tapi mengatur diri sendiri.",
 "☘️ Tuhan tidak mengambil sesuatu tanpa menyiapkan penggantinya.",
 "☘️ Aku manusia biasa, tapi kehadiranmu membuat segalanya berbeda.",
 "☘️ Kamu takkan kehilangan orang yang kamu cintai jika kamu siap jadi sahabatnya meski hubungan sudah berakhir.",
 "☘️ Aku tak ingin persahabatan kita hancur hanya karena cinta.",
 "☘️ Sahabat ibarat mata dan tangan: mata menangis, tangan mengusap.",
 "☘️ Tidak peduli berapa banyak hubunganmu, ujungnya semua akan merasa sendiri.",
 "☘️ Mencintai karena paras akan membuatmu cepat bosan.",
 "☘️ Emosi tak membawa pada tindakan positif. Tenangkan dirimu.",
 "☘️ Kamu tidak pantas menangis karena pengkhianat.",
 "☘️ Kata bijak memang sulit dijalani, tapi bisa jadi pedoman hidup.",
 "☘️ Hiduplah seakan hari ini terakhir. Belajarlah seakan hidup selamanya.",
 "☘️ Tidak ada yang lebih indah dari kasih sahabat yang selalu ada.",
 "☘️ Kesederhanaan adalah pengalaman paling berharga.",
 "☘️ Jangan yakinkan diri bahwa dia suka kamu hanya karena dia bersikap manis. Kadang kamu hanya pelarian."
    ];

    const random = quotes[Math.floor(Math.random() * quotes.length)];

    reply(`📜 *Kata Bijak Random:*\n${random}`);
}