import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = path.join(__dirname, "quotesislamic.json");

export default function getRandomQuotesIslam() {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const list = JSON.parse(raw);

    if (!Array.isArray(list) || list.length === 0) return null;

    const random = list[Math.floor(Math.random() * list.length)];
    return random;
  } catch (e) {
    console.error("❌ ERROR QUOTES ISLAM:", e.message);
    return null;
  }
}
