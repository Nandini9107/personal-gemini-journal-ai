import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Save,
  ArrowLeft,
  Lightbulb,
  Check,
  AlertCircle,
  Clock,
  FileText,
  HelpCircle,
  Flame,
} from "lucide-react";
import { JournalEntry, AIAnalysis, WritingPrompt } from "../types";
import { AnalysisCard } from "./AnalysisCard";
import { geminiApi } from "../services/geminiApi";
import { journalService } from "../firebase/journalService";

interface JournalEditorProps {
  userId: string;
  entryToEdit?: JournalEntry | null;
  onSaveSuccess: (savedEntryId: string) => void;
  onCancel: () => void;
  onOpenCompanionChat: (context: { title: string; content: string }) => void;
  insertedText?: string | null;
  onClearInsertedText?: () => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
  userId,
  entryToEdit,
  onSaveSuccess,
  onCancel,
  onOpenCompanionChat,
  insertedText,
  onClearInsertedText,
}) => {
  const [title, setTitle] = useState(entryToEdit?.title || "");
  const [content, setContent] = useState(entryToEdit?.content || "");
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(
    entryToEdit?.mood
      ? {
          mood: entryToEdit.mood,
          moodEmoji: entryToEdit.moodEmoji || "✨",
          sentimentScore: entryToEdit.sentimentScore ?? 5,
          themes: entryToEdit.themes || [],
          reflectionQuestions: entryToEdit.reflectionQuestions || [],
          aiSummary: entryToEdit.aiSummary || "",
          keyInsights: entryToEdit.keyInsights || [],
        }
      : null
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [showPrompts, setShowPrompts] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // Handle external text insertion from Gemini Chat Companion
  useEffect(() => {
    if (insertedText) {
      setContent((prev) => (prev ? `${prev}\n\n${insertedText}` : insertedText));
      onClearInsertedText?.();
    }
  }, [insertedText, onClearInsertedText]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Run Gemini Analysis
  const handleAnalyze = async () => {
    if (!content.trim()) {
      setErrorMessage("Please write some thoughts before requesting an AI analysis.");
      return;
    }

    setErrorMessage(null);
    setAnalyzing(true);

    try {
      const result = await geminiApi.analyzeEntry(title, content);
      setAnalysis(result);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setErrorMessage(
        err.message || "Failed to analyze entry with Gemini. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  // Save Entry (with automatic analysis if not run yet, or saving existing analysis)
  const handleSave = async (forceAnalyzeFirst: boolean = false) => {
    if (!content.trim() && !title.trim()) {
      setErrorMessage("Please enter a title or content to save your entry.");
      return;
    }

    setErrorMessage(null);
    setSaving(true);

    try {
      let currentAnalysis = analysis;

      // If user wants full analysis or hasn't analyzed yet and has content
      if (forceAnalyzeFirst && !currentAnalysis && content.trim().length > 20) {
        setAnalyzing(true);
        try {
          currentAnalysis = await geminiApi.analyzeEntry(title, content);
          setAnalysis(currentAnalysis);
        } catch (analyzeErr) {
          console.warn("AI analysis skipped due to error:", analyzeErr);
        } finally {
          setAnalyzing(false);
        }
      }

      if (entryToEdit) {
        // Update existing entry
        await journalService.updateEntry(userId, entryToEdit.id, {
          title: title.trim() || "Untitled Reflection",
          content,
          analysis: currentAnalysis || undefined,
        });
        onSaveSuccess(entryToEdit.id);
      } else {
        // Create new entry
        const created = await journalService.createEntry(userId, {
          title: title.trim() || "Untitled Reflection",
          content,
          analysis: currentAnalysis || undefined,
        });
        onSaveSuccess(created.id);
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(
        err.message || "Failed to save journal entry to Firestore. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Answer a reflection question by inserting it into editor
  const handleAnswerQuestion = (question: string) => {
    const promptBlock = `\n\n> **Reflecting on:** "${question}"\n\n`;
    setContent((prev) => prev + promptBlock);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Fetch Inspiration Prompts
  const handleFetchPrompts = async (category: string = "mindfulness") => {
    setLoadingPrompts(true);
    setShowPrompts(true);
    try {
      const fetched = await geminiApi.getPrompts(category);
      setPrompts(fetched);
    } catch (err) {
      console.warn("Failed to fetch prompts:", err);
    } finally {
      setLoadingPrompts(false);
    }
  };

  const handleSelectPrompt = (p: WritingPrompt) => {
    if (!title) setTitle(p.title);
    setContent((prev) => (prev ? `${prev}\n\n**${p.prompt}**\n\n` : `**${p.prompt}**\n\n`));
    setShowPrompts(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Return without saving"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {entryToEdit ? "Edit Journal Entry" : "New Journal Entry"}
            </h2>
            <p className="text-xs text-slate-500">
              Your words are private and isolated in Firestore
            </p>
          </div>
        </div>

        {/* Word Count / Reading Time indicator */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {readingTime} min read
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Ask Companion */}
          <button
            id="editor-open-companion-btn"
            onClick={() => onOpenCompanionChat({ title, content })}
            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Brainstorm with Gemini</span>
          </button>

          {/* Inspiration Prompts */}
          <button
            id="editor-prompts-btn"
            onClick={() => handleFetchPrompts("gratitude and mindfulness")}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Inspiration Prompts</span>
          </button>
        </div>

        {/* Save & Analyze Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="editor-analyze-btn"
            onClick={handleAnalyze}
            disabled={analyzing || !content.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            title="Extract mood, themes, and 3 reflection questions"
          >
            {analyzing ? (
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>{analysis ? "Re-Analyze" : "Analyze with Gemini"}</span>
          </button>

          <button
            id="editor-save-btn"
            onClick={() => handleSave(true)}
            disabled={saving || analyzing || (!content.trim() && !title.trim())}
            className="px-5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Entry</span>
          </button>
        </div>
      </div>

      {/* Prompts Drawer if requested */}
      {showPrompts && (
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>Gemini Writing Inspiration</span>
            </div>
            <button
              onClick={() => setShowPrompts(false)}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Close
            </button>
          </div>

          {loadingPrompts ? (
            <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Generating thoughtful prompts...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prompts.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPrompt(p)}
                  className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {p.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">#{p.category}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {p.prompt}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title Input */}
      <div className="space-y-1">
        <input
          id="journal-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title your reflection... (e.g. Navigating Transition, A Quiet Morning)"
          className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 font-bold text-lg sm:text-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all"
        />
      </div>

      {/* Content Textarea */}
      <div className="space-y-1">
        <textarea
          id="journal-content-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Let your thoughts flow freely here without judgment. What happened today? What feelings are surfacing? What did you notice?"
          rows={14}
          className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 text-base leading-relaxed focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs transition-all font-sans resize-y"
        />
      </div>

      {/* Analysis Section Preview */}
      {analyzing && (
        <div className="p-8 rounded-xl bg-white border border-indigo-200 text-center space-y-3 shadow-xs animate-pulse">
          <div className="w-10 h-10 mx-auto rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Gemini is reflecting on your entry...
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Extracting emotional mood, identifying recurring life themes, and framing 3
            personalized reflection questions.
          </p>
        </div>
      )}

      {!analyzing && analysis && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Real-time Entry Insights</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Will be saved with this entry
            </span>
          </div>

          <AnalysisCard
            analysis={analysis}
            onAnswerQuestion={handleAnswerQuestion}
          />
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {!analysis && content.trim().length > 20 && (
            <button
              onClick={() => handleSave(true)}
              disabled={saving || analyzing}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold border border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Analyze & Save</span>
            </button>
          )}

          <button
            onClick={() => handleSave(false)}
            disabled={saving || analyzing || (!content.trim() && !title.trim())}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>Save Reflection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
