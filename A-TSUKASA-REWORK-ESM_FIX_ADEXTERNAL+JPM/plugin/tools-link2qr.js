import QRCode from "qrcode";

export const command = ["link2qr", "qr", "toqr"];

export default async (msg, { reply, riz, id, q, m }) => {
  try {
    if (m?.Xp) await m.Xp();

    const quotedText =
      msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
      msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
      "";

    const text = (q && q.trim()) || (quotedText && quotedText.trim());

    if (!text) {
      if (m?.Xg) await m.Xg();
      return reply("Contoh:\n.link2qr https://google.com\n\nAtau reply teksnya lalu ketik:\n.link2qr");
    }

    const png = await QRCode.toBuffer(text, {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 10,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    await riz.sendMessage(
      id,
      {
        image: png,
        caption: `✅ QR berhasil dibuat\n\nIsi:\n${text}`,
      },
      { quoted: msg }
    );

    if (m?.Xd) await m.Xd();
  } catch (e) {
    console.error("link2qr error:", e);
    if (m?.Xg) await m.Xg();
    return reply("❌ Gagal bikin QR. Coba lagi ya.");
  }
};