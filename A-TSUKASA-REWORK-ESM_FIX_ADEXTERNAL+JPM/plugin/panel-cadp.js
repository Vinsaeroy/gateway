export const command = ["cadp", "cadmin"]
import "../config.js"

export default async (m, {
  reply, pushname, q, riz, id, isOwner
}) => {

  if (!isOwner) return reply(mess.owner);

  const username = (q || "").trim();
  if (!username) {
    return reply(`*Format salah!*\nPenggunaan:\n${prefix + command} username\n\nContoh:\n${prefix + command} example`);
  }

  const r3d = Math.floor(100 + Math.random() * 900);
  const password = username + r3d;

  const f = await fetch(domain + "/api/application/users", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + apikey,
    },
    body: JSON.stringify({
      email: `${username}@Rizz.com`,
      username,
      first_name: username,
      last_name: "Bub",
      language: "en",
      root_admin: true,
      password: password.toString(),
    }),
  });

  const data = await f.json();
  if (data?.errors) return reply(JSON.stringify(data.errors[0], null, 2));

  const user = data.attributes;

  const tks = `
╭─❏   *『 DETAIL AKUN INFO 』*
┣❏ ➤ 👤 *𝘜𝘚𝘌𝘙 𝘐𝘋*: ${user.id}
┣❏ ➤ 📧 *𝘌𝘔𝘈𝘐𝘓*: ${user.first_name} ${user.last_name}
┣❏ ➤ 📛 *𝘜𝘚𝘌𝘙𝘕𝘈𝘔𝘌*: ${user.username}
┣❏ ➤ 🔐 *𝘗𝘈𝘚𝘚𝘞𝘖𝘙𝘋*: ${password}
┣❏ ➤ 🌐 *𝘓𝘖𝘎𝘐𝘕*: ${domain}
┣❏ ➤ 🦸 *𝘈𝘋𝘔𝘐𝘕*: YES
┣❏ ➤ 📆 *𝘊𝘙𝘌𝘈𝘛𝘌𝘋 𝘈𝘛*: ${user.created_at}
┗⬣
`.trim();

  await riz.sendMessage(id, { text: tks });

}