import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function YupraUploader(input) {
  let fileStream;
  let tempFilePath = null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    if (Buffer.isBuffer(input)) {
      tempFilePath = path.join(
        __dirname,
        "temp_upload_" + Date.now()
      );
      fs.writeFileSync(tempFilePath, input);
      fileStream = fs.createReadStream(tempFilePath);

    } else if (typeof input === "string") {
      if (!fs.existsSync(input)) {
        throw new Error("File not found");
      }
      fileStream = fs.createReadStream(input);

    } else {
      throw new Error("Invalid input type");
    }

    const form = new FormData();
    form.append("files", fileStream);

    const res = await fetch("https://cdn.yupra.my.id/upload", {
      method: "POST",
      body: form,
      signal: controller.signal,
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }

    const json = await res.json();

    if (!json.success || !json.files?.length) {
      throw new Error("Invalid response from server");
    }

    const file = json.files[0];

    return {
      filename: file.filename,
      size: file.size,
      url: "https://cdn.yupra.my.id" + file.url
    };

  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Upload timeout (15 detik)");
    }
    console.error("Yupra Upload Error:", e.message);
    throw new Error("Failed to upload to Yupra: " + e.message);

  } finally {
    clearTimeout(timeoutId);
    
    try {
      if (fileStream?.destroy) fileStream.destroy();
    } catch {}

    if (tempFilePath) {
      fs.unlink(tempFilePath, () => {});
    }
  }
}