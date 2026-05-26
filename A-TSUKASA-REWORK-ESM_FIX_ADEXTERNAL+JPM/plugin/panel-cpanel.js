import "../config.js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import moment from "moment-timezone";

export const command = [
  "1gb",
  "2gb",
  "3gb",
  "4gb",
  "5gb",
  "6gb",
  "7gb",
  "8gb",
  "9gb",
  "10gb",
  "unlimited",
  "unli",
];

const panelsFile = path.resolve("./data/panels.json");

function ensureDataDir() {
  const dir = path.dirname(panelsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadPanels() {
  try {
    ensureDataDir();
    if (!fs.existsSync(panelsFile)) return [];
    const raw = fs.readFileSync(panelsFile, "utf8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePanels(panels) {
  ensureDataDir();
  fs.writeFileSync(panelsFile, JSON.stringify(panels, null, 2));
}

async function deleteServerById(serverId) {
  try {
    const res = await fetch(
      `${global.domain}/api/application/servers/${serverId}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${global.apikey}`,
        },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function sizeSpec(cmd) {
  const sizeMap = {
    "1gb": { ram: "1000", disk: "1000", cpu: "40" },
    "2gb": { ram: "2000", disk: "2000", cpu: "80" },
    "3gb": { ram: "3000", disk: "3000", cpu: "100" },
    "4gb": { ram: "4000", disk: "4000", cpu: "120" },
    "5gb": { ram: "5000", disk: "5000", cpu: "145" },
    "6gb": { ram: "6000", disk: "6000", cpu: "160" },
    "7gb": { ram: "7000", disk: "7000", cpu: "175" },
    "8gb": { ram: "8000", disk: "8000", cpu: "190" },
    "9gb": { ram: "9000", disk: "9000", cpu: "225" },
    "10gb": { ram: "10000", disk: "10000", cpu: "260" },
    unlimited: { ram: "0", disk: "0", cpu: "0" },
    unli: { ram: "0", disk: "0", cpu: "0" },
  };
  return sizeMap[cmd] || sizeMap.unlimited;
}

function fmtSpec(ram, disk, cpu) {
  return {
    ram: ram === "0" ? "Unlimited" : `${Number(ram) / 1000}GB`,
    disk: disk === "0" ? "Unlimited" : `${Number(disk) / 1000}GB`,
    cpu: cpu === "0" ? "Unlimited" : `${cpu}%`,
  };
}

export default async function run(_msg, ctx) {
  const { riz, id, sender, isOwner, reply, command: cmd, q, qriz } = ctx;

  if (!isOwner) return reply(global.mess?.owner || "Khusus owner.");
  if (!global.domain?.startsWith("http"))
    return reply("❌ global.domain belum bener (wajib ada https://)");
  if (!global.apikey) return reply("❌ global.apikey masih kosong.");
  if (!global.nestid || !global.egg || !global.loc)
    return reply("❌ global.nestid / global.egg / global.loc belum di-set.");

  const gcExpiredPanels = async () => {
    const panels = loadPanels();
    if (!panels.length) return;

    const now = Date.now();
    let changed = false;
    const remaining = [];

    for (const p of panels) {
      const exp = new Date(p.expireAt).getTime();
      if (Number.isNaN(exp)) continue;

      if (exp <= now) {
        const ok = await deleteServerById(p.id);
        if (!ok) remaining.push(p);
        else changed = true;
      } else {
        remaining.push(p);
      }
    }

    if (changed) savePanels(remaining);
  };

  if (!global._panels_gc_started) {
    global._panels_gc_started = true;
    gcExpiredPanels().catch(() => {});
    setInterval(() => gcExpiredPanels().catch(() => {}), 1000 * 60 * 30);
  }

  if (!q) return reply("Contoh: .1gb username");

  const username = q.trim().toLowerCase();
  const email = `${username}727@buyer.riz`;
  const r3d = Math.floor(100 + Math.random() * 900);
  const name = username;
  const password = `${username}${r3d}`;

  const { ram, disk, cpu } = sizeSpec(cmd);

  const uRes = await fetch(`${global.domain}/api/application/users`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${global.apikey}`,
    },
    body: JSON.stringify({
      email,
      username,
      first_name: name,
      last_name: "Server",
      language: "en",
      password,
    }),
  });

  const uData = await uRes.json().catch(() => ({}));
  if (!uRes.ok || uData?.errors) {
    const err = uData?.errors?.[0] || uData;
    return reply(`❌ Gagal buat user:\n${JSON.stringify(err, null, 2)}`);
  }

  const user = uData.attributes;

  const eggRes = await fetch(
    `${global.domain}/api/application/nests/${global.nestid}/eggs/${global.egg}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${global.apikey}`,
      },
    }
  );

  const eggData = await eggRes.json().catch(() => ({}));
  if (!eggRes.ok || eggData?.errors) {
    const err = eggData?.errors?.[0] || eggData;
    return reply(`❌ Gagal ambil egg:\n${JSON.stringify(err, null, 2)}`);
  }

  const startup_cmd = eggData.attributes.startup;

  const sRes = await fetch(`${global.domain}/api/application/servers`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${global.apikey}`,
    },
    body: JSON.stringify({
      name,
      description: "Cpanel By Tsukasa",
      user: user.id,
      egg: parseInt(global.egg, 10),
      docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
      startup: startup_cmd,
      environment: {
        INST: "npm",
        USER_UPLOAD: "0",
        AUTO_UPDATE: "0",
        CMD_RUN: "npm start",
      },
      limits: { memory: ram, swap: 0, disk, io: 500, cpu },
      feature_limits: { databases: 5, backups: 5, allocations: 5 },
      deploy: {
        locations: [parseInt(global.loc, 10)],
        dedicated_ip: false,
        port_range: [],
      },
    }),
  });

  const sData = await sRes.json().catch(() => ({}));
  if (!sRes.ok || sData?.errors) {
    const err = sData?.errors?.[0] || sData;
    return reply(`❌ Gagal buat server:\n${JSON.stringify(err, null, 2)}`);
  }

  const server = sData.attributes;

  const expireAt = moment().tz("Asia/Jakarta").add(30, "days").toISOString();
  const panels = loadPanels();
  panels.push({ id: server.id, username: user.username, expireAt });
  savePanels(panels);

  const specText = fmtSpec(ram, disk, cpu);
  const expireFmt = moment(expireAt)
    .tz("Asia/Jakarta")
    .format("DD/MM/YYYY HH:mm:ss");

  const panelURL =
    global.panelURL ||
    "https://p1-image.cdn-aihelp.net/FileService/UserFile/0/202509/20250929224238853b74d6da3d9.jpg";

  const caption = `*Berikut Detail Akun Panel Kamu 📦*

*📡 ID Server (${server.id})*
*👤 Username :* ${user.username}
*🔐 Password :* ${password}
*⏳ Expire :* ${expireFmt}

*🌐 Spesifikasi Server*
* Ram :* ${specText.ram}
* Disk :* ${specText.disk}
* CPU :* ${specText.cpu}
* Panel :* ${global.domain}`;

  await riz.sendMessage(
    id,
    {
      image: { url: panelURL },
      caption,
      footer: `${global.footer || ""}`,
      contextInfo: {
        forwardingScore: 3,
        isForwarded: true,
        mentionedJid: [sender],
        forwardedNewsletterMessageInfo: {
          newsletterName: `${global.namach || ""}`,
          newsletterJid: `${global.idch || ""}`,
        },
      },
    },
    { quoted: qriz }
  );
}