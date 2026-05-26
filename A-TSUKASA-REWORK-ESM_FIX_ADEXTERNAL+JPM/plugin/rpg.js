
import fs from 'fs'
import path from 'path'

const RPG_DIR = path.join(process.cwd(), 'database', 'rpg')
if (!fs.existsSync(RPG_DIR)) fs.mkdirSync(RPG_DIR, { recursive: true })

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const f = (num) => (num || 0).toLocaleString('id-ID')

function formatMs(ms) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const parts = []
  if (h) parts.push(`${h} jam`)
  if (m) parts.push(`${m} menit`)
  if (sec && !h) parts.push(`${sec} detik`)
  return parts.join(' ') || 'sebentar'
}

function parseCount(raw, fallback = 1) {
  if (raw === undefined || raw === null || raw === '') return fallback
  if (typeof raw === 'string' && raw.toLowerCase() === 'all') return -1
  const n = Number(raw)
  if (!Number.isFinite(n)) return fallback
  return Math.floor(n)
}

function safeDec(obj, key, val) {
  obj[key] = Math.max(0, (obj[key] || 0) - val)
}
function safeInc(obj, key, val) {
  obj[key] = (obj[key] || 0) + val
}

// =====================
// SHOP
// =====================
const SHOP = {
  potion: { buy: 200, sell: 100, emoji: '🧴', desc: 'Memulihkan 30 HP.' },
  bait: { buy: 50, sell: 20, emoji: '🪱', desc: 'Umpan untuk .memancing (bait).' },
  pickaxe: { buy: 800, sell: 400, emoji: '⛏️', desc: 'Wajib untuk .menambang.' },
  sword: { buy: 600, sell: 300, emoji: '🗡️', desc: 'Bonus kecil .berburu / PVP.' },
  armor: { buy: 700, sell: 350, emoji: '🛡️', desc: 'Mengurangi damage.' },
  rod: { buy: 400, sell: 200, emoji: '🎣', desc: 'Bisa upgrade rod tier.' },
  coffee: { buy: 120, sell: 60, emoji: '☕', desc: 'Pulihkan 2 energi.' },
  bandage: { buy: 150, sell: 70, emoji: '🩹', desc: 'Pulihkan 15 HP.' },
  lockpick: { buy: 1200, sell: 500, emoji: '🗝️', desc: 'Buff 1x chance PVP. Pakai: .use lockpick' },
  fertilizer: { buy: 800, sell: 300, emoji: '🧪', desc: 'Percepat panen 25%. Pakai: .use fertilizer' }
}

// =====================
// FARMING
// =====================
const SEEDS = {
  padi: { price: 5000, xp: 50, time: 3 * 60 * 1000, emoji: '🌾' },
  jagung: { price: 10000, xp: 100, time: 5 * 60 * 1000, emoji: '🌽' },
  durian: { price: 150000, xp: 500, time: 30 * 60 * 1000, emoji: '🍈' },
  emas: { price: 500000, xp: 2000, time: 60 * 60 * 1000, emoji: '🥇' }
}

function seedListText() {
  return Object.entries(SEEDS)
    .map(([name, v]) => `${v.emoji} *${name.toUpperCase()}* — Harga: *${f(v.price)}* | XP: *+${v.xp}* | Waktu: *${formatMs(v.time)}*`)
    .join('\n')
}

// =====================
// MULUNG
// =====================
const TRASH_ITEMS = {
  botol: { emoji: '🍾', label: 'Botol' },
  kaleng: { emoji: '🥫', label: 'Kaleng' },
  kardus: { emoji: '📦', label: 'Kardus' },
  besi: { emoji: '🧲', label: 'Besi' },
  karet: { emoji: '🛞', label: 'Karet' },
  baterai: { emoji: '🔋', label: 'Baterai' }
}

const SCAVENGE_TABLE = [
  { key: 'botol', min: 1, max: 3, weight: 30 },
  { key: 'kaleng', min: 1, max: 3, weight: 26 },
  { key: 'kardus', min: 1, max: 2, weight: 20 },
  { key: 'karet', min: 1, max: 2, weight: 14 },
  { key: 'besi', min: 1, max: 2, weight: 8 },
  { key: 'baterai', min: 1, max: 1, weight: 2 }
]

function pickWeighted(table) {
  const total = table.reduce((a, b) => a + (b.weight || 0), 0)
  let r = Math.random() * total
  for (const it of table) {
    r -= it.weight || 0
    if (r <= 0) return it
  }
  return table[table.length - 1]
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// =====================
// FISH IT
// =====================
const RARITY_META = {
  common: { emoji: '⚪', mul: 1.0 },
  uncommon: { emoji: '🟢', mul: 1.15 },
  rare: { emoji: '🔵', mul: 1.35 },
  epic: { emoji: '🟣', mul: 1.65 },
  legendary: { emoji: '🟠', mul: 2.1 },
  mythic: { emoji: '🔴', mul: 2.8 }
}

const ROD = {
  1: { name: 'Bambu Rod', bonus: 0.0, cost: 0, req: null },
  2: { name: 'Fiber Rod', bonus: 0.06, cost: 15000, req: { botol: 10, kaleng: 8 } },
  3: { name: 'Carbon Rod', bonus: 0.12, cost: 60000, req: { besi: 6, karet: 6 } },
  4: { name: 'Titan Rod', bonus: 0.2, cost: 180000, req: { baterai: 6, besi: 12 } },
  5: { name: 'Myth Rod', bonus: 0.3, cost: 450000, req: { emas: 2, baterai: 10 } }
}

const FISH_POOL = [
  { key: 'ikan_mas', name: 'Ikan Mas', emoji: '🐟', rarity: 'common', weight: 34, min: 1, max: 2, xp: 10 },
  { key: 'ikan_lele', name: 'Lele', emoji: '🐟', rarity: 'common', weight: 34, min: 1, max: 2, xp: 10 },
  { key: 'ikan_nila', name: 'Nila', emoji: '🐟', rarity: 'common', weight: 32, min: 1, max: 2, xp: 11 },
  { key: 'udang', name: 'Udang', emoji: '🦐', rarity: 'common', weight: 26, min: 1, max: 2, xp: 10 },

  { key: 'kakap', name: 'Kakap', emoji: '🐠', rarity: 'uncommon', weight: 18, min: 1, max: 2, xp: 14 },
  { key: 'tuna', name: 'Tuna', emoji: '🐠', rarity: 'uncommon', weight: 16, min: 1, max: 2, xp: 15 },
  { key: 'cumi', name: 'Cumi', emoji: '🦑', rarity: 'uncommon', weight: 14, min: 1, max: 1, xp: 16 },

  { key: 'salmon', name: 'Salmon', emoji: '🐟', rarity: 'rare', weight: 9, min: 1, max: 1, xp: 22 },
  { key: 'lobster', name: 'Lobster', emoji: '🦞', rarity: 'rare', weight: 7, min: 1, max: 1, xp: 24 },
  { key: 'pari', name: 'Ikan Pari', emoji: '🐋', rarity: 'rare', weight: 6, min: 1, max: 1, xp: 26 },

  { key: 'hiu', name: 'Hiu', emoji: '🦈', rarity: 'epic', weight: 3.6, min: 1, max: 1, xp: 38 },
  { key: 'swordfish', name: 'Swordfish', emoji: '🐬', rarity: 'epic', weight: 3.0, min: 1, max: 1, xp: 40 },
  { key: 'gurita_raksasa', name: 'Gurita Raksasa', emoji: '🐙', rarity: 'epic', weight: 2.4, min: 1, max: 1, xp: 44 },

  { key: 'paus_biru', name: 'Paus Biru', emoji: '🐳', rarity: 'legendary', weight: 1.2, min: 1, max: 1, xp: 80 },
  { key: 'naga_laut', name: 'Naga Laut', emoji: '🐉', rarity: 'legendary', weight: 0.9, min: 1, max: 1, xp: 92 },

  { key: 'megalodon', name: 'Megalodon', emoji: '🦈', rarity: 'mythic', weight: 0.35, min: 1, max: 1, xp: 150 },
  { key: 'leviathan', name: 'Leviathan', emoji: '🐲', rarity: 'mythic', weight: 0.18, min: 1, max: 1, xp: 220 }
]

function rodLevel(user) {
  const lvl = typeof user.rodLevel === 'number' ? user.rodLevel : 1
  return clamp(lvl, 1, 5)
}

function pickFish(luckMul, rodBonus, baitBoost) {
  const pool = []
  for (const fish of FISH_POOL) {
    const rMul = RARITY_META[fish.rarity]?.mul || 1
    const boost = luckMul * (1 + rodBonus) * (1 + baitBoost)
    const rarityFactor = Math.pow(rMul, 1.25)
    const w = fish.weight * (0.95 + (boost - 1) * 0.55) / rarityFactor
    pool.push({ ...fish, w: Math.max(0.01, w) })
  }
  const total = pool.reduce((a, b) => a + b.w, 0)
  let r = Math.random() * total
  for (const it of pool) {
    r -= it.w
    if (r <= 0) return it
  }
  return pool[pool.length - 1]
}

// =====================
// SELL / MARKET
// =====================
const SELL_PRICE = {
  padi: 1500,
  jagung: 3000,
  durian: 45000,
  emas: 180000,

  botol: 200,
  kaleng: 220,
  kardus: 180,
  besi: 600,
  karet: 350,
  baterai: 900,

  fish: 120,
  meat: 160,
  ore: 280,
  gem: 1200,
  crate: 800,

  ikan_mas: 180,
  ikan_lele: 170,
  ikan_nila: 190,
  udang: 210,
  kakap: 380,
  tuna: 420,
  cumi: 520,
  salmon: 1200,
  lobster: 1600,
  pari: 1900,
  hiu: 5200,
  swordfish: 6200,
  gurita_raksasa: 7800,
  paus_biru: 22000,
  naga_laut: 32000,
  megalodon: 90000,
  leviathan: 160000
}

const SELL_META = {
  padi: { emoji: '🌾', name: 'Padi' },
  jagung: { emoji: '🌽', name: 'Jagung' },
  durian: { emoji: '🍈', name: 'Durian' },
  emas: { emoji: '🥇', name: 'Emas' },

  botol: { emoji: '🍾', name: 'Botol' },
  kaleng: { emoji: '🥫', name: 'Kaleng' },
  kardus: { emoji: '📦', name: 'Kardus' },
  besi: { emoji: '🧲', name: 'Besi' },
  karet: { emoji: '🛞', name: 'Karet' },
  baterai: { emoji: '🔋', name: 'Baterai' },

  fish: { emoji: '🐟', name: 'Fish' },
  meat: { emoji: '🍖', name: 'Meat' },
  ore: { emoji: '⛏️', name: 'Ore' },
  gem: { emoji: '💎', name: 'Gem' },
  crate: { emoji: '📦', name: 'Crate' },

  ikan_mas: { emoji: '🐟', name: 'Ikan Mas' },
  ikan_lele: { emoji: '🐟', name: 'Lele' },
  ikan_nila: { emoji: '🐟', name: 'Nila' },
  udang: { emoji: '🦐', name: 'Udang' },
  kakap: { emoji: '🐠', name: 'Kakap' },
  tuna: { emoji: '🐠', name: 'Tuna' },
  cumi: { emoji: '🦑', name: 'Cumi' },
  salmon: { emoji: '🐟', name: 'Salmon' },
  lobster: { emoji: '🦞', name: 'Lobster' },
  pari: { emoji: '🐋', name: 'Ikan Pari' },
  hiu: { emoji: '🦈', name: 'Hiu' },
  swordfish: { emoji: '🐬', name: 'Swordfish' },
  gurita_raksasa: { emoji: '🐙', name: 'Gurita Raksasa' },
  paus_biru: { emoji: '🐳', name: 'Paus Biru' },
  naga_laut: { emoji: '🐉', name: 'Naga Laut' },
  megalodon: { emoji: '🦈', name: 'Megalodon' },
  leviathan: { emoji: '🐲', name: 'Leviathan' }
}

function getSellInfo(key) {
  const price = SELL_PRICE[key]
  if (typeof price !== 'number') return null
  const meta = SELL_META[key] || { emoji: '📦', name: key }
  return { key, price, ...meta }
}

function marketText() {
  return Object.keys(SELL_PRICE)
    .map((k) => {
      const m = getSellInfo(k)
      return `${m.emoji} *${m.key}* (${m.name}) — Jual: *${f(m.price)}*`
    })
    .join('\n')
}

// =====================
// CRAFT
// =====================
const CRAFT = {
  sword: { emoji: '🗡️', out: { sword: 1 }, coin: 8000, req: { ore: 6 } },
  armor: { emoji: '🛡️', out: { armor: 1 }, coin: 9000, req: { ore: 5, gem: 1 } },
  rod: { emoji: '🎣', out: { rod: 1 }, coin: 6000, req: { ore: 4 } },
  pickaxe: { emoji: '⛏️', out: { pickaxe: 1 }, coin: 7000, req: { ore: 5 } },
  coffee: { emoji: '☕', out: { coffee: 1 }, coin: 200, req: { fish: 3 } },
  bandage: { emoji: '🩹', out: { bandage: 1 }, coin: 250, req: { meat: 2 } },
  lockpick: { emoji: '🗝️', out: { lockpick: 1 }, coin: 1200, req: { ore: 2, gem: 1 } }
}

function craftListText() {
  return Object.entries(CRAFT)
    .map(([key, r]) => {
      const reqText = Object.entries(r.req || {})
        .map(([k, v]) => `${k}x${v}`)
        .join(', ')
      const outText = Object.entries(r.out || {})
        .map(([k, v]) => `${k}x${v}`)
        .join(', ')
      return `${r.emoji || '🛠️'} *${key}* → ${outText} | biaya: ${f(r.coin || 0)} | bahan: ${reqText}`
    })
    .join('\n')
}

// =====================
// CRATE
// =====================
const CRATE = { CD: 20 * 1000 }
const CRATE_LOOT = [
  { type: 'coin', min: 350, max: 900, weight: 40 },
  { type: 'coin', min: 900, max: 2200, weight: 18 },
  { type: 'item', key: 'ore', min: 1, max: 3, weight: 16 },
  { type: 'item', key: 'gem', min: 1, max: 1, weight: 5 },
  { type: 'item', key: 'potion', min: 1, max: 1, weight: 10 },
  { type: 'item', key: 'bait', min: 1, max: 2, weight: 14 },
  { type: 'item', key: 'bandage', min: 1, max: 1, weight: 8 },
  { type: 'rare_fish', weight: 3 },
  { type: 'legendary_fish', weight: 1 }
]

function pickWeighted2(table) {
  const total = table.reduce((a, b) => a + (b.weight || 0), 0)
  let r = Math.random() * total
  for (const it of table) {
    r -= it.weight || 0
    if (r <= 0) return it
  }
  return table[table.length - 1]
}

function pickFishByRarity(rarity) {
  const pool = FISH_POOL.filter((x) => x.rarity === rarity)
  if (!pool.length) return null
  const total = pool.reduce((a, b) => a + (b.weight || 1), 0)
  let r = Math.random() * total
  for (const it of pool) {
    r -= it.weight || 1
    if (r <= 0) return it
  }
  return pool[pool.length - 1]
}

// =====================
// PVP
// =====================
const PVP = {
  ROB_CD: 5 * 60 * 1000,
  BEGAL_CD: 10 * 60 * 1000,
  ROB_ENERGY: 2,
  BEGAL_ENERGY: 3,
  ROB_JAIL: 3 * 60 * 1000,
  BEGAL_JAIL: 7 * 60 * 1000,
  ROB_MIN_TARGET_COIN: 300,
  BEGAL_MIN_TARGET_COIN: 600
}

function isLockedPvp(user) {
  const now = Date.now()
  if ((user.jailUntil || 0) > now) return { ok: false, type: 'jail', remaining: user.jailUntil - now }
  if ((user.woundedUntil || 0) > now) return { ok: false, type: 'wound', remaining: user.woundedUntil - now }
  return { ok: true, type: null, remaining: 0 }
}

function computeEffectiveDefense(user) {
  const armorOwned = (user.inventory?.armor || 0) > 0 ? 1 : 0
  const armorBonus = armorOwned ? 2 : 0
  const upgradeBonus = user.armorLevel || 0
  return (user.defense || 0) + armorBonus + Math.floor(upgradeBonus / 2)
}

function computeLuckMul(user) {
  return 1 + (user.luck || 0) * 0.05
}

function powerAttack(user) {
  const swordOwned = (user.inventory?.sword || 0) > 0 ? 2 : 0
  return (user.attack || 0) + (user.weaponLevel || 0) + swordOwned + Math.floor((user.level || 1) * 0.6)
}

function powerDefense(user) {
  return computeEffectiveDefense(user) + Math.floor((user.level || 1) * 0.55)
}

function pvpChance(attPow, defPow, luckMul) {
  const diff = attPow - defPow
  const base = 0.35 + diff * 0.02
  const luckBonus = (luckMul - 1) * 0.35
  return clamp(base + luckBonus, 0.05, 0.85)
}

// =====================
// USER DB
// =====================
function xpNeeded(level) {
  return 80 + (level - 1) * 50
}

function defaultUser(jid, name = 'Petualang') {
  const now = Date.now()
  return {
    id: jid,
    name,
    level: 1,
    xp: 0,
    hp: 100,
    maxHp: 100,
    energy: 10,
    maxEnergy: 10,
    coin: 0,
    bank: 0,

    // status
    jailUntil: 0,
    woundedUntil: 0,

    // stats
    attack: 5,
    defense: 2,
    luck: 1,
    rodLevel: 1,

    // upgrade
    weaponLevel: 0,
    armorLevel: 0,

    // farming
    farm: { active: null, startedAt: 0 },

    // buffs
    buffs: {},

    createdAt: now,
    lastUpdated: now,
    lastEnergyTime: now,
    cooldowns: {},

    inventory: {
      // shop
      potion: 1,
      bait: 0,
      pickaxe: 0,
      sword: 0,
      armor: 0,
      rod: 0,
      coffee: 0,
      bandage: 0,
      lockpick: 0,
      fertilizer: 0,

      // base
      fish: 0,
      meat: 0,
      ore: 0,
      gem: 0,
      crate: 0,

      // farming output
      padi: 0,
      jagung: 0,
      durian: 0,
      emas: 0,

      // mulung
      botol: 0,
      kaleng: 0,
      kardus: 0,
      besi: 0,
      karet: 0,
      baterai: 0,

      // fish collection
      ikan_mas: 0,
      ikan_lele: 0,
      ikan_nila: 0,
      udang: 0,
      kakap: 0,
      tuna: 0,
      cumi: 0,
      salmon: 0,
      lobster: 0,
      pari: 0,
      hiu: 0,
      swordfish: 0,
      gurita_raksasa: 0,
      paus_biru: 0,
      naga_laut: 0,
      megalodon: 0,
      leviathan: 0
    }
  }
}

function getUserFile(jid) {
  // make filename safe
  const safe = String(jid).replace(/[^0-9a-zA-Z@._-]/g, '_')
  return path.join(RPG_DIR, `${safe}.json`)
}

function loadUser(jid, name) {
  const file = getUserFile(jid)
  let user
  if (fs.existsSync(file)) {
    try {
      user = JSON.parse(fs.readFileSync(file, 'utf8'))
    } catch {
      user = defaultUser(jid, name)
    }
  } else {
    user = defaultUser(jid, name)
  }

  if (!user.inventory) user.inventory = {}
  if (!user.cooldowns) user.cooldowns = {}
  if (!user.buffs) user.buffs = {}
  if (!user.farm) user.farm = { active: null, startedAt: 0 }

  if (!user.maxHp) user.maxHp = 100
  if (!user.maxEnergy) user.maxEnergy = 10

  if (typeof user.hp !== 'number') user.hp = user.maxHp
  if (typeof user.energy !== 'number') user.energy = user.maxEnergy
  if (!user.name && name) user.name = name

  if (typeof user.level !== 'number') user.level = 1
  if (typeof user.xp !== 'number') user.xp = 0
  if (typeof user.coin !== 'number') user.coin = 0
  if (typeof user.bank !== 'number') user.bank = 0

  if (typeof user.attack !== 'number') user.attack = 5
  if (typeof user.defense !== 'number') user.defense = 2
  if (typeof user.luck !== 'number') user.luck = 1

  if (typeof user.rodLevel !== 'number') user.rodLevel = 1
  user.rodLevel = clamp(user.rodLevel, 1, 5)

  if (typeof user.weaponLevel !== 'number') user.weaponLevel = 0
  if (typeof user.armorLevel !== 'number') user.armorLevel = 0

  if (typeof user.jailUntil !== 'number') user.jailUntil = 0
  if (typeof user.woundedUntil !== 'number') user.woundedUntil = 0

  // ensure inventory keys exist
  const inv = user.inventory
  for (const key of Object.keys(SHOP)) if (typeof inv[key] !== 'number') inv[key] = 0
  for (const key of ['fish','meat','ore','gem','crate','padi','jagung','durian','emas','botol','kaleng','kardus','besi','karet','baterai']) {
    if (typeof inv[key] !== 'number') inv[key] = 0
  }
  for (const fish of FISH_POOL) if (typeof inv[fish.key] !== 'number') inv[fish.key] = 0

  if (!user.lastEnergyTime) user.lastEnergyTime = Date.now()
  if (!user.lastUpdated) user.lastUpdated = Date.now()
  if (!user.createdAt) user.createdAt = Date.now()

  user.hp = clamp(user.hp, 0, user.maxHp)
  user.energy = clamp(user.energy, 0, user.maxEnergy)

  return user
}

function saveUser(user) {
  user.lastUpdated = Date.now()
  fs.writeFileSync(getUserFile(user.id), JSON.stringify(user, null, 2))
}

function regenEnergy(user) {
  const now = Date.now()
  const last = user.lastEnergyTime || now
  const diff = now - last
  const per = 60 * 1000
  const add = Math.floor(diff / per)
  if (add > 0) {
    user.energy = Math.min(user.maxEnergy, user.energy + add)
    user.lastEnergyTime = last + add * per
  }
}

function useCooldown(user, key, cdMs) {
  const now = Date.now()
  const last = user.cooldowns?.[key] || 0
  const diff = now - last
  if (diff < cdMs) return { ok: false, remaining: cdMs - diff }
  user.cooldowns[key] = now
  return { ok: true, remaining: 0 }
}

function addXp(user, amount) {
  let lvlUp = 0
  user.xp += amount
  while (user.xp >= xpNeeded(user.level)) {
    user.xp -= xpNeeded(user.level)
    user.level += 1
    lvlUp += 1

    user.maxHp += 10
    user.maxEnergy += 1
    user.hp = user.maxHp
    user.energy = user.maxEnergy

    user.attack += 1
    user.defense += 1
  }
  return lvlUp
}

// =====================
// TARGET PARSER
// =====================
function toJidFromNumber(raw) {
  let n = String(raw || '').replace(/[^\d]/g, '')
  if (!n) return null
  if (n.startsWith('0')) n = '62' + n.slice(1)
  if (!n.startsWith('62')) return null
  return n + '@s.whatsapp.net'
}

function pickTargetJid(msg, ctx, args) {
  const ci = msg?.message?.extendedTextMessage?.contextInfo
  const mentioned = ci?.mentionedJid?.[0]
  if (mentioned) return mentioned

  const q = ctx?.quoted
  const qMention = q?.mentionedJid?.[0]
  if (qMention) return qMention
  const quotedParticipant = q?.participant
  if (quotedParticipant) return quotedParticipant

  const maybeNum = args?.[0]
  const jidFromNum = toJidFromNumber(maybeNum)
  if (jidFromNum) return jidFromNum

  return null
}

// =====================
// COMMANDS
// =====================
export const command = [
  'profile','inventory','rename','namarpg','toprpg',
  'klaim','kerja','adventure','dungeon','berburu','menambang',
  'berkebun','tanam','panen','mulung',
  'memancing','rod','upgraderod',
  'opencrate','crateopen','bukaan',
  'pasar','market','jual','sell',
  'shop','bank','use','upgrade',
  'transfer','tf','merampok','rob','begal',
  'craft','buat',
  'slot'
]

export default async function rpgHandler(msg, ctx) {
  const { riz, id, qriz, sender, pushname, command, args, q, reply, isOwner } = ctx
  const user = loadUser(sender, pushname)
  const nama = user.name || pushname || 'Petualang'
  regenEnergy(user)

  const inv = user.inventory

  switch (command) {
    case 'profile': {
      const nextXp = xpNeeded(user.level) - user.xp
      const effDef = computeEffectiveDefense(user)
      const now = Date.now()
      const extra = []
      const jailLeft = (user.jailUntil || 0) - now
      const woundLeft = (user.woundedUntil || 0) - now
      if (jailLeft > 0) extra.push(`🚔 Ditahan warga: *${formatMs(jailLeft)}*`)
      if (woundLeft > 0) extra.push(`🤕 Luka: *${formatMs(woundLeft)}*`)
      if (user.farm?.active) extra.push(`🌱 Kebun: *${String(user.farm.active).toUpperCase()}*`)
      extra.push(`🪝 Rod Level: *${rodLevel(user)}*`)
      const lp = user.buffs?.lockpick || 0
      if (lp > 0) extra.push(`🗝️ Lockpick buff: *${lp}x*`)

      const teks =
        `🏞️ *Profil Petualang*\n` +
        `\n👤 Nama : *${nama}*` +
        `\n🆔 ID   : ${sender}` +
        `\n\n🏅 Level : *${user.level}*` +
        `\n🔮 XP    : *${user.xp}/${xpNeeded(user.level)}* (butuh ${nextXp} XP)` +
        `\n❤️ HP    : *${user.hp}/${user.maxHp}*` +
        `\n⚡ Energi: *${user.energy}/${user.maxEnergy}*` +
        `\n💰 Coin  : *${f(user.coin)}*` +
        `\n🏦 Bank  : *${f(user.bank)}*` +
        `\n\n⚔️ Attack : *${user.attack}* (weapon upg: +${user.weaponLevel})` +
        `\n🛡 Defense: *${user.defense}* (effective: ${effDef}) (armor upg: +${user.armorLevel})` +
        `\n🍀 Luck   : *${user.luck}*`

      const statusText = extra.length ? `\n\n🧩 *Status*\n${extra.map((v) => `• ${v}`).join('\n')}` : ''
      await reply(teks + statusText)
      saveUser(user)
      break
    }

    case 'inventory': {
      const lines = []
      const addLine = (key, label, emoji) => lines.push(`${emoji} ${label}: *${inv[key] || 0}*`)
      lines.push(`🎒 *Inventory ${nama}*`)
      lines.push('')
      addLine('potion','Potion','🧴')
      addLine('bait','Bait','🪱')
      addLine('pickaxe','Pickaxe','⛏️')
      addLine('sword','Sword','🗡️')
      addLine('armor','Armor','🛡️')
      addLine('rod','Rod','🎣')
      addLine('coffee','Coffee','☕')
      addLine('bandage','Bandage','🩹')
      addLine('lockpick','Lockpick','🗝️')
      addLine('fertilizer','Fertilizer','🧪')

      lines.push('')
      addLine('fish','Fish','🐟')
      addLine('meat','Meat','🍖')
      addLine('ore','Ore','🪨')
      addLine('gem','Gem','💎')
      addLine('crate','Crate','📦')

      lines.push('')
      lines.push('🗑️ *Barang Mulung*')
      addLine('botol','Botol','🍾')
      addLine('kaleng','Kaleng','🥫')
      addLine('kardus','Kardus','📦')
      addLine('besi','Besi','🧲')
      addLine('karet','Karet','🛞')
      addLine('baterai','Baterai','🔋')

      lines.push('')
      lines.push('🌱 *Hasil Kebun*')
      addLine('padi','Padi','🌾')
      addLine('jagung','Jagung','🌽')
      addLine('durian','Durian','🍈')
      addLine('emas','Emas','🥇')

      await reply(lines.join('\n'))
      saveUser(user)
      break
    }

    case 'rename':
    case 'namarpg': {
      const newName = (q || '').trim()
      if (!newName) {
        await reply('📌 Contoh: *.rename NamaBaru*')
        break
      }
      if (newName.length < 3 || newName.length > 20) {
        await reply('⚠️ Nama harus 3–20 karakter.')
        break
      }
      user.name = newName
      await reply(`✅ Nama karakter diubah menjadi *${newName}*.`)
      saveUser(user)
      break
    }

    case 'klaim': {
      const cd = useCooldown(user, 'daily', 24 * 60 * 60 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu sudah klaim hari ini.\nCoba lagi dalam *${formatMs(cd.remaining)}*.`)
        break
      }
      const luckMul = computeLuckMul(user)
      const coinGain = Math.round((400 + user.level * 30) * luckMul)
      const xpGain = Math.round((30 + user.level * 5) * luckMul)
      user.coin += coinGain
      const lvlUp = addXp(user, xpGain)
      if (Math.random() < 0.25) inv.potion += 1
      await reply(`🎁 *Daily Claim*\n\n💰 Coin: +${f(coinGain)}\n🔮 XP  : +${xpGain}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }

    case 'kerja': {
      const cd = useCooldown(user, 'work', 60 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja kerja.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 2) {
        await reply('⚡ Energi kurang (butuh 2).')
        break
      }
      user.energy -= 2
      const luckMul = computeLuckMul(user)
      const coinGain = Math.round((rand(120, 240) + user.level * 25) * luckMul)
      const xpGain = Math.round((rand(10, 20) + user.level * 2) * luckMul)
      user.coin += coinGain
      const lvlUp = addXp(user, xpGain)
      await reply(`💼 *Kerja*\n\n💰 Coin: +${f(coinGain)}\n🔮 XP  : +${xpGain}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }

    case 'adventure': {
      if (user.hp <= 0) {
        await reply('💤 Kamu pingsan. Gunakan *.use potion* dulu.')
        break
      }
      const cd = useCooldown(user, 'adventure', 45 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja adventure.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 2) {
        await reply('⚡ Energi kurang (butuh 2).')
        break
      }
      user.energy -= 2
      const effDef = computeEffectiveDefense(user)
      const luckMul = computeLuckMul(user)
      const coinGain = Math.round((rand(80, 180) + user.level * 18) * luckMul)
      const xpGain = Math.round((rand(25, 45) + user.level * 6) * luckMul)
      const rawDmg = rand(8, 22) + Math.floor(user.level / 2)
      const dmg = Math.max(0, rawDmg - effDef * 2)
      user.coin += coinGain
      if (dmg > 0) user.hp = Math.max(0, user.hp - dmg)
      if (Math.random() < 0.25 * luckMul) inv.crate += 1
      if (Math.random() < 0.12 * luckMul) inv.gem += 1
      const lvlUp = addXp(user, xpGain)
      await reply(`🧭 *Adventure*\n\n💰 Coin: +${f(coinGain)}\n🔮 XP  : +${xpGain}` + (dmg ? `\n💢 Damage: -${dmg} HP` : '') + `\n\n❤️ HP: ${user.hp}/${user.maxHp}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }
    
    case 'slot':
case 'j': {
  try {
    const cd = useCooldown(user, 'slot', 20 * 1000)
    if (!cd.ok) {
      await reply(`⏳ Tunggu *${formatMs(cd.remaining)}* sebelum main slot lagi.`)
      saveUser(user)
      break
    }

    const MIN_BET = 50
    const MAX_BET = 5000000

    const betRaw = (args?.[0] ?? q ?? '').toString().trim().toLowerCase()

    let bet
    if (!betRaw) bet = 100
    else if (betRaw === 'all') bet = Math.min(user.coin || 0, MAX_BET)
    else bet = parseCount(betRaw, 100)

    if (!Number.isFinite(bet) || bet < 1) bet = 100
    bet = Math.floor(bet)

    if (bet < MIN_BET) {
      await reply(`🎰 Minimal bet *${f(MIN_BET)}* coin.\nContoh: *.slot 100* / *.slot all*`)
      saveUser(user)
      break
    }

    if (bet > MAX_BET) bet = MAX_BET

    if (user.coin < bet) {
      await reply(`💰 Coin tidak cukup.\nBet: *${f(bet)}* coin\nCoin kamu: *${f(user.coin)}*`)
      saveUser(user)
      break
    }

    safeDec(user, 'coin', bet)

    let spin1 = pickRandom(['1','2','3','4','5']) * 1
    let spin2 = pickRandom(['1','2','3','4','5']) * 1
    let spin3 = pickRandom(['1','2','3','4','5']) * 1
    let spin4 = pickRandom(['1','2','3','4','5']) * 1
    let spin5 = pickRandom(['1','2','3','4','5']) * 1
    let spin6 = pickRandom(['1','2','3','4','5']) * 1
    let spin7 = pickRandom(['1','2','3','4','5']) * 1
    let spin8 = pickRandom(['1','2','3','4','5']) * 1
    let spin9 = pickRandom(['1','2','3','4','5']) * 1

    let WinOrLose
    let winAmount = 0
    let xpGain = 0

    const roll = Math.floor(Math.random() * 100) + 1

    const megaWin = bet * 500
    const jackpotWin = bet * 100
    const topWin = bet * 50

    const megaXp = bet * 5
    const jackpotXp = bet * 2
    const topXp = bet * 1
    const loseXp = Math.max(5, Math.round(bet * 0.1))

    if (roll <= 5) {
      WinOrLose = '🎉 *MEGA JACKPOT!* Kamu menang besar!'
      winAmount = megaWin
      xpGain = megaXp
      const lucky = pickRandom(['1','2','3','4','5']) * 1
      spin1 = spin2 = spin3 = spin4 = spin5 = spin6 = spin7 = spin8 = spin9 = lucky
    } 
    else if (roll <= 12) {
      WinOrLose = '💰 *JACKPOT!* Kamu menang!'
      winAmount = jackpotWin
      xpGain = jackpotXp
      const lucky = pickRandom(['1','2','3','4','5']) * 1
      spin4 = spin5 = spin6 = lucky
    } 
    else if (roll <= 30) {
      WinOrLose = '🎊 Kamu menang!'
      winAmount = topWin
      xpGain = topXp
      const lucky = pickRandom(['1','2','3','4','5']) * 1
      spin1 = spin2 = spin3 = lucky
    } 
    else {
      WinOrLose = '😢 Kamu kalah, coba lagi!'
      winAmount = 0
      xpGain = loseXp

      const reroll = () => pickRandom(['1','2','3','4','5']) * 1
      let guard = 0
      while (guard++ < 10 && ((spin1 === spin2 && spin2 === spin3) || (spin4 === spin5 && spin5 === spin6))) {
        spin1 = reroll(); spin2 = reroll(); spin3 = reroll()
        spin4 = reroll(); spin5 = reroll(); spin6 = reroll()
      }
    }

    const toEmoji = n => n == 1 ? '🍊' : n == 2 ? '🍇' : n == 3 ? '🍉' : n == 4 ? '🍌' : n == 5 ? '🍍' : ''

    const text = `
🎰 *SLOTS*
🎲 Bet: *${f(bet)}* coin

${toEmoji(spin1)} | ${toEmoji(spin2)} | ${toEmoji(spin3)}
${toEmoji(spin4)} | ${toEmoji(spin5)} | ${toEmoji(spin6)}  ←
${toEmoji(spin7)} | ${toEmoji(spin8)} | ${toEmoji(spin9)}

${WinOrLose}

${winAmount > 0 ? `💰 *+${f(winAmount)} coin*` : ''}
📊 Coin: ${f(user.coin + winAmount)} | XP: +${xpGain}
⏱️ Cooldown: 20 detik
`.trim()

    if (winAmount > 0) {
      user.coin += winAmount
      const lvlUp = addXp(user, xpGain)
      if (lvlUp) WinOrLose += `\n🎉 Naik level! Sekarang level *${user.level}*`
    } else {
      addXp(user, xpGain)
    }

    await reply(text)
    saveUser(user)
  } catch (e) {
    console.error("Slot Error:", e)
    reply("❌ Error saat menjalankan game slot.")
  }
  break
}

    case 'dungeon': {
      if (user.hp <= 0) {
        await reply('💤 Kamu pingsan. Gunakan *.use potion* dulu.')
        break
      }
      if (user.level < 3) {
        await reply('🔒 Dungeon terbuka mulai level 3.')
        break
      }
      const cd = useCooldown(user, 'dungeon', 3 * 60 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja dungeon.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 3) {
        await reply('⚡ Energi kurang (butuh 3).')
        break
      }
      user.energy -= 3
      const effDef = computeEffectiveDefense(user)
      const luckMul = computeLuckMul(user)
      const roll = Math.random()
      let coinGain = 0, xpGain = 0, dmg = 0, gemGain = 0, crateGain = 0, desc = ''
      if (roll < 0.2) {
        desc = 'Kamu disergap monster kuat...'
        xpGain = rand(10, 25)
        const raw = rand(25, 45)
        dmg = Math.max(10, raw - effDef * 2)
      } else if (roll < 0.7) {
        desc = 'Kamu menemukan harta di dalam dungeon.'
        coinGain = Math.round((rand(200, 400) + user.level * 40) * luckMul)
        xpGain = Math.round((rand(40, 70) + user.level * 10) * luckMul)
        const raw = rand(10, 30)
        dmg = Math.max(0, raw - effDef * 2)
        if (Math.random() < 0.3 * luckMul) gemGain = 1
      } else {
        desc = '🔥 *BOSS CLEAR!* Drop langka!'
        coinGain = Math.round((rand(350, 700) + user.level * 80) * luckMul)
        xpGain = Math.round((rand(70, 120) + user.level * 15) * luckMul)
        const raw = rand(15, 35)
        dmg = Math.max(0, raw - effDef * 2)
        gemGain = rand(1, 2)
        crateGain = 1
      }
      user.coin += coinGain
      if (dmg) user.hp = Math.max(0, user.hp - dmg)
      if (gemGain) inv.gem += gemGain
      if (crateGain) inv.crate += crateGain
      const lvlUp = addXp(user, xpGain)
      let teks = `🕳️ *Dungeon Run*\n\n${desc}\n\n`
      if (coinGain) teks += `💰 Coin: +${f(coinGain)}\n`
      teks += `🔮 XP  : +${xpGain}\n`
      if (gemGain) teks += `💎 Gem : +${gemGain}\n`
      if (crateGain) teks += `📦 Crate: +${crateGain}\n`
      if (dmg) teks += `💢 Damage: -${dmg} HP\n`
      teks += `\n❤️ HP: ${user.hp}/${user.maxHp}\n⚡ Energi: ${user.energy}/${user.maxEnergy}`
      if (lvlUp) teks += `\n\n✨ Naik level! Sekarang level *${user.level}*`
      await reply(teks)
      saveUser(user)
      break
    }

    case 'berburu': {
      const cd = useCooldown(user, 'hunt', 45 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja berburu.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 2) {
        await reply('⚡ Energi kurang (butuh 2).')
        break
      }
      user.energy -= 2
      const luckMul = computeLuckMul(user)
      const hasSword = (inv.sword || 0) > 0
      const weaponBoost = (hasSword ? 1.15 : 1) + (user.weaponLevel || 0) * 0.03
      const meatGain = Math.max(1, Math.round(rand(1, 4) * weaponBoost * luckMul))
      const coinGain = Math.round((rand(50, 120) + user.level * 10) * weaponBoost)
      inv.meat += meatGain
      user.coin += coinGain
      const xpGain = Math.round((rand(15, 30) + user.level * 4) * luckMul)
      const lvlUp = addXp(user, xpGain)
      await reply(`🏹 *Berburu*\n\n🍖 Meat: +${meatGain}\n💰 Coin: +${f(coinGain)}\n🔮 XP  : +${xpGain}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }

    case 'menambang': {
      const cd = useCooldown(user, 'mine', 60 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja menambang.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 3) {
        await reply('⚡ Energi kurang (butuh 3).')
        break
      }
      if ((inv.pickaxe || 0) <= 0) {
        await reply('⛏️ Kamu butuh pickaxe. Beli di *.shop buy pickaxe*')
        break
      }
      user.energy -= 3
      const luckMul = computeLuckMul(user)
      const oreGain = Math.max(1, Math.round(rand(1, 4) * luckMul))
      const gemGain = Math.random() < 0.08 * luckMul ? 1 : 0
      inv.ore += oreGain
      if (gemGain) inv.gem += gemGain
      const coinGain = Math.round((rand(60, 140) + user.level * 12) * luckMul)
      user.coin += coinGain
      const xpGain = Math.round((rand(20, 40) + user.level * 5) * luckMul)
      const lvlUp = addXp(user, xpGain)
      await reply(`⛏️ *Menambang*\n\n🪨 Ore : +${oreGain}\n` + (gemGain ? `💎 Gem : +${gemGain}\n` : '') + `💰 Coin: +${f(coinGain)}\n🔮 XP  : +${xpGain}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }

    case 'berkebun': {
      const now = Date.now()
      const farm = user.farm || { active: null, startedAt: 0 }
      if (farm.active) {
        const seed = SEEDS[farm.active]
        if (!seed) {
          user.farm = { active: null, startedAt: 0 }
          await reply('⚠️ Data kebun error. Sudah di-reset. Tanam lagi.')
          saveUser(user)
          break
        }
        const elapsed = now - (farm.startedAt || 0)
        const remaining = seed.time - elapsed
        if (remaining <= 0) {
          await reply(`🌱 Kebun: *${farm.active.toUpperCase()}*\n✅ Sudah siap panen! Ketik: *.panen*`)
        } else {
          await reply(`🌱 Kebun: *${farm.active.toUpperCase()}*\n⏳ Sisa waktu: *${formatMs(remaining)}*`)
        }
        saveUser(user)
        break
      }
      await reply(`───「 GARDENING 」───\n\nPilih bibit:\n${seedListText()}\n\nContoh: *.tanam padi*`)
      saveUser(user)
      break
    }

    case 'tanam': {
      const pilihan = (q || args?.[0] || '').toLowerCase().trim()
      if (!pilihan || !SEEDS[pilihan]) {
        await reply(`───「 GARDENING 」───\n\nPilih bibit:\n${seedListText()}\n\nContoh: *.tanam padi*`)
        saveUser(user)
        break
      }
      if (user.farm?.active) {
        await reply(`⚠️ Kamu masih menanam *${user.farm.active.toUpperCase()}*.\nCek: *.berkebun*`)
        saveUser(user)
        break
      }
      const seed = SEEDS[pilihan]
      if (user.coin < seed.price) {
        await reply(`💰 Coin tidak cukup.\nHarga: *${f(seed.price)}* | Coin kamu: *${f(user.coin)}*`)
        saveUser(user)
        break
      }
      safeDec(user, 'coin', seed.price)
      user.farm = { active: pilihan, startedAt: Date.now() }

      try {
        const pp = await riz.profilePictureUrl(sender, 'image').catch(() => null)
        await riz.sendMessage(
          id,
          {
            text:
              `🌱 Kamu menanam *${pilihan.toUpperCase()}*.\n` +
              `⏳ Waktu panen: *${formatMs(seed.time)}*\n` +
              `✅ Cek status: *.berkebun*\n` +
              `🧺 Panen: *.panen*`,
            contextInfo: {
              externalAdReply: {
                title: 'GARDENING',
                body: `Farmer: ${pushname || 'Petualang'}`,
                thumbnailUrl: pp || 'https://files.cloudkuimages.guru/images/604a2923cef9.jpeg',
                mediaType: 1,
                renderLargerThumbnail: true,
                showAdAttribution: false
              }
            }
          },
          { quoted: qriz }
        )
      } catch {
        await reply(`🌱 Kamu menanam *${pilihan.toUpperCase()}*. Cek nanti: *.panen*`)
      }

      saveUser(user)
      break
    }

    case 'panen': {
      const now = Date.now()
      const farm = user.farm || { active: null, startedAt: 0 }
      if (!farm.active) {
        await reply('🌿 Kamu belum menanam apa pun. Ketik *.berkebun* untuk mulai.')
        saveUser(user)
        break
      }
      const seed = SEEDS[farm.active]
      if (!seed) {
        user.farm = { active: null, startedAt: 0 }
        await reply('⚠️ Data kebun error. Sudah di-reset. Tanam lagi.')
        saveUser(user)
        break
      }
      const elapsed = now - (farm.startedAt || 0)
      const remaining = seed.time - elapsed
      if (remaining > 0) {
        await reply(`⏳ Tanaman *${farm.active.toUpperCase()}* belum siap.\nSisa: *${formatMs(remaining)}*`)
        saveUser(user)
        break
      }
      safeInc(inv, farm.active, 1)
      const lvlUp = addXp(user, seed.xp)
      user.farm = { active: null, startedAt: 0 }
      await reply(`🌾 *PANEN BERHASIL!*\n\nDapat 1 *${farm.active.toUpperCase()}* ${seed.emoji}\n🔮 XP: +${seed.xp}` + (lvlUp ? `\n\n✨ Naik level x${lvlUp}! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }

    case 'mulung': {
      const cd = useCooldown(user, 'mulung', 2 * 60 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja mulung.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 1) {
        await reply('⚡ Energi kurang (butuh 1).')
        break
      }
      user.energy -= 1
      const luckMul = computeLuckMul(user)
      const rolls = Math.min(
        3,
        1 + (Math.random() < 0.55 * Math.min(1.5, luckMul) ? 1 : 0) + (Math.random() < 0.15 * Math.min(1.5, luckMul) ? 1 : 0)
      )
      const gained = {}
      for (let i = 0; i < rolls; i++) {
        const picked = pickWeighted(SCAVENGE_TABLE)
        const qty = rand(picked.min, picked.max)
        gained[picked.key] = (gained[picked.key] || 0) + qty
      }
      const coinGain = Math.round((rand(25, 80) + user.level * 5) * luckMul)
      const xpGain = Math.round((rand(8, 18) + user.level * 2) * luckMul)
      user.coin += coinGain
      const lvlUp = addXp(user, xpGain)
      for (const [k, v] of Object.entries(gained)) safeInc(inv, k, v)

      let bonusText = ''
      if (Math.random() < 0.07 * Math.min(1.6, luckMul)) {
        inv.potion += 1
        bonusText = '\n🧴 Bonus: +1 Potion'
      } else if (Math.random() < 0.12 * Math.min(1.6, luckMul)) {
        inv.bait += 1
        bonusText = '\n🪱 Bonus: +1 Bait'
      }

      const lootLines = Object.entries(gained)
        .map(([k, v]) => {
          const meta = TRASH_ITEMS[k] || { emoji: '📦', label: k }
          return `${meta.emoji} ${meta.label}: +${v}`
        })
        .join('\n')

      await reply(
        `🗑️ *Mulung*\n\n${lootLines}\n\n💰 Coin: +${f(coinGain)}\n🔮 XP  : +${xpGain}${bonusText}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` +
          (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : '')
      )
      saveUser(user)
      break
    }

    case 'memancing': {
      const cd = useCooldown(user, 'memancing', 90 * 1000)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja memancing.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        break
      }
      if (user.energy < 1) {
        await reply('⚡ Energi kurang (butuh 1).')
        break
      }
      const useBait = ['bait', 'umpan'].includes((args?.[0] || '').toLowerCase())
      if (useBait) {
        if ((inv.bait || 0) < 1) {
          await reply('🪱 Bait kamu habis. Beli di .shop atau dapat dari .mulung / crate.')
          break
        }
        safeDec(inv, 'bait', 1)
      }
      user.energy -= 1

      const luckMul = computeLuckMul(user)
      const rLvl = rodLevel(user)
      const rodBonus = ROD[rLvl]?.bonus || 0
      const baitBoost = useBait ? 0.25 : 0

      const fish = pickFish(luckMul, rodBonus, baitBoost)
      const qty = rand(fish.min, fish.max)
      safeInc(inv, fish.key, qty)

      const addBasicFish = Math.random() < 0.55
      let basicQty = 0
      if (addBasicFish) {
        basicQty = rand(1, 3)
        safeInc(inv, 'fish', basicQty)
      }

      const crateChance = Math.min(0.18, 0.06 + (luckMul - 1) * 0.06 + rodBonus * 0.35 + (useBait ? 0.03 : 0))
      let gotCrate = 0
      if (Math.random() < crateChance) {
        gotCrate = 1
        safeInc(inv, 'crate', 1)
      }

      const rarityE = RARITY_META[fish.rarity]?.emoji || '⚪'
      const xpGain = Math.round((fish.xp + Math.floor(user.level * 1.2)) * (RARITY_META[fish.rarity]?.mul || 1))
      const lvlUp = addXp(user, xpGain)

      await reply(
        `🎣 *MEMANCING*\n\n${rarityE} Rarity: *${fish.rarity.toUpperCase()}*\n${fish.emoji} Dapat: *${fish.name}* x${qty}\n🔮 XP: +${xpGain}` +
          (addBasicFish ? `\n🐟 Fish: +${basicQty}` : '') +
          (gotCrate ? `\n🧰 Crate: +1` : '') +
          (useBait ? `\n🪱 Bait: -1 (boost rare)` : '') +
          `\n\n🪝 Rod: *Lv ${rLvl}* (${ROD[rLvl]?.name || 'Rod'})\n⚡ Energi: ${user.energy}/${user.maxEnergy}` +
          (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : '')
      )

      saveUser(user)
      break
    }

    case 'rod': {
      const rLvl = rodLevel(user)
      const data = ROD[rLvl]
      const next = ROD[rLvl + 1]
      let txt = `🪝 *ROD INFO*\n\nRod kamu: *Lv ${rLvl}* — *${data?.name || 'Rod'}*\nBonus rare: *+${Math.round((data?.bonus || 0) * 100)}%*\n\n`
      if (!next) {
        txt += '✅ Rod kamu sudah level maksimal.'
        await reply(txt)
        saveUser(user)
        break
      }
      txt += `⬆️ Upgrade berikutnya: *Lv ${rLvl + 1}* — *${next.name}*\nBonus rare: *+${Math.round(next.bonus * 100)}%*\nBiaya: *${f(next.cost)}* coin\n`
      if (next.req) {
        txt += 'Butuh item:\n' + Object.entries(next.req).map(([k, v]) => `• ${k}: ${v}`).join('\n') + '\n'
      }
      txt += '\nGunakan: *.upgraderod*'
      await reply(txt)
      saveUser(user)
      break
    }

    case 'upgraderod': {
      const rLvl = rodLevel(user)
      const nextLvl = rLvl + 1
      const next = ROD[nextLvl]
      if (!next) {
        await reply('✅ Rod kamu sudah maksimal.')
        saveUser(user)
        break
      }
      if (user.coin < next.cost) {
        await reply(`❌ Coin tidak cukup.\nButuh: *${f(next.cost)}* | Coin kamu: *${f(user.coin)}*`)
        saveUser(user)
        break
      }
      if (next.req) {
        for (const [k, v] of Object.entries(next.req)) {
          if ((inv[k] || 0) < v) {
            await reply(`❌ Item kurang untuk upgrade.\nButuh: *${k} x${v}* | Kamu punya: *${inv[k] || 0}*`)
            saveUser(user)
            return
          }
        }
      }
      safeDec(user, 'coin', next.cost)
      if (next.req) for (const [k, v] of Object.entries(next.req)) safeDec(inv, k, v)
      user.rodLevel = nextLvl
      await reply(`✅ *UPGRADE ROD BERHASIL!*\n\nRod sekarang: *Lv ${nextLvl}* — *${next.name}*\nBonus rare: *+${Math.round(next.bonus * 100)}%*\n💰 Sisa coin: *${f(user.coin)}*`)
      saveUser(user)
      break
    }

    case 'opencrate':
    case 'crateopen':
    case 'bukaan': {
      const cd = useCooldown(user, 'opencrate', CRATE.CD)
      if (!cd.ok) {
        await reply(`⏳ Tunggu *${formatMs(cd.remaining)}* dulu.`)
        break
      }
      const amount = args[0] ? parseCount(args[0], 1) : 1
      const qty = clamp(amount, 1, 10)
      if ((inv.crate || 0) < qty) {
        await reply(`❌ Crate kamu kurang.\nKamu punya: *${inv.crate || 0}*`)
        break
      }
      safeDec(inv, 'crate', qty)

      let totalCoin = 0
      let totalXp = 0
      const gains = {}
      const fishGains = {}
      const luckMul = computeLuckMul(user)

      for (let i = 0; i < qty; i++) {
        const loot = pickWeighted2(CRATE_LOOT)
        if (loot.type === 'coin') {
          const coin = Math.round(rand(loot.min, loot.max) * (0.95 + (luckMul - 1) * 0.25))
          totalCoin += coin
          continue
        }
        if (loot.type === 'item') {
          const c = rand(loot.min, loot.max)
          gains[loot.key] = (gains[loot.key] || 0) + c
          continue
        }
        if (loot.type === 'rare_fish') {
          const fish = pickFishByRarity('rare') || pickFishByRarity('uncommon')
          if (fish) {
            fishGains[fish.key] = (fishGains[fish.key] || 0) + 1
            totalXp += Math.round((fish.xp || 10) * 1.1)
          }
          continue
        }
        if (loot.type === 'legendary_fish') {
          const fish = (Math.random() < 0.2 ? pickFishByRarity('mythic') : pickFishByRarity('legendary')) || pickFishByRarity('epic')
          if (fish) {
            fishGains[fish.key] = (fishGains[fish.key] || 0) + 1
            totalXp += Math.round((fish.xp || 20) * 1.8)
          }
          continue
        }
      }

      if (totalCoin > 0) user.coin += totalCoin
      for (const [k, v] of Object.entries(gains)) safeInc(inv, k, v)
      for (const [k, v] of Object.entries(fishGains)) safeInc(inv, k, v)

      let lvlUp = 0
      if (totalXp > 0) lvlUp = addXp(user, totalXp)

      const lines = []
      if (totalCoin > 0) lines.push(`💰 Coin: +${f(totalCoin)}`)
      for (const [k, v] of Object.entries(gains)) {
        const meta = SELL_META?.[k] || { emoji: '📦', name: k }
        lines.push(`${meta.emoji} ${meta.name}: +${v}`)
      }
      for (const [k, v] of Object.entries(fishGains)) {
        const meta = SELL_META?.[k] || { emoji: '🐟', name: k }
        lines.push(`${meta.emoji} ${meta.name}: +${v}`)
      }
      if (totalXp > 0) lines.push(`🔮 XP: +${totalXp}`)

      await reply(`🧰 *OPEN CRATE*\nCrate dibuka: *${qty}*\n\n${lines.length ? lines.join('\n') : '😅 Tidak dapat apa-apa.'}\n\n💳 Coin sekarang: *${f(user.coin)}*` + (lvlUp ? `\n✨ Naik level! Sekarang level *${user.level}*` : ''))
      saveUser(user)
      break
    }

    case 'pasar':
    case 'market': {
      await reply(`🛒 *PASAR RPG*\n\n📌 Harga jual item:\n${marketText()}\n\nContoh: *.jual padi 3* / *.jual botol all* / *.jual all*`)
      saveUser(user)
      break
    }

    case 'jual':
    case 'sell': {
      const a0 = (args?.[0] || '').toLowerCase()
      const a1 = (args?.[1] || '').toLowerCase()
      if (!a0) {
        await reply('💰 Gunakan: *.jual <item> <jumlah|all>* atau *.jual all*\nLihat harga: *.pasar*')
        saveUser(user)
        break
      }

      if (a0 === 'all') {
        let totalCoin = 0
        const soldLines = []
        for (const key of Object.keys(SELL_PRICE)) {
          const qty = inv[key] || 0
          if (qty <= 0) continue
          const info = getSellInfo(key)
          if (!info) continue
          const earn = qty * info.price
          totalCoin += earn
          safeDec(inv, key, qty)
          soldLines.push(`${info.emoji} ${info.key}: -${qty} (+${f(earn)})`)
        }
        if (totalCoin <= 0) {
          await reply('😅 Kamu tidak punya item yang bisa dijual.')
          saveUser(user)
          break
        }
        user.coin += totalCoin
        await reply(`✅ *JUAL SEMUA BERHASIL*\n\n${soldLines.join('\n')}\n\n💰 Total: *+${f(totalCoin)}* coin\n💳 Coin sekarang: *${f(user.coin)}*`)
        saveUser(user)
        break
      }

      const info = getSellInfo(a0)
      if (!info) {
        await reply(`❌ Item *${a0}* tidak bisa dijual.\nCek: *.pasar*`)
        saveUser(user)
        break
      }

      const have = inv[a0] || 0
      if (have <= 0) {
        await reply(`❌ Kamu tidak punya item *${a0}*.`)
        saveUser(user)
        break
      }

      let qty
      if (a1 === 'all') qty = have
      else {
        qty = parseCount(a1, 0)
        if (!qty || qty < 1) {
          await reply(`⚠️ Contoh: *.jual ${a0} 3* atau *.jual ${a0} all*`)
          saveUser(user)
          break
        }
      }

      qty = Math.min(qty, have)
      const earn = qty * info.price
      safeDec(inv, a0, qty)
      user.coin += earn

      await reply(`✅ *JUAL BERHASIL*\n\n${info.emoji} Item: *${info.key}* (${info.name})\n📦 Jumlah: *${qty}*\n💰 Dapat: *+${f(earn)}* coin\n\n💳 Coin sekarang: *${f(user.coin)}*`)
      saveUser(user)
      break
    }

    case 'shop': {
      const sub = (args?.[0] || '').toLowerCase()
      const item = (args?.[1] || '').toLowerCase()
      let qty = args?.[2] ? parseCount(args[2], 1) : 1
      if (qty === -1) qty = 999999

      if (!sub) {
        const lines = Object.entries(SHOP).map(([k, v]) => `${v.emoji} *${k}* — buy: ${f(v.buy)} | sell: ${f(v.sell)}\n   ${v.desc}`)
        await reply(`🛍️ *SHOP*\n\n${lines.join('\n')}` + `\n\nCara: *.shop buy <item> <qty>* / *.shop sell <item> <qty>*`)
        saveUser(user)
        break
      }

      if (!['buy', 'sell'].includes(sub)) {
        await reply('📌 Gunakan: *.shop* / *.shop buy <item> <qty>* / *.shop sell <item> <qty>*')
        saveUser(user)
        break
      }

      if (!item || !SHOP[item]) {
        await reply('⚠️ Item tidak ada. Cek: *.shop*')
        saveUser(user)
        break
      }

      qty = Math.max(1, qty)

      if (sub === 'buy') {
        const cost = SHOP[item].buy * qty
        if (user.coin < cost) {
          await reply(`❌ Coin kurang.\nButuh: *${f(cost)}* | Coin kamu: *${f(user.coin)}*`)
          saveUser(user)
          break
        }
        safeDec(user, 'coin', cost)
        safeInc(inv, item, qty)
        await reply(`✅ Beli *${item}* x${qty} (${SHOP[item].emoji})\n💰 -${f(cost)} coin\nSisa coin: *${f(user.coin)}*`)
        saveUser(user)
        break
      }

      // sell
      const have = inv[item] || 0
      if (have <= 0) {
        await reply(`❌ Kamu tidak punya *${item}*.`)
        saveUser(user)
        break
      }
      qty = Math.min(qty, have)
      const earn = SHOP[item].sell * qty
      safeDec(inv, item, qty)
      user.coin += earn
      await reply(`✅ Jual *${item}* x${qty} (${SHOP[item].emoji})\n💰 +${f(earn)} coin\nCoin sekarang: *${f(user.coin)}*`)
      saveUser(user)
      break
    }

    case 'bank': {
      const sub = (args?.[0] || '').toLowerCase()
      const amtRaw = args?.[1]
      let amt = parseCount(amtRaw, 0)
      if (amt === -1) amt = 10**15

      if (!sub) {
        await reply(`🏦 *BANK*\n\n💰 Coin: *${f(user.coin)}*\n🏦 Bank: *${f(user.bank)}*\n\nGunakan:\n• *.bank dep <jumlah|all>*\n• *.bank wd <jumlah|all>*`)
        saveUser(user)
        break
      }

      if (!['dep', 'deposit', 'wd', 'withdraw'].includes(sub)) {
        await reply('📌 Gunakan: *.bank* / *.bank dep <jumlah|all>* / *.bank wd <jumlah|all>*')
        saveUser(user)
        break
      }

      if (!amt || amt < 1) {
        await reply('⚠️ Masukkan jumlah.')
        saveUser(user)
        break
      }

      if (sub === 'dep' || sub === 'deposit') {
        amt = Math.min(amt, user.coin)
        if (amt < 1) {
          await reply('❌ Coin kamu 0.')
          saveUser(user)
          break
        }
        safeDec(user, 'coin', amt)
        user.bank += amt
        await reply(`✅ Deposit *${f(amt)}* coin ke bank.\n💰 Coin: *${f(user.coin)}*\n🏦 Bank: *${f(user.bank)}*`)
        saveUser(user)
        break
      }

      // withdraw
      amt = Math.min(amt, user.bank)
      if (amt < 1) {
        await reply('❌ Bank kamu 0.')
        saveUser(user)
        break
      }
      user.bank -= amt
      user.coin += amt
      await reply(`✅ Withdraw *${f(amt)}* coin dari bank.\n💰 Coin: *${f(user.coin)}*\n🏦 Bank: *${f(user.bank)}*`)
      saveUser(user)
      break
    }

    case 'use': {
      const itemKey = (args?.[0] || '').toLowerCase()
      let count = args?.[1] ? parseCount(args[1], 1) : 1
      if (count === -1) count = 999999
      if (!itemKey) {
        await reply('📌 Contoh: *.use potion 1*')
        saveUser(user)
        break
      }

      const owned = inv[itemKey] || 0
      if (owned <= 0) {
        await reply(`❌ Kamu tidak punya *${itemKey}*.`)
        saveUser(user)
        break
      }

      if (itemKey === 'potion') {
        const useCount = Math.min(Math.max(1, count), owned)
        safeDec(inv, 'potion', useCount)
        const heal = 30 * useCount
        const before = user.hp
        user.hp = Math.min(user.maxHp, user.hp + heal)
        await reply(`🧴 Kamu pakai *${useCount} potion*.\n❤️ HP: ${before} → ${user.hp}/${user.maxHp}`)
        saveUser(user)
        break
      }

      if (itemKey === 'coffee') {
        const useCount = Math.min(Math.max(1, count), owned)
        safeDec(inv, 'coffee', useCount)
        const gain = 2 * useCount
        const before = user.energy
        user.energy = Math.min(user.maxEnergy, user.energy + gain)
        await reply(`☕ Kamu minum *${useCount} coffee*.\n⚡ Energi: ${before} → ${user.energy}/${user.maxEnergy}`)
        saveUser(user)
        break
      }

      if (itemKey === 'bandage') {
        const useCount = Math.min(Math.max(1, count), owned)
        safeDec(inv, 'bandage', useCount)
        const heal = 15 * useCount
        const before = user.hp
        user.hp = Math.min(user.maxHp, user.hp + heal)
        await reply(`🩹 Kamu pakai *${useCount} bandage*.\n❤️ HP: ${before} → ${user.hp}/${user.maxHp}`)
        saveUser(user)
        break
      }

      if (itemKey === 'lockpick') {
        safeDec(inv, 'lockpick', 1)
        user.buffs.lockpick = (user.buffs.lockpick || 0) + 1
        await reply(`🗝️ Lockpick siap!\nBuff: +chance PVP untuk aksi berikutnya.\nSisa lockpick: ${inv.lockpick || 0}`)
        saveUser(user)
        break
      }

      if (itemKey === 'fertilizer') {
        if (!user.farm?.active) {
          await reply('🧪 Kamu belum menanam apa pun.')
          saveUser(user)
          break
        }
        const active = user.farm.active
        const seed = SEEDS[active]
        if (!seed) {
          await reply('🧪 Data kebun tidak valid.')
          saveUser(user)
          break
        }
        safeDec(inv, 'fertilizer', 1)
        const cut = Math.floor(seed.time * 0.25)
        user.farm.startedAt -= cut
        await reply(`🧪 Fertilizer dipakai!\n⏩ Panen dipercepat *25%* untuk *${active.toUpperCase()}*.`)
        saveUser(user)
        break
      }

      await reply('⚠️ Item ini belum ada efek use.')
      saveUser(user)
      break
    }

    case 'upgrade': {
      const type = (args?.[0] || '').toLowerCase()
      if (!['weapon', 'armor', 'luck'].includes(type)) {
        await reply('📌 Gunakan: *.upgrade weapon* / *.upgrade armor* / *.upgrade luck*')
        saveUser(user)
        break
      }
      const levelNow = type === 'weapon' ? user.weaponLevel : type === 'armor' ? user.armorLevel : user.luck
      const cost = 2000 + levelNow * 2500
      if (user.coin < cost) {
        await reply(`❌ Coin kurang.\nButuh: *${f(cost)}* | Coin kamu: *${f(user.coin)}*`)
        saveUser(user)
        break
      }
      safeDec(user, 'coin', cost)
      if (type === 'weapon') user.weaponLevel += 1
      else if (type === 'armor') user.armorLevel += 1
      else user.luck += 1
      await reply(`✅ Upgrade *${type}* berhasil!\nLevel sekarang: *${type === 'luck' ? user.luck : (type === 'weapon' ? user.weaponLevel : user.armorLevel)}*\n💰 -${f(cost)} coin`)
      saveUser(user)
      break
    }

    case 'craft':
    case 'buat': {
      const sub = (args?.[0] || '').toLowerCase()
      const key = (args?.[1] || '').toLowerCase()
      let qty = args?.[2] ? parseCount(args[2], 1) : 1
      if (qty === -1) qty = 999999

      if (!sub) {
        await reply('🛠️ Gunakan: *.craft list* / *.craft make <item> <jumlah>*')
        saveUser(user)
        break
      }
      if (sub === 'list') {
        await reply(`🛠️ *Daftar Craft*\n\n${craftListText()}`)
        saveUser(user)
        break
      }
      if (sub !== 'make') {
        await reply('📌 Gunakan: *.craft list* atau *.craft make <item> <jumlah>*')
        saveUser(user)
        break
      }
      if (!key || !CRAFT[key]) {
        await reply('⚠️ Item craft tidak ditemukan. Cek: *.craft list*')
        saveUser(user)
        break
      }
      qty = Math.max(1, qty)
      const recipe = CRAFT[key]

      for (const [needKey, needQty] of Object.entries(recipe.req || {})) {
        const have = inv[needKey] || 0
        if (have < needQty * qty) {
          await reply(`❌ Bahan kurang untuk craft *${key}* x${qty}\nButuh: ${needKey} x${needQty * qty}\nKamu punya: ${needKey} x${have}`)
          saveUser(user)
          return
        }
      }

      const totalCoin = (recipe.coin || 0) * qty
      if (user.coin < totalCoin) {
        await reply(`❌ Coin kurang.\nButuh: *${f(totalCoin)}* | Coin kamu: *${f(user.coin)}*`)
        saveUser(user)
        break
      }

      safeDec(user, 'coin', totalCoin)
      for (const [needKey, needQty] of Object.entries(recipe.req || {})) safeDec(inv, needKey, needQty * qty)
      for (const [outKey, outQty] of Object.entries(recipe.out || {})) safeInc(inv, outKey, outQty * qty)

      await reply(`✅ *CRAFT BERHASIL!*\n\n${recipe.emoji || '🛠️'} Item: *${key}* x${qty}\n💰 Biaya: -${f(totalCoin)} coin\n💳 Sisa coin: *${f(user.coin)}*`)
      saveUser(user)
      break
    }

    case 'transfer':
    case 'tf': {
      const target = pickTargetJid(msg, ctx, args)
      if (!target) {
        await reply('📌 Cara pakai:\n• *.transfer @user 1000*\n• *.transfer 62812xxxx 1000*\n• Reply orang lalu: *.transfer 1000*')
        saveUser(user)
        break
      }
      if (target === sender) {
        await reply('⚠️ Tidak bisa transfer ke diri sendiri.')
        saveUser(user)
        break
      }

      const amountArg = toJidFromNumber(args?.[0]) ? args?.[1] : args?.[0]
      let amount = parseCount(amountArg, 0)
      if (!amount || amount < 1) {
        await reply('⚠️ Masukkan jumlah coin. Contoh: *.transfer @user 1000*')
        saveUser(user)
        break
      }

      if (user.coin < amount) {
        await reply(`❌ Coin tidak cukup.\nCoin kamu: *${f(user.coin)}*`)
        saveUser(user)
        break
      }

      let fee = Math.ceil(amount * 0.05)
      if (fee < 10) fee = 10
      if (isOwner) fee = 0

      const received = amount - fee
      if (received < 1) {
        await reply('⚠️ Nominal terlalu kecil setelah fee.')
        saveUser(user)
        break
      }

      const targetUser = loadUser(target, 'Petualang')

      safeDec(user, 'coin', amount)
      targetUser.coin += received

      saveUser(user)
      saveUser(targetUser)

      const tag = '@' + target.split('@')[0]
      await riz.sendMessage(
        id,
        {
          text:
            `✅ *TRANSFER BERHASIL*\n\n` +
            `👤 Dari: *${nama}*\n` +
            `🎯 Ke  : ${tag}\n` +
            `💸 Nominal: *${f(amount)}*\n` +
            (fee > 0 ? `🧾 Fee Admin: *${f(fee)}*\n` : '') +
            `📥 Diterima: *${f(received)}*\n\n` +
            `💰 Sisa coin kamu: *${f(user.coin)}*`,
          contextInfo: { mentionedJid: [target] }
        },
        { quoted: qriz }
      )
      break
    }

    case 'merampok':
    case 'rob': {
      const lock = isLockedPvp(user)
      if (!lock.ok) {
        const label = lock.type === 'jail' ? '🚔 Kamu lagi ditahan warga.' : '🤕 Kamu masih luka-luka.'
        await reply(`${label}\nTunggu *${formatMs(lock.remaining)}* lagi.`)
        saveUser(user)
        break
      }
      if (user.hp <= 0) {
        await reply('💤 Kamu pingsan. Pakai *.use potion* dulu.')
        saveUser(user)
        break
      }
      const cd = useCooldown(user, 'rob', PVP.ROB_CD)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja merampok.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        saveUser(user)
        break
      }
      if (user.energy < PVP.ROB_ENERGY) {
        await reply(`⚡ Energi kurang (butuh ${PVP.ROB_ENERGY}).`)
        saveUser(user)
        break
      }

      const targetJid = pickTargetJid(msg, ctx, args)
      if (!targetJid) {
        await reply('📌 Cara pakai:\n• *.merampok @user*\n• *.merampok 62812xxxx*\n• Reply orang lalu: *.merampok*')
        saveUser(user)
        break
      }
      if (targetJid === sender) {
        await reply('⚠️ Tidak bisa merampok diri sendiri.')
        saveUser(user)
        break
      }
      const target = loadUser(targetJid, 'Korban')
      regenEnergy(target)
      if (target.coin < PVP.ROB_MIN_TARGET_COIN) {
        await reply('😅 Target terlalu miskin buat dirampok.')
        saveUser(user)
        break
      }

      user.energy -= PVP.ROB_ENERGY
      const luckMul = computeLuckMul(user)
      const attPow = powerAttack(user)
      const defPow = powerDefense(target)
      let chance = pvpChance(attPow, defPow, luckMul)

      const lp = user.buffs?.lockpick || 0
      if (lp > 0) {
        chance = Math.min(0.95, chance + 0.12)
        user.buffs.lockpick = lp - 1
      }

      const success = Math.random() < chance
      if (success) {
        const percent = rand(6, 12)
        let steal = Math.floor(target.coin * (percent / 100))
        steal = clamp(steal, 120, 250000)
        steal = Math.min(steal, target.coin)
        safeDec(target, 'coin', steal)
        user.coin += steal
        const xpGain = Math.round((rand(12, 22) + user.level * 2) * luckMul)
        const lvlUp = addXp(user, xpGain)
        await reply(`🕵️ *MERAMPOK BERHASIL!*\n\n🎯 Target: *${target.name || 'Korban'}*\n💸 Mencuri: *${f(steal)}* coin\n🔮 XP: +${xpGain}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
        saveUser(user)
        saveUser(target)
        break
      }

      const effDefSelf = computeEffectiveDefense(user)
      const rawDmg = rand(14, 30) + Math.floor(user.level / 2)
      const dmg = Math.max(6, rawDmg - effDefSelf * 2)
      user.hp = Math.max(0, user.hp - dmg)
      user.jailUntil = Date.now() + PVP.ROB_JAIL
      const fine = Math.min(user.coin, rand(40, 160))
      safeDec(user, 'coin', fine)
      await reply(`🚔 *MERAMPOK GAGAL!*\n\n💢 Damage: -${dmg} HP\n` + (fine ? `💸 Denda: -${f(fine)} coin\n` : '') + `⛓️ Ditahan: *${formatMs(PVP.ROB_JAIL)}*\n\n❤️ HP: ${user.hp}/${user.maxHp}\n⚡ Energi: ${user.energy}/${user.maxEnergy}`)
      saveUser(user)
      break
    }

    case 'begal': {
      const lock = isLockedPvp(user)
      if (!lock.ok) {
        const label = lock.type === 'jail' ? '🚔 Kamu lagi ditahan warga.' : '🤕 Kamu masih luka-luka.'
        await reply(`${label}\nTunggu *${formatMs(lock.remaining)}* lagi.`)
        saveUser(user)
        break
      }
      if (user.hp <= 0) {
        await reply('💤 Kamu pingsan. Pakai *.use potion* dulu.')
        saveUser(user)
        break
      }
      const cd = useCooldown(user, 'begal', PVP.BEGAL_CD)
      if (!cd.ok) {
        await reply(`⏳ Kamu baru saja begal.\nTunggu *${formatMs(cd.remaining)}* lagi.`)
        saveUser(user)
        break
      }
      if (user.energy < PVP.BEGAL_ENERGY) {
        await reply(`⚡ Energi kurang (butuh ${PVP.BEGAL_ENERGY}).`)
        saveUser(user)
        break
      }
      const hasSword = (inv.sword || 0) > 0 || (user.weaponLevel || 0) > 0
      if (!hasSword) {
        await reply('🔒 Begal butuh minimal punya *Sword* atau *Weapon Upgrade*.')
        saveUser(user)
        break
      }

      const targetJid = pickTargetJid(msg, ctx, args)
      if (!targetJid) {
        await reply('📌 Cara pakai:\n• *.begal @user*\n• *.begal 62812xxxx*\n• Reply orang lalu: *.begal*')
        saveUser(user)
        break
      }
      if (targetJid === sender) {
        await reply('⚠️ Tidak bisa begal diri sendiri.')
        saveUser(user)
        break
      }
      const target = loadUser(targetJid, 'Korban')
      regenEnergy(target)
      if (target.coin < PVP.BEGAL_MIN_TARGET_COIN) {
        await reply('😅 Target terlalu miskin buat dibegal.')
        saveUser(user)
        break
      }

      user.energy -= PVP.BEGAL_ENERGY
      const luckMul = computeLuckMul(user)
      const attPow = powerAttack(user) + 6
      const defPow = powerDefense(target)
      let chance = clamp(pvpChance(attPow, defPow, luckMul) - 0.08, 0.05, 0.78)

      const lp = user.buffs?.lockpick || 0
      if (lp > 0) {
        chance = Math.min(0.95, chance + 0.12)
        user.buffs.lockpick = lp - 1
      }

      const success = Math.random() < chance
      if (success) {
        const percent = rand(10, 22)
        let steal = Math.floor(target.coin * (percent / 100))
        steal = clamp(steal, 250, 600000)
        steal = Math.min(steal, target.coin)
        safeDec(target, 'coin', steal)
        user.coin += steal

        const tEffDef = computeEffectiveDefense(target)
        const tRaw = rand(10, 22)
        const tDmg = Math.max(4, tRaw - tEffDef * 2)
        target.hp = Math.max(0, target.hp - tDmg)
        target.woundedUntil = Date.now() + 2 * 60 * 1000

        const xpGain = Math.round((rand(18, 35) + user.level * 3) * luckMul)
        const lvlUp = addXp(user, xpGain)

        await reply(`🗡️ *BEGAL BERHASIL!*\n\n🎯 Target: *${target.name || 'Korban'}*\n💸 Rampas: *${f(steal)}* coin\n💢 Target terluka: -${tDmg} HP\n🔮 XP: +${xpGain}\n⚡ Energi: ${user.energy}/${user.maxEnergy}` + (lvlUp ? `\n\n✨ Naik level! Sekarang level *${user.level}*` : ''))
        saveUser(user)
        saveUser(target)
        break
      }

      const effDefSelf = computeEffectiveDefense(user)
      const rawDmg = rand(22, 45) + user.level
      const dmg = Math.max(12, rawDmg - effDefSelf * 2)
      user.hp = Math.max(0, user.hp - dmg)
      user.jailUntil = Date.now() + PVP.BEGAL_JAIL
      user.woundedUntil = Date.now() + 2 * 60 * 1000
      const fine = Math.min(user.coin, rand(120, 450))
      safeDec(user, 'coin', fine)

      await reply(`🚨 *BEGAL GAGAL!*\n\n💢 Damage: -${dmg} HP\n` + (fine ? `💸 Denda: -${f(fine)} coin\n` : '') + `⛓️ Ditahan: *${formatMs(PVP.BEGAL_JAIL)}*\n🤕 Luka: *2 menit*\n\n❤️ HP: ${user.hp}/${user.maxHp}\n⚡ Energi: ${user.energy}/${user.maxEnergy}`)
      saveUser(user)
      break
    }
    
    case 'toprpg': {
  try {
    const files = fs.readdirSync(RPG_DIR).filter(f => f.endsWith('.json'))
    if (!files.length) {
      await reply('📊 Belum ada data player.')
      break
    }

    const players = []

    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(RPG_DIR, file)))
        players.push({
          id: data.id,
          name: data.name || 'Petualang',
          level: data.level || 1,
          xp: data.xp || 0,
          coin: data.coin || 0
        })
      } catch {}
    }

    players.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level
      if (b.xp !== a.xp) return b.xp - a.xp
      return b.coin - a.coin
    })

    const top = players.slice(0, 10)

    let text = `🏆 *TOP 10 RPG PLAYER*\n\n`

    top.forEach((p, i) => {
      const medal =
        i === 0 ? '🥇' :
        i === 1 ? '🥈' :
        i === 2 ? '🥉' : '🎖️'

      text += `${medal} *#${i + 1}* ${p.name}\n`
      text += `   🏅 Lv ${p.level} | 🔮 XP ${p.xp} | 💰 ${f(p.coin)}\n\n`
    })

    await reply(text.trim())
  } catch (e) {
    console.error('TopRPG Error:', e)
    await reply('❌ Gagal memuat leaderboard.')
  }

  break
}

    default: {
      await reply('❓ Perintah RPG tidak dikenali.')
      saveUser(user)
      break
    }
  }
}
