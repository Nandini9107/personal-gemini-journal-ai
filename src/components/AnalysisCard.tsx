import React from "react";
import { Sparkles, HelpCircle, Tag, Heart, Lightbulb, MessageSquarePlus } from "lucide-react";
import { AIAnalysis } from "../types";

interface AnalysisCardProps {
  analysis: AIAnalysis;
  onAnswerQuestion?: (question: string) => void;
  compact?: boolean;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onAnswerQuestion,
  compact = false,
}) => {
  const {
    mood,
    moodEmoji = "✨",
    sentimentScore,
    themes = [],
    reflectionQuestions = [],
    aiSummary,
    keyInsights = [],
  } = analysis;

  return (
    <div
      id="gemini-analysis-card"
      className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Header with Mood & Sentiment */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Gemini AI Reflection
            </h4>
            <span className="text-xs text-slate-500">
              Emotional tone, themes & guided inquiries
            </span>
          </div>
        </div>

        {/* Mood Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
            <span className="text-sm">{moodEmoji}</span>
            <span>{mood}</span>
          </div>

          {sentimentScore !== undefined && (
            <div
              className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium border border-slate-200 text-slate-600"
              title="Emotional Sentiment Score (1-10)"
            >
              Tone: <span className="text-indigo-600 font-semibold">{sentimentScore}/10</span>
            </div>
          )}
        </div>
      </div>

      {/* Empathetic AI Summary */}
      {aiSummary && (
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
            <Heart className="w-3.5 h-3.5" />
            <span>Essence of Your Reflection</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed italic font-sans">
            &ldquo;{aiSummary}&rdquo;
          </p>
        </div>
      )}

      {/* Themes */}
      {themes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span>Identified Themes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {themes.map((theme, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold hover:bg-blue-100/70 transition-colors"
              >
                #{theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3 Reflection Questions (Core Requirement with design theme left-accent) */}
      {reflectionQuestions.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Reflection Questions</span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              3 curated questions
            </span>
          </div>

          <div className="space-y-2.5">
            {reflectionQuestions.map((q, idx) => (
              <div
                key={idx}
                className="group p-3.5 rounded-xl bg-slate-50 border border-slate-200 border-l-3 border-l-indigo-600 hover:bg-slate-100/70 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {q}
                  </p>
                </div>

                {onAnswerQuestion && (
                  <button
                    onClick={() => onAnswerQuestion(q)}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors opacity-80 group-hover:opacity-100"
                    title="Write an answer into this journal entry"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights / Takeaways if available and not compact */}
      {!compact && keyInsights && keyInsights.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Key Takeaways</span>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600">
            {keyInsights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-indigo-500 mt-1">&bull;</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
