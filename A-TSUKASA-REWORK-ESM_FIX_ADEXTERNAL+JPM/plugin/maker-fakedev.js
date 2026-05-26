import fetch from "node-fetch";
import FormData from "form-data";

export const command = ["fakedev", "fakedev1", "fakedev2", "fakedev3"];

export default async function fakedevPlugin(msg, ctx) {
  const {
    riz,
    id,
    m,
    q,
    command,
    reply,
    reactm,
  } = ctx;

  try {
    if (command === "fakedev") {
      return reply(`*FAKE DEV GENERATOR*

Pilih salah satu:

.fakedev1 <nama> <true/false>
.fakedev2 <nama>
.fakedev3 <nama> <true/false>

Sambil reply gambar.`);
    }

    if (!q) {
      if (command === "fakedev1") {
        return reply(`*Contoh penggunaan fakedev1:*

*Reply gambar:*
.fakedev1 Nama true
.fakedev1 Nama false`);
      }

      if (command === "fakedev2") {
        return reply(`*Contoh penggunaan fakedev2:*

*Reply gambar:*
.fakedev2 Nama`);
      }

      if (command === "fakedev3") {
        return reply(`*Contoh penggunaan fakedev3:*

*Reply gambar:*
.fakedev3 Nama true
.fakedev3 Nama false`);
      }
    }

    await reactm("⏳");

    const args = q.trim().split(/\s+/);
    const name = args[0];
    let verified = "false";
    let imageUrl = null;

    if (!name) {
      return reply("❌ Nama belum diisi.");
    }

    if (command === "fakedev1" || command === "fakedev3") {
      verified = (args[1] || "").toLowerCase();

      if (!["true", "false"].includes(verified)) {
        return reply("*Parameter verified wajib true / false.* 🍂");
      }

      imageUrl = args[2] || null;
    } else {
      imageUrl = args[1] || null;
    }

    if (!imageUrl) {
      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;

      const mediaType = quoted
        ? Object.keys(quoted).find((type) => type === "imageMessage")
        : null;

      if (!mediaType) {
        return reply("*Kirim/reply gambar atau sertakan URL gambar.* 🍂");
      }

      const { downloadContentFromMessage } = await import("baileys");
      const stream = await downloadContentFromMessage(quoted[mediaType], "image");

      let bufferUpload = Buffer.from([]);
      for await (const chunk of stream) {
        bufferUpload = Buffer.concat([bufferUpload, chunk]);
      }

      if (!bufferUpload.length) {
        return reply("*Gagal membaca gambar.* 🍂");
      }

      const form = new FormData();
      form.append("files[]", bufferUpload, {
        filename: "image.jpg",
        contentType: "image/jpeg",
      });

      const upload = await fetch("https://uguu.se/upload.php", {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      });

      const upRes = await upload.json().catch(() => null);

      if (!upRes?.files?.[0]?.url) {
        return reply("*Gagal mengupload gambar.* 🍂");
      }

      imageUrl = upRes.files[0].url;
    }

    let apiUrl = "";

    if (command === "fakedev1") {
      apiUrl = `https://kayzzidgf.my.id/api/maker/fakedev?text=${encodeURIComponent(
        name
      )}&image=${encodeURIComponent(imageUrl)}&verified=${verified}&apikey=FreeLimit`;
    } else if (command === "fakedev3") {
      apiUrl = `https://kayzzidgf.my.id/api/maker/fakedev3?text=${encodeURIComponent(
        name
      )}&image=${encodeURIComponent(imageUrl)}&verified=${verified}&apikey=FreeLimit`;
    } else {
      apiUrl = `https://kayzzidgf.my.id/api/maker/fakedev2?url=${encodeURIComponent(
        imageUrl
      )}&text=${encodeURIComponent(name)}&apikey=FreeLimit`;
    }

    const res = await fetch(apiUrl);

    if (!res.ok) {
      return reply("*Gagal mengambil hasil dari server.* 🍂");
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    await riz.sendMessage(
      id,
      { image: buffer, caption: `Done: ${command}` },
      { quoted: msg }
    );

    await reactm("✅");
  } catch (e) {
    console.error("FAKEDEV PLUGIN ERROR:", e);
    await reactm("❌");
    return reply("*Terjadi kesalahan saat memproses permintaan.* 🍂");
  }
}