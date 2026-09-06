import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  PenLine,
  Sparkles,
  History,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Tag,
  Calendar,
  Smile,
  ShieldCheck,
  FileText,
  Clock,
  Lightbulb,
} from "lucide-react";
import { JournalEntry } from "../types";
import { AnalysisCard } from "./AnalysisCard";

interface DashboardProps {
  entries: JournalEntry[];
  onNewEntry: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
  onViewAllHistory: () => void;
  onOpenCompanionChat: () => void;
  onStartWithPrompt: (promptText: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  entries,
  onNewEntry,
  onSelectEntry,
  onViewAllHistory,
  onOpenCompanionChat,
  onStartWithPrompt,
}) => {
  const { user } = useAuth();

  // Time-of-day greeting
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";

  const firstName = user?.displayName?.split(" ")[0] || "Friend";

  // Mindfulness prompt of the day
  const dailyPrompts = [
    "What is one small, quiet moment from today that you want to remember?",
    "If your current feeling had a voice, what would it gently ask for right now?",
    "What is an expectation you can lovingly release before tomorrow begins?",
    "Where in your life did you notice unexpected patience or resilience recently?",
  ];
  const dailyPrompt =
    dailyPrompts[Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % dailyPrompts.length];

  // Aggregate Metrics
  const totalEntries = entries.length;
  const totalWords = entries.reduce(
    (acc, e) =>
      acc + (e.wordCount ?? (e.content ? e.content.trim().split(/\s+/).length : 0)),
    0
  );

  // Latest entry
  const latestEntry = entries.length > 0 ? entries[0] : null;

  // Most frequent mood
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  const dominantMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantMood = dominantMoodEntry ? dominantMoodEntry[0] : "Reflective";

  // Distinct themes
  const uniqueThemes = new Set<string>();
  entries.forEach((e) => {
    if (e.themes && Array.isArray(e.themes)) {
      e.themes.forEach((t) => uniqueThemes.add(t));
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Welcome & Security Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Private Firestore Vault
            </span>
            <span className="text-xs text-slate-500">
              User ID: {user?.uid.slice(0, 8)}...
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Welcome to your workspace. Your reflections are securely isolated and
            empowered with real-time Gemini AI introspection.
          </p>
        </div>

        {/* Primary CTA */}
        <button
          id="dashboard-new-entry-btn"
          onClick={onNewEntry}
          className="shrink-0 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <PenLine className="w-4 h-4" />
          <span>Write Today's Entry</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Reflections</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalEntries}</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Prevailing Mood</span>
            <p className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-[130px]">
              {totalEntries > 0 ? dominantMood : "—"}
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Themes Explored</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              {uniqueThemes.size}
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Words Penned</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalWords}</p>
          </div>
        </div>
      </div>

      {/* Daily Reflection Prompt Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Today&apos;s Mindful Prompt
            </span>
            <p className="text-sm sm:text-base text-slate-700 font-sans italic mt-0.5">
              &ldquo;{dailyPrompt}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onStartWithPrompt(dailyPrompt)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Write on this</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenCompanionChat}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Brainstorm</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Latest Entry Insight & Recent Reflections */}
      {entries.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              Begin your reflection journey
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No entries saved yet. Tap &ldquo;Write Today&apos;s Entry&rdquo; to begin. Gemini
              will automatically extract your mood, discover recurring themes, and
              curate 3 reflection prompts.
            </p>
          </div>
          <button
            onClick={onNewEntry}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <PenLine className="w-4 h-4" />
            <span>Write First Reflection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Latest Entry AI Analysis spotlight */}
          {latestEntry && (
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Real-time Insights</span>
                </h3>
                <button
                  onClick={() => onSelectEntry(latestEntry)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  View full entry &rarr;
                </button>
              </div>

              {latestEntry.mood ? (
                <AnalysisCard
                  analysis={{
                    mood: latestEntry.mood,
                    moodEmoji: latestEntry.moodEmoji,
                    sentimentScore: latestEntry.sentimentScore,
                    themes: latestEntry.themes || [],
                    reflectionQuestions: latestEntry.reflectionQuestions || [],
                    aiSummary: latestEntry.aiSummary || "",
                    keyInsights: latestEntry.keyInsights || [],
                  }}
                  compact={true}
                />
              ) : (
                <div
                  onClick={() => onSelectEntry(latestEntry)}
                  className="p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer space-y-2 shadow-xs"
                >
                  <h4 className="text-sm font-bold text-slate-900">
                    {latestEntry.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3">
                    {latestEntry.content}
                  </p>
                  <span className="text-xs text-indigo-600 font-semibold block pt-1">
                    Open to view & analyze &rarr;
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Right Column (7 cols): Recent Reflections list */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Recent Journal Entries
              </h3>
              <button
                onClick={onViewAllHistory}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all history ({entries.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => {
                const dateStr = new Date(entry.createdAt).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric" }
                );
                const words =
                  entry.wordCount ??
                  (entry.content ? entry.content.trim().split(/\s+/).length : 0);

                return (
                  <div
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-start justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-medium text-slate-600">{dateStr}</span>
                        <span>&bull;</span>
                        <span>{words} words</span>
                        {entry.mood && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-1 ml-1">
                            <span>{entry.moodEmoji || "✨"}</span>
                            <span>{entry.mood}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {entry.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {entry.aiSummary || entry.content}
                      </p>

                      {entry.themes && entry.themes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {entry.themes.slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[11px] font-medium text-blue-600"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-2 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
