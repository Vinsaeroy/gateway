process.on("warning", e => {
    if (e.name === "MaxListenersExceededWarning") return
    console.warn(e)
});

import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    makeInMemoryStore,
    fetchLatestWaWebVersion,
    Browsers
} from "baileys";
import pino from "pino";
import chalk from "chalk";
import readline from "readline";
import fs from "fs";
import path from "path";
import { Boom } from "@hapi/boom";
import "./config.js";
import handler from "./case.js";
import { createWelcomeCanvas, createGoodbyeCanvas } from "./lib/welgod.js";
import { serialize } from "./lib/m.js";
import { initDB, stores } from "./database/index.js"

// Pairing
const usePairingCode = true;
const customPair = global.pair;
const useCustomPair = true;

// ====== Fungsi input terminal ======
async function question(promt) {
    process.stdout.write(promt);
    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve =>
        r1.question("", ans => {
            r1.close();
            resolve(ans);
        })
    );
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./AuthSesi");

    const { version } = await fetchLatestWaWebVersion();
    console.log(`🚀 Bot jalan pake WhatsApp Versi ${version.join(".")}`);

    const riz = makeWASocket({
        logger: pino({
            level: "silent"
        }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: Browsers.ubuntu("Firefox"),
        version,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        markOnlineOnConnect: false,
        keepAliveIntervalMs: 25_000
    });

    if (usePairingCode && !riz.authState.creds.registered) {
        try {
            const phoneNumber = await question(
                "📞 Masukin nomor onii-chan~ (jangan lupa pake 62 di depannya ✨)"
            );

            if (useCustomPair) {
                if (customPair.length !== 8) {
                    console.log(chalk.red("❌ Custom pair harus 8 karakter!"));
                    process.exit(1);
                }

                const code = await riz.requestPairingCode(
                    phoneNumber.trim(),
                    customPair
                );
                console.log(
                    chalk.cyan(
                        `🌸 Yatta~ waktunya pairing, onii-chan~ 🔗 Code: ${code}`
                    )
                );
            } else {
                const code = await riz.requestPairingCode(phoneNumber.trim());
                console.log(
                    chalk.cyan(
                        `🌸 Yatta~ waktunya pairing, onii-chan~ 🔗 Code: ${code}`
                    )
                );
            }
        } catch (err) {
            console.error("Failed to get pairing code:", err);
        }
    }

    riz.ev.on("creds.update", saveCreds);

    riz.ev.on("connection.update", update => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

            if (reason === DisconnectReason.badSession) {
                console.log(
                    chalk.red(
                        "❌ Ehh~ sesi bermasalah onii-chan! Hapus folder sesi terus coba lagi ya~ 🌸"
                    )
                );
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log(
                    chalk.yellow(
                        "🔌 Koneksi tertutup... Tsukasa coba sambungin lagi yaa~ ✨"
                    )
                );
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log(
                    chalk.yellow(
                        "📡 Aduu~ koneksi ke server hilang, sabar ya onii-chan Tsukasa sambungin ulang 💕"
                    )
                );
                connectToWhatsApp();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log(
                    chalk.red(
                        "🔄 Hyaa~ sesi dipakai di tempat lain... Tsukasa pamit dulu 😢"
                    )
                );
                process.exit();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(
                    chalk.red(
                        "🚪 Logged out... hapus sesi terus scan ulang ya onii-chan~ 🌸"
                    )
                );
                process.exit();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log(
                    chalk.yellow(
                        "♻️ Tsukasa butuh restart, tunggu sebentar yaa ✨"
                    )
                );
                connectToWhatsApp();
            } else if (reason === DisconnectReason.timedOut) {
                console.log(
                    chalk.yellow(
                        "⏳ Ehh timeout... coba reconnect lagi ya onii-chan 🌸"
                    )
                );
                connectToWhatsApp();
            } else {
                console.log(
                    chalk.yellow(
                        `❓ Wahh ada disconnect aneh: ${reason}, Tsukasa coba sambungin lagi~`
                    )
                );
                connectToWhatsApp();
            }
        } else if (connection === "open") {
            console.log(
                chalk.green(
                    "✔🌸 Yatta~ Tsukasa berhasil terhubung ke WhatsApp! ✨"
                )
            );
            riz.newsletterFollow("120363402305551203@newsletter");
            riz.newsletterFollow("120363422490096849@newsletter");
            riz.newsletterFollow("120363404335463096@newsletter");
            riz.newsletterFollow("120363403189453946@newsletter");
            riz.newsletterFollow("120363422914134986@newsletter");
        }
    });
    
riz.ev.on("group-participants.update", async (anu) => {
  try {
    const db = stores.welcomer.get()
    const groupData = db[anu.id] || {}

    const metadata = await riz.groupMetadata(anu.id)
    const groupName = metadata.subject

    for (let user of anu.participants) {
      const username = user.split("@")[0]

      const ppUser = await riz.profilePictureUrl(user, "image")
        .catch(() => "https://i.pinimg.com/originals/29/0f/f4/290ff47027c529ee3ff4aaf7d4075bea.jpg")

      // =========================
      // WELCOME
      // =========================
      if (anu.action === "add" && groupData.welcome) {

        const textTemplate =
          groupData.welcomeText ||
          "Halo @user, selamat datang di @group!"

        const finalText = textTemplate
          .replace(/@user/g, `@${username}`)
          .replace(/@group/g, groupName)

        const buffer = await createWelcomeCanvas(
          username,
          groupName,
          ppUser
        )

        await riz.sendMessage(anu.id, {
          image: buffer,
          caption: finalText,
          mentions: [user]
        })
      }

      // =========================
      // LEAVE
      // =========================
      if (anu.action === "remove" && groupData.leave) {

        const textTemplate =
          groupData.leaveText ||
          "Bye @user, semoga tenang di luar @group 😔"

        const finalText = textTemplate
          .replace(/@user/g, `@${username}`)
          .replace(/@group/g, groupName)

        const buffer = await createGoodbyeCanvas(
          username,
          groupName,
          ppUser
        )

        await riz.sendMessage(anu.id, {
          image: buffer,
          caption: finalText,
          mentions: [user]
        })
      }
    }
  } catch (err) {
    console.error("Error welcome/leave:", err)
  }
})

    // ========== AUTO SEWA CHECK ==========
    const sewaPath = "./database/sewa.json";
    let sewaDb = JSON.parse(fs.readFileSync(sewaPath, "utf8"));
    const saveSewa = () =>
        fs.writeFileSync(sewaPath, JSON.stringify(sewaDb, null, 2));

    setInterval(async () => {
        const now = Date.now();

        for (const group in sewaDb) {
            if (now > sewaDb[group].expired) {
                try {
                    await riz.sendMessage(group, {
                        text: `⏳ *Waktu sewa habis!*
Bot akan keluar sekarang.
Terima kasih sudah menyewa.`
                    });

                    riz.groupLeave(group);

                    const owner = sewaDb[group].owner + "@s.whatsapp.net";
                    await riz.sendMessage(owner, {
                        text: `Sewa untuk grup ${group} sudah berakhir dan bot telah keluar.`
                    });

                    delete sewaDb[group];
                    saveSewa();
                } catch (e) {
                    console.log("AUTO SEWA ERROR:", e);
                }
            }
        }
    }, 300000); // cek tiap 5 menit
    

    // ====== Handler lempar ke case.js ======
    riz.ev.on("messages.upsert", async m => {
  try {
    serialize(m)
    await handler(riz, m);
  } catch (err) {
    console.error("🌸 Hyaa~ ada error pas proses pesan, onii-chan:", err);
  }
});
}

connectToWhatsApp();
