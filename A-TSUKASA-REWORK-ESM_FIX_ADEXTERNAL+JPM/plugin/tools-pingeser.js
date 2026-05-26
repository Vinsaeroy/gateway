import axios from "axios";
import https from "https";
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  jidNormalizedUser,
} from "baileys";

export const command = ["pinterestgeser", "pingeser"];

export default async function (msg, { riz, id, q, reactm, reply }) {
  if (!q)
    return reply(
      "Masukkan kata kunci pencarian!\nContoh: .pingeser cat aesthetic"
    );

  try {
    await reactm("🔍");

    const links = await pint(q, 10);

    if (!Array.isArray(links) || links.length === 0) {
      await reactm("❌");
      return reply("Gambar tidak ditemukan di Pinterest!");
    }

    const top = links.slice(0, 5);
    const cards = [];

    for (const imgUrl of top) {
      if (!imgUrl) continue;

      const media = await prepareWAMessageMedia(
        { image: { url: imgUrl } },
        { upload: riz.waUploadToServer }
      );

      cards.push({
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `🔎 ${q}`,
          hasMediaAttachment: true,
          ...media,
        }),
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: "Klik tombol di bawah untuk membuka gambar",
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: "Pinterest Search (i.pinimg.com)",
        }),
        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "🖼️ Buka Gambar",
                  url: imgUrl,
                }),
              },
            ],
          }),
      });
    }

    if (cards.length === 0) {
      await reactm("❌");
      return reply("Gagal ambil gambar (Link header kosong / media gagal).");
    }

    const out = generateWAMessageFromContent(
      id,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            businessMessageForwardInfo: {
              businessOwnerJid: jidNormalizedUser(riz.user.id),
            },
            forwardingScore: 256,
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `🔎 *Hasil pencarian untuk:* ${q}`,
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "Pinterest Search",
              }),
              carouselMessage:
                proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                  cards,
                }),
            }),
          },
        },
      },
      { userJid: id, quoted: msg }
    );

    await riz.relayMessage(id, out.message, { messageId: out.key.id });
    await reactm("✅");
  } catch (e) {
    console.error("PinterestGeser Error:", e?.response?.data || e?.message || e);
    await reactm("❌");
    return reply("Terjadi kesalahan! Coba lagi nanti.");
  }
}

async function pint(query, limit = 10) {
  const dataObj = { options: { query } };

  const url =
    "https://www.pinterest.com/resource/BaseSearchResource/get/?data=" +
    encodeURIComponent(JSON.stringify(dataObj));

  const agent = new https.Agent({ keepAlive: true });

  const res = await axios.request({
    method: "HEAD",
    url,
    httpsAgent: agent,
    maxRedirects: 5,
    headers: {
      "screen-dpr": "4",
      "x-pinterest-pws-handler": "www/search/[scope].js",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
    },
    validateStatus: (s) => s >= 200 && s < 400,
  });

  const rhl = res.headers?.link;
  if (!rhl) throw new Error(`hasil pencarian "${query}" kosong`);

  const allLinks = [...rhl.matchAll(/<(.*?)>/gm)].map((v) => v[1]);

  const pinimgLinks = allLinks
    .filter((u) => typeof u === "string" && u.includes("i.pinimg.com"))
    .slice(0, limit);

  if (pinimgLinks.length === 0)
    throw new Error(`ga nemu link i.pinimg.com buat query "${query}"`);

  return pinimgLinks;
}