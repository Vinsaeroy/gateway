export const command = ["pantun"];

export default async function (m, { reply }) {

  const data = [
    { "pantun": "Dua tiga anak berenang, yang penting kita senang." },
    { "pantun": "Dua tiga sampan berlabuh, jangan kalian suka mengeluh." },
    { "pantun": "Dua tiga katak dikurung, janganlah kamu murung." },
    { "pantun": "Dua tiga kata dikurung, kenapa kamu terlihat murung?" },
    { "pantun": "Dua tiga kena duri, jangan suka simpan iri." },
    { "pantun": "Dua tiga gunting kuku, jangan lupa baca buku." },
    { "pantun": "Dua tiga rasanya dahsyat, carilah ilmu sepanjang hayat." },
    { "pantun": "Dua tiga kaki dibilas, jadi murid yang tak malas." },
    { "pantun": "Dua tiga kura-kura, Jarjit Singh sang juara." },
    { "pantun": "Dua tiga anak berenang, jangan lupa senang-senang." },
    { "pantun": "Dua tiga kucing berlari, bawa putri Mei-Mei kemari." },
    { "pantun": "Dua tiga bunga melati, jadi anak yang berbakti." },
    { "pantun": "Dua tiga bunga raya, kamu bukan kawan saya." },
    { "pantun": "Dua tiga Superman beraksi, saat bermain jangan emosi." },
    { "pantun": "Dua tiga semua senang, boleh kasih saya menang." },
    { "pantun": "Dua tiga kaki beralas, belajar dengan keras." },
    { "pantun": "Dua tiga kucing saleh, tak boleh." },
    { "pantun": "Dua tiga nada irama, mari belajar bersama-sama." },
    { "pantun": "Dua tiga pergi berlayar, pandai hutang tak pandai bayar." },
    { "pantun": "Dua tiga Bang Jin berkaca, rajinlah berdoa dan membaca." },
    { "pantun": "Dua tiga lampu merah, jangan mudah marah." },
    { "pantun": "Dua tiga kucing saleh, kalau tidak ya tidak boleh." },
    { "pantun": "Dua tiga pohon kelapa, jadi orang jangan keras kepala." },
    { "pantun": "Dua tiga kambing saling kejar, jadi anak yang rajin belajar." },
    { "pantun": "Dua tiga kereta gerbong, jadi anak jangan sombong." },
    { "pantun": "Dua tiga kambing menari, ibu marah, saya coba lari." },
    { "pantun": "Dua tiga pergi ke setu, jangan pergi ke situ." },
    { "pantun": "Dua tiga kura-kura, air kelapa sedap juga." },
    { "pantun": "Dua tiga bulutangkis, sudah kalah jangan nangis." },
    { "pantun": "Dua tiga empat lanun, mari cari harta karun." },
    { "pantun": "Dua tiga anak menari, saya tidak mengerti." },
    { "pantun": "Dua tiga makan hati, jadi orang rendah hati." },
    { "pantun": "Dua tiga kucing berlari, dua singgit mana nak cari." },
    { "pantun": "Dua tiga kura-kura, sudah baca tapi lupa." },
    { "pantun": "Dua tiga pohon pinang, hari ini hati kurang senang." },
    { "pantun": "Dua tiga burung kenari, apa hajat tuan hamba kemari?" },
    { "pantun": "Dua tiga warna merah, kak Ros sudah marah." },
    { "pantun": "Dua tiga jambu batu, nanti muka jerawat batu." },
    { "pantun": "Dua tiga kura-kura, jangan jadi orang yang suka pura-pura." },
    { "pantun": "Dua tiga kucing berlari, makan nasi pakai teri enak sekali." },
    { "pantun": "Dua tiga jalan mati, saya sangat susah hati." },
    { "pantun": "Dua tiga kapal terbang, lanun mana yang paling garang." },
    { "pantun": "Dua tiga kura-kura, apa itu sahabat pena?" },
    { "pantun": "Dua tiga biji bola, jangan balik lagi lah." },
    { "pantun": "Dua tiga ular sawa, besoklah saya bawa." },
    { "pantun": "Dua tiga kura-kura, ini laba-laba banyak gaya." },
    { "pantun": "Dua tiga jambu batu, jangan banyak ragu-ragu." },
    { "pantun": "Dua tiga burung kenari, punya pantun silakan kemari." },
    { "pantun": "Dua tiga mau seberang, nanti raya saya datang." },
    { "pantun": "Dua tiga kupu-kupu, lembu sapi bunyi buu...bu...buu..." }
  ];

  const pick = data[Math.floor(Math.random() * data.length)];

  reply(`🎭 *Pantun Random*\n\n${pick.pantun}`);
}