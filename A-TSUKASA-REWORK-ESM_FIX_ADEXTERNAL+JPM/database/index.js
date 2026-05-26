import fs from "fs";
import path from "path";

const fsp = fs.promises;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeParseJSON(text, fallback) {
  try {
    const v = JSON.parse(text);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function createJsonStore(filePath, fallbackValue, { debounceMs = 1200 } = {}) {
  ensureDir(path.dirname(filePath));

  let data = fallbackValue;
  let dirty = false;
  let saving = false;
  let timer = null;

  const load = async () => {
    try {
      if (!fs.existsSync(filePath)) {
        await fsp.writeFile(filePath, JSON.stringify(fallbackValue, null, 2));
        data = fallbackValue;
        return data;
      }
      const raw = await fsp.readFile(filePath, "utf8");
      data = safeParseJSON(raw, fallbackValue);
      return data;
    } catch {
      data = fallbackValue;
      return data;
    }
  };

  const saveNow = async () => {
    if (saving) return;
    if (!dirty) return;
    saving = true;
    try {
      const tmp = `${filePath}.tmp`;
      await fsp.writeFile(tmp, JSON.stringify(data, null, 2));
      await fsp.rename(tmp, filePath);
      dirty = false;
    } catch {
    } finally {
      saving = false;
    }
  };

  const scheduleSave = () => {
    dirty = true;
    if (timer) return;
    timer = setTimeout(async () => {
      timer = null;
      await saveNow();
    }, debounceMs);
  };

  const get = () => data;

  const set = next => {
    data = next;
    scheduleSave();
    return data;
  };

  const patch = fn => {
    const res = fn(data);
    if (res !== undefined) data = res;
    scheduleSave();
    return data;
  };

  const flush = async () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    await saveNow();
  };

  return { filePath, load, get, set, patch, flush, scheduleSave };
}

const DB_DIR = "./database";

export const stores = {
  welcomer: createJsonStore(`${DB_DIR}/welcomer.json`, {})
};

export async function initDB() {
  await Promise.all(Object.values(stores).map(s => s.load()));
  return stores;
}

export function flushDB() {
  return Promise.all(Object.values(stores).map(s => s.flush()));
}

process.on("SIGINT", async () => {
  try { await flushDB(); } finally { process.exit(0); }
});
process.on("SIGTERM", async () => {
  try { await flushDB(); } finally { process.exit(0); }
});