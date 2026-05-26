import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "ceritahoror.json");

export default function getRandomCeritaHoror() {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const list = JSON.parse(raw);

    if (!Array.isArray(list) || list.length === 0) return null;

    const random = list[Math.floor(Math.random() * list.length)];
    return random;
  } catch (e) {
    console.error("❌ ERROR CERITA HOROR:", e.message);
    return null;
  }
}
