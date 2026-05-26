import fs from "fs";
import path from "path";
import FormData from "form-data";
import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};

const UPLOAD_TIMEOUT = 15000;

export default async function QuaxUpload(buffer, filename = null) {
  try {
    if (!buffer || buffer.length === 0) throw new Error("Buffer cannot be empty");

    const type = await fileTypeFromBuffer(buffer);
    if (!type) throw new Error("Unrecognized file format");

    let fileStream;
    let tempFilePath = null;

    if (Buffer.isBuffer(buffer)) {
      tempFilePath = path.join(__dirname, "temp_upload_" + Date.now() + "." + type.ext);
      fs.writeFileSync(tempFilePath, buffer);
      fileStream = fs.createReadStream(tempFilePath);
    } else {
      throw new Error("Invalid input type (must be Buffer)");
    }

    const form = new FormData();
    const finalFilename = filename || `upload.${type.ext}`;
    form.append("files[]", fileStream, finalFilename);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

    const res = await fetch("https://qu.ax/upload.php", {
      method: "POST",
      body: form,
      headers: {
        ...form.getHeaders(),
        ...DEFAULT_HEADERS
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Qu.ax HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data?.files?.[0]?.url) {
      throw new Error("Qu.ax invalid response format");
    }

    if (tempFilePath) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }

    return {
      fileName: data.files[0].name || finalFilename,
      url: data.files[0].url.trim().replace(/\\\//g, "/"),
      size: data.files[0].size,
      mimeType: type.mime
    };
  } catch (e) {
    console.error("Qu.ax Upload Error:", e.message);
    throw new Error("Failed to upload to Qu.ax: " + e.message);
  }
}