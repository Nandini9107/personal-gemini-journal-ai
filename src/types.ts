export interface AIAnalysis {
  mood: string;
  moodEmoji?: string;
  sentimentScore?: number;
  themes: string[];
  reflectionQuestions: string[];
  aiSummary: string;
  keyInsights?: string[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  moodEmoji?: string;
  sentimentScore?: number;
  themes?: string[];
  reflectionQuestions?: string[];
  aiSummary?: string;
  keyInsights?: string[];
  wordCount: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  favorite?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface WritingPrompt {
  title: string;
  prompt: string;
  category: string;
}
