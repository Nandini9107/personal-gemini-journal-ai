import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { JournalEditor } from "./components/JournalEditor";
import { JournalViewer } from "./components/JournalViewer";
import { JournalHistory } from "./components/JournalHistory";
import { GeminiChatModal } from "./components/GeminiChatModal";
import { JournalEntry } from "./types";
import { journalService } from "./firebase/journalService";
import { AlertCircle, RefreshCw } from "lucide-react";

type AppView = "dashboard" | "new" | "view" | "history";

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryToEdit, setEntryToEdit] = useState<JournalEntry | null>(null);

  // Gemini Chat Modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });
  const [insertedText, setInsertedText] = useState<string | null>(null);

  // Initial prompt if user clicked "Write on this" from dashboard
  const [prefilledContent, setPrefilledContent] = useState<string | null>(null);

  // Real-time Firestore subscription to user's isolated entries
  useEffect(() => {
    if (!user) {
      setEntries([]);
      setEntriesLoading(false);
      return;
    }

    setEntriesLoading(true);
    setEntriesError(null);

    const unsubscribe = journalService.subscribeEntries(
      user.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setEntriesLoading(false);
      },
      (err) => {
        console.error("Firestore subscription error:", err);
        setEntriesError("Unable to load reflections from Firestore. Check your connection.");
        setEntriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Keep selectedEntry synced if updated in real-time
  useEffect(() => {
    if (selectedEntry) {
      const updated = entries.find((e) => e.id === selectedEntry.id);
      if (updated) {
        setSelectedEntry(updated);
      }
    }
  }, [entries, selectedEntry]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-600">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium tracking-wide text-slate-700">Initializing Gemini Journal...</p>
      </div>
    );
  }

  // If unauthenticated, show Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // Navigation handlers
  const handleNavigate = (view: "dashboard" | "new" | "history") => {
    if (view === "new") {
      setEntryToEdit(null);
      setPrefilledContent(null);
    }
    setCurrentView(view);
  };

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setCurrentView("view");
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEntryToEdit(entry);
    setCurrentView("new");
  };

  const handleSaveSuccess = (savedId: string) => {
    const saved = entries.find((e) => e.id === savedId);
    if (saved) {
      setSelectedEntry(saved);
      setCurrentView("view");
    } else {
      setCurrentView("dashboard");
    }
  };

  const handleStartWithPrompt = (promptText: string) => {
    setEntryToEdit(null);
    setPrefilledContent(`**Today's Prompt:** "${promptText}"\n\n`);
    setCurrentView("new");
  };

  const handleOpenCompanionChat = (context?: { title: string; content: string }) => {
    if (context) {
      setChatContext(context);
    } else {
      setChatContext({ title: "", content: "" });
    }
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-500/20">
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenChat={() => handleOpenCompanionChat()}
      />

      {/* Error alert if Firestore error occurs */}
      {entriesError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{entriesError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === "dashboard" && (
          <Dashboard
            entries={entries}
            onNewEntry={() => handleNavigate("new")}
            onSelectEntry={handleSelectEntry}
            onViewAllHistory={() => setCurrentView("history")}
            onOpenCompanionChat={() => handleOpenCompanionChat()}
            onStartWithPrompt={handleStartWithPrompt}
          />
        )}

        {currentView === "new" && (
          <JournalEditor
            userId={user.uid}
            entryToEdit={
              entryToEdit ||
              (prefilledContent
                ? {
                    id: "",
                    userId: user.uid,
                    title: "",
                    content: prefilledContent,
                    wordCount: 0,
                    createdAt: "",
                    updatedAt: "",
                  }
                : null)
            }
            onSaveSuccess={handleSaveSuccess}
            onCancel={() => setCurrentView("dashboard")}
            onOpenCompanionChat={handleOpenCompanionChat}
            insertedText={insertedText}
            onClearInsertedText={() => setInsertedText(null)}
          />
        )}

        {currentView === "view" && selectedEntry && (
          <JournalViewer
            entry={selectedEntry}
            userId={user.uid}
            onBack={() => setCurrentView("dashboard")}
            onEdit={handleEditEntry}
            onDeleted={() => {
              setSelectedEntry(null);
              setCurrentView("dashboard");
            }}
            onOpenCompanionChat={handleOpenCompanionChat}
          />
        )}

        {currentView === "history" && (
          <JournalHistory
            entries={entries}
            userId={user.uid}
            onSelectEntry={handleSelectEntry}
            onEditEntry={handleEditEntry}
            onNewEntry={() => handleNavigate("new")}
          />
        )}
      </main>

      {/* Gemini Conversational Companion Modal */}
      <GeminiChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onInsertText={(text) => {
          setInsertedText(text);
          if (currentView !== "new") {
            setCurrentView("new");
          }
        }}
        currentDraftContext={chatContext}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
