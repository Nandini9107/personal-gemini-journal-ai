import { AIAnalysis, ChatMessage, WritingPrompt } from "../types";

export const geminiApi = {
  // Analyze journal entry for mood, themes, reflection questions, and summary
  async analyzeEntry(title: string, content: string): Promise<AIAnalysis> {
    const response = await fetch("/api/gemini/analyze-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Analysis failed (${response.status})`);
    }

    const data = await response.json();
    return {
      mood: data.mood || "Reflective",
      moodEmoji: data.moodEmoji || "✨",
      sentimentScore: data.sentimentScore ?? 6,
      themes: Array.isArray(data.themes) ? data.themes : [],
      reflectionQuestions: Array.isArray(data.reflectionQuestions)
        ? data.reflectionQuestions
        : [],
      aiSummary: data.aiSummary || "",
      keyInsights: Array.isArray(data.keyInsights) ? data.keyInsights : [],
    };
  },

  // Multi-turn chat with Gemini Journal Companion
  async chatWithGemini(
    messages: ChatMessage[],
    entryContext?: { title: string; content: string }
  ): Promise<string> {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        entryContext,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Chat response failed (${response.status})`);
    }

    const data = await response.json();
    return data.reply;
  },

  // Fetch contextual prompts
  async getPrompts(focus: string = "daily mindfulness"): Promise<WritingPrompt[]> {
    const response = await fetch("/api/gemini/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Prompt fetch failed (${response.status})`);
    }

    const data = await response.json();
    return data.prompts || [];
  },
};
