export const command = ["namaepep", "namaff"];

const names = [
  "꧁༺S₭Y₣Iλ༻꧂",
  "☆ƬIGEƦ☆",
  "꧁༺N๏bℓє༻꧂",
  "『ʜᴜɴᴛᴇʀ』༺ℛ🌟",
  "꧁༺Bᴜᴄᴋsʜᴏᴛ༻꧂",
  "★۝⋆ŁØŔĐ۝⋆★",
  "☬B̶L̶A̶Z̶E̶☬",
  "꧁༺MʀƬнᴜɴᴅᴇʀ༻꧂",
  "『Ƭнυи∂єя』•☠",
  "༺ɢʜᴏꜱᴛ༻",
  "꧁☆☬Ɠσηe☬☆꧂",
  "『Ƈнασѕ』",
  "꧁༺Vσятєχ༻꧂",
  "☬₦Ї₦ℑ₳☬",
  "☆Kɩɭɭɘɼ☆",
  "꧁༺Sϵϵk༻꧂",
  "₣Ɽ₳₭E₦",
  "꧁༺Ɗєѕtrσyєr༻꧂",
  "『ηя』Ꮶɩllҽr",
  "★ƬIGEƦ★",
  "꧁༺ℌɘяø༻꧂",
  "⚡Sⱥvⱥgⱥ⚡",
  "꧁☆☬Ƈlɩɱb☆꧂",
  "★ƬO҉X҉I҉C҉★",
  "꧁༺ᎶO☬D༻꧂",
  "☬₣ɤяcє☬",
  "『ᴳᴼᴰ』彡ßØ§§",
  "꧁༺Hϵανϵи༻꧂",
  "『ηя』βuℓℓy",
  "☬M̸A̸S̸T̸E̸R̸☬",
  "꧁༺P₳₮Ⱨ₳₦ⱧΔ༻꧂",
  "『Ƭнυи∂єя』•☁",
  "꧁༺₮ƖᗩŊ₲༻꧂",
  "☆Ƨɩɩcɩɑʀ☆",
  "꧁༺ᗪҽʍㄖŋ༻꧂",
  "☬MʀDᴀɴɢᴇʀ☬",
  "『ηя』Sσυℓ",
  "꧁༺F๏гɓเɗɗєи༻꧂",
  "『ᴳᵒᵈ』𝓟𝓪𝓷𝓭𝓪",
  "꧁༺Sⱥcrꀤ༻꧂",
  "⚡ƇHƠƜK⚡",
  "『ηя』ßłλ¢ķ",
  "꧁༺ร𝓱𝒶ᵈo𝔴ђu𝔫🆃êя𝒳༻꧂",
  "🅿🆁🅴🅳🅰🆃🅾🆁",
  "Ⓟⓡⓔⓓⓐⓣⓞⓡ",
  "קгє๔คՇ๏г",
  "『Ꮶɩllҽr』༺M๏ภstєr༻"
];

export default async function (m, { riz, reply, qriz, id }) {
    try {
        const r = names[Math.floor(Math.random() * names.length)];
        reply(r);
    } catch (err) {
        console.error("❌ Error namamlbb:", err);
        reply("⚠️ Gagal kirim.");
    }
}
