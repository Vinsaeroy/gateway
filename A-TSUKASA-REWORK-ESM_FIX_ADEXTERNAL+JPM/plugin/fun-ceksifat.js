export const command = ["plug", "plugin"]

export default async (m, {
  reply, pushname, q, riz, id
}) => {

        const sifat_a = ['Bijak',
          'Sabar',
          'Kreatif',
          'Humoris',
          'Mudah bergaul',
          'Mandiri',
          'Setia',
          'Jujur',
          'Dermawan',
          'Idealis',
          'Adil',
          'Sopan',
          'Tekun',
          'Rajin',
          'Pemaaf',
          'Murah hati',
          'Ceria',
          'Percaya diri',
          'Penyayang',
          'Disiplin',
          'Optimis',
          'Berani',
          'Bersyukur',
          'Bertanggung jawab',
          'Bisa diandalkan',
          'Tenang',
          'Kalem',
          'Logis'];
        const sifat_b = ['Sombong',
          'Minder',
          'Pendendam',
          'Sensitif',
          'Perfeksionis',
          'Caper',
          'Pelit',
          'Egois',
          'Pesimis',
          'Penyendiri',
          'Manipulatif',
          'Labil',
          'Penakut',
          'Vulgar',
          'Tidak setia',
          'Pemalas',
          'Kasar',
          'Rumit',
          'Boros',
          'Keras kepala',
          'Tidak bijak',
          'Pembelot',
          'Serakah',
          'Tamak',
          'Penggosip',
          'Rasis',
          'Ceroboh',
          'Intoleran'];

        const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

        const target = q ? q: pushname;
        const teks = `
        ╭──❍「 *Cek Sifat* 」❍
        │• Nama : *${target}*
        │• Orang yang : *${pickRandom(sifat_a)}*
        │• Kekurangan : *${pickRandom(sifat_b)}*
        │• Keberanian : *${Math.floor(Math.random() * 100)}%*
        │• Kepedulian : *${Math.floor(Math.random() * 100)}%*
        │• Kecemasan : *${Math.floor(Math.random() * 100)}%*
        │• Ketakutan : *${Math.floor(Math.random() * 100)}%*
        │• Akhlak Baik : *${Math.floor(Math.random() * 100)}%*
        │• Akhlak Buruk : *${Math.floor(Math.random() * 100)}%*
        ╰──────❍`;

        await riz.sendMessage(id, {
          text: teks
        }, {
          quoted: qriz
        });

}