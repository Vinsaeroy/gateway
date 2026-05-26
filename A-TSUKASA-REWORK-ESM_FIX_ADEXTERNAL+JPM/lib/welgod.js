import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Registrasi font
try {
  registerFont(path.join(__dirname, "..", "assets", "fonts", "Poppins-SemiBold.ttf"), {
    family: "Poppins-SemiBold"
  });
  registerFont(path.join(__dirname, "..", "assets", "fonts", "Poppins-Regular.ttf"), {
    family: "Poppins-Regular"
  });
  console.log("Font Poppins berhasil didaftarkan.");
} catch (e) {
  console.warn("Font Poppins tidak ditemukan, menggunakan font default:", e.message);
}

// =====================================================
// HELPER roundRect (dipanggil setelah ctx ada)
// =====================================================
function injectRoundRect(ctx) {
  ctx.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

// =====================================================
// WELCOME CANVAS
// =====================================================
export async function createWelcomeCanvas(participantName, groupName, profilePictureUrl) {
  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");
  injectRoundRect(ctx);

  const boldFont = 'bold 50px "Poppins-SemiBold", sans-serif';
  const regularFont = '25px "Poppins-Regular", sans-serif';

  // Background
const backgroundPath = path.join(__dirname, "..", "media", "banner.jpg");

try {
  const bg = await loadImage(backgroundPath);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
} catch {
  ctx.fillStyle = "#7F7F7F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

  // Kotak overlay
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.roundRect(160, 90, 960, 540, 40);
  ctx.fill();

  // Foto profil bulat
  const avatarSize = 200;
  const avatarX = canvas.width / 2;
  const avatarY = 310;
  const avatarRadius = avatarSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
  ctx.closePath();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.clip();

  try {
    const avatar = await loadImage(profilePictureUrl);
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarSize, avatarSize);
  } catch {
    ctx.fillStyle = "#ccc";
    ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarSize, avatarSize);
  }
  ctx.restore();

  ctx.font = boldFont;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(participantName, canvas.width / 2, 470);

  ctx.font = regularFont;
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText(`Di Grup ${groupName}`, canvas.width / 2, 510);

  return canvas.toBuffer("image/jpeg");
}

// =====================================================
// GOODBYE CANVAS
// =====================================================
export async function createGoodbyeCanvas(participantName, groupName, profilePictureUrl) {
  const canvas = createCanvas(1280, 720);
  const ctx = canvas.getContext("2d");
  injectRoundRect(ctx);

  const boldFont = 'bold 50px "Poppins-SemiBold", sans-serif';
  const regularFont = '25px "Poppins-Regular", sans-serif';

  // Background
  const backgroundPath = path.join(__dirname, "..", "media", "banner.jpg");

try {
  const bg = await loadImage(backgroundPath);
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
} catch {
  ctx.fillStyle = "#7F7F7F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.roundRect(160, 90, 960, 540, 40);
  ctx.fill();

  const avatarSize = 200;
  const avatarX = canvas.width / 2;
  const avatarY = 310;
  const avatarRadius = avatarSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
  ctx.closePath();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.clip();

  try {
    const avatar = await loadImage(profilePictureUrl);
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarSize, avatarSize);
  } catch {
    ctx.fillStyle = "#ccc";
    ctx.fillRect(avatarX - avatarRadius, avatarY - avatarRadius, avatarSize, avatarSize);
  }
  ctx.restore();

  ctx.font = boldFont;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText(participantName, canvas.width / 2, 470);

  ctx.font = regularFont;
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText(`Meninggalkan ${groupName}`, canvas.width / 2, 510);

  return canvas.toBuffer("image/jpeg");
}

export default {
  createWelcomeCanvas,
  createGoodbyeCanvas
};