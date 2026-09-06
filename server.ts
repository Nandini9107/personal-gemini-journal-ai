import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy GoogleGenAI client getter
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check route
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Gemini Analysis API: Analyzes mood, themes, reflection questions, and summary
app.post("/api/gemini/analyze-entry", async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Entry content is required for AI analysis." });
    }

    const ai = getGeminiClient();

    const prompt = `You are an empathetic, insightful psychological reflection and journaling expert.
Analyze the following personal journal entry:

Title: ${title || "Untitled"}
Content:
${content}

Provide an analysis with:
1. "mood": A concise 1-3 word primary emotional mood (e.g., "Deeply Grateful", "Reflective & Calm", "Cautiously Optimistic", "Overwhelmed & Seeking Balance", "Creative & Energized").
2. "moodEmoji": A single appropriate emoji representing this mood (e.g. "🌱", "🌊", "✨", "☕", "🌤️", "🔥").
3. "sentimentScore": A number from 1 to 10 evaluating overall emotional tone (1=heavy/challenging, 5=neutral/exploratory, 10=ecstatic/thriving).
4. "themes": An array of 3 to 5 core themes or topic tags (e.g., ["Personal Growth", "Career Transitions", "Mindfulness", "Interpersonal Relationships"]).
5. "reflectionQuestions": An array of exactly 3 deep, thought-provoking, compassionate open-ended reflection questions for the author to contemplate next.
6. "aiSummary": A 2-3 sentence empathetic summary highlighting the core feelings, discoveries, or tensions expressed.
7. "keyInsights": An array of 2 to 3 actionable, comforting, or clarifying takeaways.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mood: { type: Type.STRING, description: "Primary emotional mood state" },
            moodEmoji: { type: Type.STRING, description: "A single representative emoji" },
            sentimentScore: { type: Type.NUMBER, description: "Sentiment score 1-10" },
            themes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Core themes detected in the entry",
            },
            reflectionQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 deep reflection questions",
            },
            aiSummary: { type: Type.STRING, description: "Empathetic 2-3 sentence summary" },
            keyInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 key takeaways or perspectives",
            },
          },
          required: ["mood", "moodEmoji", "themes", "reflectionQuestions", "aiSummary"],
        },
      },
    });

    const rawText = response.text || "{}";
    const parsed = JSON.parse(rawText);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/gemini/analyze-entry:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze journal entry with Gemini.",
    });
  }
});

// Gemini Multi-turn Chat API for Brainstorming & Journaling
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  try {
    const { messages, entryContext } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    let systemInstruction = `You are "Gemini Journal Companion", a warm, mindful, and insightful personal journaling partner.
Your role is to help the user reflect, unblock creative or emotional hurdles, brainstorm new journal entries, explore feelings, and organize thoughts.
Guidelines:
- Keep your tone conversational, deeply empathetic, gentle, and psychologically safe.
- Ask clarifying, open-ended questions that encourage self-reflection.
- You can suggest writing prompts, help structure draft paragraphs, or offer constructive perspectives.
- Keep answers focused and digestible (typically 1-3 short paragraphs), unless the user asks for a detailed breakdown or full draft.
- Never be dismissive or prescriptive; validate their feelings.`;

    if (entryContext?.title || entryContext?.content) {
      systemInstruction += `\n\nCurrent Journal Draft Context:
Title: ${entryContext.title || "Untitled"}
Content: ${entryContext.content || "(empty draft)"}`;
    }

    // Format contents for @google/genai format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    return res.json({
      reply: response.text || "I am here with you. What else is on your mind today?",
    });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    return res.status(500).json({
      error: error?.message || "Failed to communicate with Gemini assistant.",
    });
  }
});

// Gemini Journaling Prompts Inspiration API
app.post("/api/gemini/prompts", async (req: Request, res: Response) => {
  try {
    const { focus } = req.body; // e.g. "morning", "evening", "gratitude", "growth", "anxiety", "free"
    const ai = getGeminiClient();

    const prompt = `Generate 4 diverse, inspiring, and thoughtful journal writing prompts tailored for the category: "${focus || "daily mindful reflection"}".
Return a JSON array of objects, each containing:
- "title": Short catchy prompt title (e.g., "Unpacking Quiet Joy", "The Conversation Left Unsaid")
- "prompt": The writing question or guided exercise (2-3 sentences)
- "category": Category name`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              prompt: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["title", "prompt", "category"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || "[]");
    return res.json({ prompts: parsed });
  } catch (error: any) {
    console.error("Error in /api/gemini/prompts:", error);
    return res.status(500).json({
      error: error?.message || "Failed to fetch inspiration prompts.",
    });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Personal Gemini Journal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
