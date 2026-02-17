import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.static(__dirname)); // serves index.html

app.post("/api/analyze", async (req, res) => {
  const { crushName, clues, message } = req.body;

  if (!crushName || !clues) {
    return res.status(400).json({ error: "Missing crushName or clues." });
  }

  const prompt = `You are a witty, warm, and perceptive "crush analyzer." Someone has a crush on ${crushName} and wants to know if the feelings might be mutual.

Here's what they've noticed about ${crushName}'s behavior:
${clues}

${message ? `Here's a message or conversation they had:\n"${message}"` : ""}

Give a fun but thoughtful analysis. Be encouraging but honest. Look for patterns in the signs, comment on the conversation if provided, and give a "Vibe Score" out of 10 at the end (how likely it seems ${crushName} is interested). Keep it warm, playful, and under 200 words. Use a couple of emojis naturally. Don't use bullet points — write in flowing paragraphs.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].text;
    res.json({ prediction: text });
  } catch (err) {
    console.error("Anthropic error:", err);
    res.status(500).json({ error: "Something went wrong with the AI call." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`💌 Crush Analyzer running at http://localhost:${PORT}`));
