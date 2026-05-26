function parseNumbers(text = "") {
  const nums = String(text).match(/-?\d+(\.\d+)?/g);
  if (!nums || nums.length < 2) return null;

  const a = Number(nums[0]);
  const b = Number(nums[1]);

  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return { a, b };
}

function fmt(n) {
  if (!Number.isFinite(n)) return String(n);
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(10))).replace(/\.0+$/, "");
}

export const command = ["tambah", "kurang", "kali", "bagi"];

export default async function kalkulator(msg, ctx) {
  const { command, q } = ctx;

  const parsed = parseNumbers(q);
  if (!parsed) {
    return ctx.reply(
      `❌ Format salah.\n\nContoh:\n.tambah 10 5\n.kurang 10 5\n.kali 10 5\n.bagi 10 5\n\nBoleh juga:\n.tambah 10+5\n.bagi 10/2`
    );
  }

  const { a, b } = parsed;

  let hasil;
  if (command === "tambah") hasil = a + b;
  else if (command === "kurang") hasil = a - b;
  else if (command === "kali") hasil = a * b;
  else if (command === "bagi") {
    if (b === 0) return ctx.reply("❌ Tidak bisa bagi 0.");
    hasil = a / b;
  }

  const simbol =
    command === "tambah" ? "+" : command === "kurang" ? "-" : command === "kali" ? "×" : "÷";

  return ctx.reply(`🧮 ${fmt(a)} ${simbol} ${fmt(b)} = *${fmt(hasil)}*`);
}