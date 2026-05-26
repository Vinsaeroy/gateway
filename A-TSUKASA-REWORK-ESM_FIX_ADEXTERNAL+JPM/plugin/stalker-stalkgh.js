import axios from "axios";

export const command = ["ghstalk"];

export default async function handler(m, ctx) {
    const { riz, id, args, reply, qriz } = ctx;

    try {
        if (!args[0]) {
            return reply(
                "❌ Masukkan username GitHub!\n\nContoh:\n.ghstalk torvalds"
            );
        }

        const username = args[0].trim();

        const res = await axios.get(
            `https://manzxy.my.id/stalker/github?username=${encodeURIComponent(
                username
            )}`,
            {
                timeout: 15000
            }
        );

        const data = res.data;

        if (!data?.success || !data?.result) {
            return reply("❌ User GitHub tidak ditemukan.");
        }

        const u = data.result;

        const teks = `
🐙 *GITHUB STALKER*

👤 Username : ${u.username}
📛 Nama     : ${u.nickname || "-"}
📝 Bio      : ${u.bio || "-"}
🏢 Company  : ${u.company || "-"}
🌍 Lokasi   : ${u.location || "-"}
🔗 Blog     : ${u.blog || "-"}
📂 Repo     : ${u.public_repo}
📄 Gists    : ${u.public_gists}
👥 Followers: ${u.followers}
➡️ Following: ${u.following}
🕒 Dibuat   : ${new Date(u.created_at).toLocaleString("id-ID")}
🔄 Update   : ${new Date(u.updated_at).toLocaleString("id-ID")}

🔗 ${u.url}
`.trim();

        await riz.sendMessage(
            id,
            {
                image: {
                    url:
                        u.profile_pic ||
                        "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                },
                caption: teks
            },
            { quoted: qriz }
        );
    } catch (err) {
        console.error("GHSTALK ERROR:", err);
        reply("❌ Gagal mengambil data GitHub.");
    }
}