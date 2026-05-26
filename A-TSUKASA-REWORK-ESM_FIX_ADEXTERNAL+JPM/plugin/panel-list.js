import "../config.js";
import fetch from "node-fetch";

export const command = ["listserver"];

async function fetchAllServers() {
  const out = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${global.domain}/api/application/servers?per_page=100&page=${page}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${global.apikey}`,
        },
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = data?.errors?.[0] || data;
      throw new Error(JSON.stringify(err));
    }

    const items = Array.isArray(data?.data) ? data.data : [];
    for (const it of items) out.push(it);

    const current = data?.meta?.pagination?.current_page ?? page;
    const total = data?.meta?.pagination?.total_pages ?? current;

    if (current >= total) break;
    page += 1;
  }

  return out;
}

export default async function run(_msg, ctx) {
  const { isOwner, reply } = ctx;

  if (!isOwner) return reply(global.mess?.owner || "Khusus owner.");
  if (!global.domain?.startsWith("http"))
    return reply("❌ global.domain belum bener (wajib ada https://)");
  if (!global.apikey) return reply("❌ global.apikey masih kosong.");

  try {
    const servers = await fetchAllServers();
    if (!servers.length) return reply("Kosong. Belum ada server di panel.");

    const lines = servers.map((s, i) => {
      const a = s.attributes || {};
      const id = a.id ?? "-";
      const name = a.name ?? "-";
      const user = a.user ?? "-";
      const uuid = a.uuid ? String(a.uuid).slice(0, 8) : "-";
      return `${i + 1}. ID: ${id} | ${name} | user:${user} | uuid:${uuid}`;
    });

    const text = `Total server: ${servers.length}\n\n${lines.join("\n")}`;
    return reply(text.length > 65000 ? text.slice(0, 65000) : text);
  } catch (e) {
    return reply(`❌ Gagal ambil list server:\n${String(e?.message || e)}`);
  }
}