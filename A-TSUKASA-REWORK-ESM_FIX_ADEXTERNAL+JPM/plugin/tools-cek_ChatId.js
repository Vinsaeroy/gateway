import "../config.js";

export const command = ["chatid"];

export default async (m, {
  reply, riz, isGroup, id, sender
}) => {
  if (!isGroup) return reply(mess.group);

  const cht = id || m.key.remoteJid


  await riz.sendMessage(id, {
    text: `ChatId:\n${cht}`,
    footer: "ChatId",
    title: 'ChatId',
    interactiveButtons: [{
      name: 'cta_copy',
      buttonParamsJson: JSON.stringify({
        display_text: '📋 Salin ChatId',
        copy_code: cht
      })
    }]
  });
};