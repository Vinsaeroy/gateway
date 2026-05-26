export const command = ["math", "jwb"];

const MODES = {
  easy: { time: 60000, exp: 20 },
  normal: { time: 45000, exp: 50 },
  hard: { time: 45000, exp: 120 },
  impossible: { time: 20000, exp: 300 },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function safeEvalExpr(expr) {
  return Function(`"use strict"; return (${expr});`)();
}

function genEasy() {
  const a = randInt(1, 20);
  const b = randInt(1, 20);
  const op = pick(["+", "-"]);
  const expr = `${a} ${op} ${b}`;
  const ans = safeEvalExpr(expr);
  return { expr, ans };
}

function genNormal() {
  const a = randInt(2, 30);
  const b = randInt(2, 20);
  const c = randInt(2, 12);
  const pattern = randInt(1, 2);
  let expr = "";
  if (pattern === 1) {
    const op = pick(["+", "-"]);
    expr = `(${a} ${op} ${b}) * ${c}`;
  } else {
    const op = pick(["+", "-"]);
    expr = `${a} * ${b} ${op} ${c}`;
  }
  const ans = safeEvalExpr(expr);
  return { expr, ans };
}

function genHard() {
  const pattern = randInt(1, 2);
  let expr = "";

  if (pattern === 1) {
    const a = randInt(10, 60);
    const b = randInt(2, 12);
    const c = randInt(5, 50);
    expr = `((${a} * ${b}) / ${b}) + ${c}`;
  } else {
    const a = randInt(20, 120);
    const b = randInt(2, 15);
    const c = randInt(10, 80);
    const d = randInt(2, 12);
    expr = `(${a} * ${b}) - (${c} * ${d})`;
  }

  const ans = safeEvalExpr(expr);
  return { expr, ans };
}

function genImpossible() {
  const a = randInt(15, 120);
  const b = randInt(2, 20);
  const c = randInt(10, 80);
  const d = randInt(5, 60);
  const f = randInt(10, 150);

  const numerator = (a * b) - (c + d);

  let eCandidates = [];
  for (let e = 2; e <= 20; e++) {
    if (numerator % e === 0) eCandidates.push(e);
  }

  const e = eCandidates.length ? pick(eCandidates) : 1;
  const extra = randInt(2, 12);

  const expr = `(((${a} * ${b}) - (${c} + ${d})) / ${e}) + (${f} - ${extra})`;
  const ans = safeEvalExpr(expr);
  return { expr, ans };
}

function genByMode(mode) {
  if (mode === "easy") return genEasy();
  if (mode === "normal") return genNormal();
  if (mode === "hard") return genHard();
  return genImpossible();
}

function getUserObj(sender) {
  return (
    global?.db?.data?.users?.[sender] ||
    global?.db?.users?.[sender] ||
    global?.users?.[sender] ||
    null
  );
}

function addExp(sender, amount) {
  const u = getUserObj(sender);
  if (u) {
    if (typeof u.exp !== "number") u.exp = 0;
    u.exp += amount;
    return u.exp;
  }
  return null;
}

export default async (m, { reply, riz, command, id, sender, q, msg }) => {
  try {
    global.mathQuiz = global.mathQuiz || {};
    const key = `${id}|${sender}`;
    const now = Date.now();

    if (command === "math") {
      const modeRaw = (q || "").trim().toLowerCase();
      const mode = MODES[modeRaw] ? modeRaw : null;

      if (!mode) {
        return reply(
          `Pilih mode:\n- .math easy\n- .math normal\n- .math hard\n- .math impossible`
        );
      }

      if (global.mathQuiz[key]) {
        const sisa = Math.max(
          0,
          global.mathQuiz[key].expiresAt - Date.now()
        );
        return reply(
          `Masih ada soal aktif.\nJawab: *.jwb <jawaban>*\nSisa waktu: *${Math.ceil(
            sisa / 1000
          )} detik*`
        );
      }

      const { time, exp } = MODES[mode];
      const { expr, ans } = genByMode(mode);

      if (typeof m?.Xp === "function") m.Xp();

      const timeout = setTimeout(async () => {
        if (!global.mathQuiz[key]) return;
        const data = global.mathQuiz[key];
        delete global.mathQuiz[key];

        await riz.sendMessage(
          id,
          {
            text:
              `⏰ Waktu habis!\nMode: ${data.mode}\nSoal: ${data.expr}\nJawaban: ${data.ans}`,
          },
          { quoted: msg }
        );
      }, time);

      global.mathQuiz[key] = {
        mode,
        expr,
        ans,
        exp,
        createdAt: now,
        expiresAt: now + time,
        timeout,
      };

      if (typeof m?.Xd === "function") m.Xd();

      return reply(
        `🧮 MATH QUIZ\nMode: ${mode}\nWaktu: ${Math.ceil(
          time / 1000
        )} detik\nHadiah: +${exp} EXP\n\nSoal:\n${expr}\n\nJawab: *.jwb <jawaban>*`
      );
    }

    const input = (q || "").trim();
    if (!input) return reply(`Contoh: *.jwb 42*`);

    const data = global.mathQuiz[key];
    if (!data)
      return reply(
        `Belum ada soal. Buat dulu: *.math easy/normal/hard/impossible*`
      );

    if (Date.now() > data.expiresAt) {
      clearTimeout(data.timeout);
      delete global.mathQuiz[key];
      return reply(`⏰ Telat!\nSoal: ${data.expr}\nJawaban: ${data.ans}`);
    }

    const userAns = Number(String(input).replace(",", "."));
    if (!Number.isFinite(userAns))
      return reply(`Jawaban harus angka. Contoh: *.jwb 12*`);

    if (userAns === data.ans) {
      clearTimeout(data.timeout);
      delete global.mathQuiz[key];

      if (typeof m?.Xd === "function") m.Xd();

      const newExp = addExp(sender, data.exp);
      return reply(
        `✅ BENAR!\nSoal: ${data.expr}\nJawaban: ${data.ans}\n🎁 +${data.exp} EXP` +
          (newExp !== null ? `\nTotal EXP: ${newExp}` : "")
      );
    } else {
      if (typeof m?.Xg === "function") m.Xg();
      const sisa = Math.max(0, data.expiresAt - Date.now());
      return reply(
        `❌ Salah! Coba lagi.\nSisa waktu: ${Math.ceil(
          sisa / 1000
        )} detik\nJawab: *.jwb <jawaban>*`
      );
    }
  } catch (err) {
    return reply(`Error: ${err?.message || err}`);
  }
};