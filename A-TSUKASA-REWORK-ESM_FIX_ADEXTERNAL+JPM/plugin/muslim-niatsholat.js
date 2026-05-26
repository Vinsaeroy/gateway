export const command = ["niatsholat", "niatshalat"];

global.niatsolat = {
    result: {
        data: [
            {
                index: "1",
                niat: "Niat Sholat Subuh",
                arabic: "اُصَلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
                latin: "Ushalli fardhosh shubhi rok'ataini mustaqbilal qiblati adaa-an lillaahi ta'aala",
                translation_id:
                    "Aku berniat shalat fardhu Shubuh dua raka'at menghadap kiblat karena Allah Ta'ala"
            },
            {
                index: "2",
                niat: "Niat Sholat Dzuhur",
                arabic: "اُصَلِّى فَرْضَ الظُّهْرِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
                latin: "Ushalli fardhodl dhuhri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
                translation_id:
                    "Aku berniat shalat fardhu Dzuhur empat raka'at menghadap kiblat karena Allah Ta'ala"
            },
            {
                index: "3",
                niat: "Niat Sholat Ashar",
                arabic: "اُصَلِّى فَرْضَ الْعَصْرِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
                latin: "Ushalli fardhol 'ashri arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
                translation_id:
                    "Aku berniat shalat fardhu Ashar empat raka'at menghadap kiblat karena Allah Ta'ala"
            },
            {
                index: "4",
                niat: "Niat Sholat Maghrib",
                arabic: "اُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
                latin: "Ushalli fardhol maghribi tsalaata raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
                translation_id:
                    "Aku berniat shalat fardhu Maghrib tiga raka'at menghadap kiblat karena Allah Ta'ala"
            },
            {
                index: "5",
                niat: "Niat Sholat Isya",
                arabic: "اُصَلِّى فَرْضَ الْعِشَاءِ اَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ اَدَاءً ِللهِ تَعَالَى",
                latin: "Ushalli fardhol 'isyaa-i arba'a raka'aatim mustaqbilal qiblati adaa-an lillaahi ta'aala",
                translation_id:
                    "Aku berniat shalat fardhu Isya empat raka'at menghadap kiblat karena Allah Ta'ala"
            }
        ]
    }
};

export default async (m, { reply, q }) => {
    const data = global.niatsolat.result.data;

    if (!q) {
        const text = data
            .map(
                (v, i) =>
                    `${i + 1}. *${v.niat}*\n` +
                    `${v.arabic}\n` +
                    `_${v.latin}_\n` +
                    `${v.translation_id}`
            )
            .join("\n\n");

        const penutup =
            `\n\n📖 *Catatan*\n` +
            `Suatu ibadah diterima bila memenuhi dua hal: niat dan mengikuti tuntunan Rasulullah ﷺ.\n\n` +
            `_“Innamal a‘maalu binniyyaat”_ (HR. Bukhari & Muslim)`;

        return reply(`🕌 *NIAT SHOLAT WAJIB*\n\n${text}${penutup}`);
    }

    const key = q.toLowerCase();
    const niat = data.find(v => v.niat.toLowerCase().includes(key));

    if (!niat) {
        return reply(
            "❌ Niat sholat tidak ditemukan.\n\n" +
                "Contoh:\n" +
                ".niatsholat subuh\n" +
                ".niatsholat maghrib"
        );
    }

    reply(
        `🕌 *${niat.niat}*\n\n` +
            `${niat.arabic}\n` +
            `_${niat.latin}_\n\n` +
            `${niat.translation_id}`
    );
};
