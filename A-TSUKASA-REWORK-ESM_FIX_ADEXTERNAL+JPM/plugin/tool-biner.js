export const command = ["txt2biner", "biner2txt"];

function textToBinary(text) {
  const buf = Buffer.from(text, "utf8");
  return Array.from(buf)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryToText(bin) {
  const cleaned = String(bin || "")
    .trim()
    .replace(/[^\d\s]/g, " ")
    .replace(/\s+/g, " ");

  if (!cleaned) throw new Error("Biner kosong.");

  let parts = cleaned.split(" ").filter(Boolean);

  if (parts.length === 1) {
    const s = parts[0].replace(/[^01]/g, "");
    if (s.length < 8) throw new Error("Biner tidak cukup (minimal 8 bit).");
    const chunks = s.match(/.{1,8}/g) || [];
    parts = chunks
      .filter((c) => c.length === 8)
      .map((c) => c);
  }

  const bytes = parts.map((p) => {
    const bits = p.replace(/[^01]/g, "");
    if (bits.length !== 8) throw new Error("Format biner harus 8 bit per byte.");
    return parseInt(bits, 2);
  });

  return Buffer.from(bytes).toString("utf8");
}

export default async function run(msg, ctx) {
  const { reply, q, command: cmd } = ctx;

  try {
    if (!q) {
      return reply(
        cmd === "txt2biner"
          ? "Contoh: .txt2biner halo dunia"
          : "Contoh: .biner2txt 01101000 01100001 01101100 01101111"
      );
    }

    if (cmd === "txt2biner") {
      const out = textToBinary(q);
      return reply(out);
    }

    const out = binaryToText(q);
    return reply(out);
  } catch (e) {
    return reply("❌ Error: " + (e?.message || String(e)));
  }
}