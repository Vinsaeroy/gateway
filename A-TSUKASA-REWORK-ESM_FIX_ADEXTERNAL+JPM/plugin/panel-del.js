import "../config.js";
import fetch from "node-fetch";

export const command = ["delserver"];

export default async function run(_msg, ctx) {
  const { isOwner, reply, q } = ctx;

  if (!isOwner) return reply(global.mess?.owner || "Khusus owner.");
  if (!global.domain?.startsWith("http"))
    return reply("❌ global.domain belum bener (wajib ada https://)");
  if (!global.apikey) return reply("❌ global.apikey masih kosong.");
  if (!q) return reply("Contoh: .delserver 123");

  const id = String(q).trim();
  if (!/^\d+$/.test(id)) return reply("❌ ID harus angka. Contoh: .delserver 123");

  try {
    const res = await fetch(`${global.domain}/api/application/servers/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${global.apikey}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = data?.errors?.[0] || data;
      return reply(`❌ Gagal hapus server ${id}:\n${JSON.stringify(err, null, 2)}`);
    }

    return reply(`✅ Berhasil hapus server dengan ID ${id}`);
  } catch (e) {
    return reply(`❌ Error hapus server:\n${String(e?.message || e)}`);
  }
}