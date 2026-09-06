import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  HelpCircle,
  Tag,
  ArrowRight,
  Edit3,
  Trash2,
  LayoutGrid,
  List,
  Clock,
  TrendingUp,
  FileText,
  Heart,
} from "lucide-react";
import { JournalEntry } from "../types";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { journalService } from "../firebase/journalService";

interface JournalHistoryProps {
  entries: JournalEntry[];
  userId: string;
  onSelectEntry: (entry: JournalEntry) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({
  entries,
  userId,
  onSelectEntry,
  onEditEntry,
  onNewEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("All");
  const [selectedTheme, setSelectedTheme] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Deletion state
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract all distinct moods and themes
  const { allMoods, allThemes, themeCounts, moodCounts } = useMemo(() => {
    const moodsSet = new Set<string>();
    const themesSet = new Set<string>();
    const tCounts: Record<string, number> = {};
    const mCounts: Record<string, number> = {};

    entries.forEach((e) => {
      if (e.mood) {
        moodsSet.add(e.mood);
        mCounts[e.mood] = (mCounts[e.mood] || 0) + 1;
      }
      if (e.themes && Array.isArray(e.themes)) {
        e.themes.forEach((t) => {
          themesSet.add(t);
          tCounts[t] = (tCounts[t] || 0) + 1;
        });
      }
    });

    return {
      allMoods: Array.from(moodsSet),
      allThemes: Array.from(themesSet),
      themeCounts: tCounts,
      moodCounts: mCounts,
    };
  }, [entries]);

  // Top themes sorted
  const topThemes = useMemo(() => {
    return Object.entries(themeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [themeCounts]);

  // Filtered & sorted entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        // Search filter
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          entry.title.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          entry.aiSummary?.toLowerCase().includes(q) ||
          entry.themes?.some((t) => t.toLowerCase().includes(q));

        // Mood filter
        const matchesMood =
          selectedMood === "All" || entry.mood === selectedMood;

        // Theme filter
        const matchesTheme =
          selectedTheme === "All" ||
          (entry.themes && entry.themes.includes(selectedTheme));

        return matchesSearch && matchesMood && matchesTheme;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [entries, searchQuery, selectedMood, selectedTheme, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await journalService.deleteEntry(userId, entryToDelete.id);
      setEntryToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Personal Reflection History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and trace your psychological patterns and Gemini AI insights
          </p>
        </div>

        <button
          id="history-write-new-btn"
          onClick={onNewEntry}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Write New Entry</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* AI Insights & Themes Trend Summary Bar */}
      {entries.length > 0 && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Personal Reflection Insights & Patterns</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Top Themes */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Most Frequent Themes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topThemes.length > 0 ? (
                  topThemes.map(([theme, count]) => (
                    <button
                      key={theme}
                      onClick={() =>
                        setSelectedTheme(selectedTheme === theme ? "All" : theme)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        selectedTheme === theme
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>#{theme}</span>
                      <span
                        className={`text-[10px] px-1 rounded-full ${
                          selectedTheme === theme
                            ? "bg-indigo-800 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No themes detected yet</span>
                )}
              </div>
            </div>

            {/* Dominant Moods */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Dominant Mood States
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(moodCounts)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([mood, count]) => (
                    <button
                      key={mood}
                      onClick={() =>
                        setSelectedMood(selectedMood === mood ? "All" : mood)
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        selectedMood === mood
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{mood}</span>
                      <span
                        className={`text-[10px] px-1 rounded-full ${
                          selectedMood === mood
                            ? "bg-indigo-800 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="history-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, emotions, themes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Sort & View Mode Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            <div className="flex items-center rounded-xl bg-slate-100 border border-slate-200 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white text-indigo-600 shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Mood:</span>
          </div>

          <button
            onClick={() => setSelectedMood("All")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              selectedMood === "All"
                ? "bg-indigo-600 text-white"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            All Moods
          </button>

          {allMoods.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedMood === mood
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {mood}
            </button>
          ))}

          {selectedTheme !== "All" && (
            <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
              <span>Theme: #{selectedTheme}</span>
              <button
                onClick={() => setSelectedTheme("All")}
                className="hover:text-indigo-900 font-bold ml-1 cursor-pointer"
              >
                &times;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Entries List / Grid */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {entries.length === 0
              ? "No journal entries written yet"
              : "No reflections match your filters"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {entries.length === 0
              ? "Your private sanctuary awaits. Start by creating your first mindful journal entry."
              : "Try clearing your search query or selecting 'All' in the filter pills."}
          </p>
          {entries.length === 0 && (
            <button
              onClick={onNewEntry}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Write First Reflection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => {
            const dateStr = new Date(entry.createdAt).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric", year: "numeric" }
            );
            const words =
              entry.wordCount ??
              (entry.content ? entry.content.trim().split(/\s+/).length : 0);

            return (
              <div
                key={entry.id}
                className="group rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md flex flex-col justify-between transition-all hover:-translate-y-0.5 space-y-4 cursor-pointer"
                onClick={() => onSelectEntry(entry)}
              >
                <div className="space-y-3">
                  {/* Top Metadata & Mood */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>

                    {entry.mood && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
                        <span>{entry.moodEmoji || "✨"}</span>
                        <span>{entry.mood}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {entry.title}
                  </h3>

                  {/* AI Summary or Content snippet */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3">
                    {entry.aiSummary
                      ? `"${entry.aiSummary}"`
                      : entry.content}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Themes */}
                  {entry.themes && entry.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.themes.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-medium text-blue-600"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Stats & Actions */}
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{words} words</span>
                      {entry.reflectionQuestions &&
                        entry.reflectionQuestions.length > 0 && (
                          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
                            <HelpCircle className="w-3 h-3" />
                            <span>3 questions</span>
                          </span>
                        )}
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEditEntry(entry)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEntryToDelete(entry)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredEntries.map((entry) => {
            const dateStr = new Date(entry.createdAt).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric", year: "numeric" }
            );

            return (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{dateStr}</span>
                    {entry.mood && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                        {entry.moodEmoji || "✨"} {entry.mood}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {entry.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-1 font-sans">
                    {entry.aiSummary || entry.content}
                  </p>
                </div>

                <div
                  className="flex items-center gap-3 shrink-0 self-end sm:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEntryToDelete(entry)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectEntry(entry)}
                    className="p-2 rounded-lg text-slate-400 group-hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <DeleteConfirmModal
          isOpen={Boolean(entryToDelete)}
          entryTitle={entryToDelete.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setEntryToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};
