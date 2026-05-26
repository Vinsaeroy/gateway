// GEMINI SCRAPE BY RIZKY
import fetch from "node-fetch";
const GEMINI_API_KEY = "AIzaSyA-aK-Np6ST-onS0buxPjnWe3a9B8gRkDA";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

export async function geminiAsk(prompt) {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const json = await res.json();
    const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    return reply || "❌ Maaf, aku nggak ngerti jawabannya.";
  } catch (e) {
    console.error("Gemini Error:", e.message);
    return "❌ Error saat menghubungi AI.";
  }
}
