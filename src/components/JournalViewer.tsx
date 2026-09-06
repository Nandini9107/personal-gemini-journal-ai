import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Sparkles,
  Heart,
  Share2,
  Check,
  FileText,
} from "lucide-react";
import { JournalEntry, AIAnalysis } from "../types";
import { AnalysisCard } from "./AnalysisCard";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { journalService } from "../firebase/journalService";

interface JournalViewerProps {
  entry: JournalEntry;
  userId: string;
  onBack: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDeleted: () => void;
  onOpenCompanionChat: (context: { title: string; content: string }) => void;
}

export const JournalViewer: React.FC<JournalViewerProps> = ({
  entry,
  userId,
  onBack,
  onEdit,
  onDeleted,
  onOpenCompanionChat,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(Boolean(entry.favorite));

  const formattedDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(entry.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const wordCount =
    entry.wordCount ?? (entry.content ? entry.content.trim().split(/\s+/).length : 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const analysis: AIAnalysis | null = entry.mood
    ? {
        mood: entry.mood,
        moodEmoji: entry.moodEmoji || "✨",
        sentimentScore: entry.sentimentScore,
        themes: entry.themes || [],
        reflectionQuestions: entry.reflectionQuestions || [],
        aiSummary: entry.aiSummary || "",
        keyInsights: entry.keyInsights || [],
      }
    : null;

  const handleToggleFavorite = async () => {
    const nextVal = !isFavorite;
    setIsFavorite(nextVal);
    try {
      await journalService.updateEntry(userId, entry.id, {
        favorite: nextVal,
      });
    } catch (err) {
      console.warn("Failed to toggle favorite:", err);
      setIsFavorite(!nextVal);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await journalService.deleteEntry(userId, entry.id);
      setShowDeleteModal(false);
      onDeleted();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(`${entry.title}\n\n${entry.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn text-slate-900">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-sm font-semibold border border-slate-200 shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isFavorite
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600 shadow-xs"
            }`}
            title={isFavorite ? "Favorited" : "Favorite this entry"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 shadow-xs transition-colors cursor-pointer"
            title="Copy entry text"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {/* Discuss with Gemini */}
          <button
            onClick={() =>
              onOpenCompanionChat({ title: entry.title, content: entry.content })
            }
            className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Discuss this reflection with Gemini"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Discuss with Gemini</span>
          </button>

          {/* Edit */}
          <button
            id="viewer-edit-btn"
            onClick={() => onEdit(entry)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>

          {/* Delete */}
          <button
            id="viewer-delete-btn"
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-600 shadow-xs transition-colors cursor-pointer"
            title="Delete this entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Entry Header Info */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate} at {formattedTime}
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {wordCount} words
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {readingTime} min read
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {entry.title}
        </h1>
      </div>

      {/* Primary Gemini AI Reflection Card */}
      {analysis && (
        <div className="space-y-2">
          <AnalysisCard analysis={analysis} />
        </div>
      )}

      {/* Journal Body Content */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Journal Entry
        </h3>
        <div className="text-slate-800 text-base sm:text-lg leading-relaxed font-sans whitespace-pre-wrap selection:bg-indigo-500/20">
          {entry.content}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        entryTitle={entry.title}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
