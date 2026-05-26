export const command = ["sc", "script"];

export default async function (msg, { riz, id, qriz }) {
    const teks = `
#WTS
 *Script Tsukasa Bot 🤖*
› *Price:* Rp 28.000

 *Information for users 💬*
- Harga di atas sudah mendapatkan Free update sampai devnya pensi
- Total fitur aktif 250+
- Type caseXplugins (ESM)
- Stabil
- No bad sesions 
- No Enc 100%
- No Hasil rename
- Baileys: npm:wileys
- Support button
- Full pengajaran memasang script

*⭐ Chek Fitur bot*
https://chat.whatsapp.com/KOeWjgYT2ks5sFGD0hbbY8
  `;

    const image = "https://i.ibb.co/Y4sGcMGv/img-1772952976786.jpg";

    await riz.sendMessage(
        id,
        {
            image: { url: image },
            caption: teks,
            footer: "Tsukasa Bot © 2025",
            interactiveButtons: [
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "💬 Chat via Telegram",
                        url: "https://t.me/RizkyoktavianCihuy"
                    })
                },
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "💬 Chat via Whatsapp",
                        url: "https://wa.me/62895417273523?text=Buy+sc+dong"
                    })
                }
            ]
        },
        {
            quoted: msg
        }
    );
}
