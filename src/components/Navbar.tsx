import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Sparkles,
  History,
  PenLine,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

interface NavbarProps {
  currentView: "dashboard" | "new" | "history" | "view";
  onNavigate: (view: "dashboard" | "new" | "history") => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenChat,
}) => {
  const { user, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          id="nav-brand-btn"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-3 text-left group transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                Gemini Journal
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-3 h-3" />
                Isolated
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Mindful reflections & AI insight
            </p>
          </div>
        </button>

        {/* Navigation Tabs */}
        {user && (
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-dashboard-btn"
              onClick={() => onNavigate("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === "dashboard"
                  ? "bg-slate-100 text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>Dashboard</span>
            </button>

            <button
              id="nav-new-entry-btn"
              onClick={() => onNavigate("new")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                currentView === "new"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
              }`}
            >
              <PenLine className="w-4 h-4" />
              <span className="hidden sm:inline">Write</span>
            </button>

            <button
              id="nav-history-btn"
              onClick={() => onNavigate("history")}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === "history"
                  ? "bg-slate-100 text-indigo-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Brainstorm Companion Trigger */}
            <button
              id="nav-chat-companion-btn"
              onClick={onOpenChat}
              className="ml-1 sm:ml-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 flex items-center gap-1.5 transition-all shadow-xs"
              title="Open Gemini Companion Chat"
            >
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="hidden md:inline">Gemini Chat</span>
            </button>

            {/* User Profile & Sign Out */}
            <div className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-2">
              <div className="flex items-center gap-2 py-1 px-2 rounded-lg bg-slate-50 border border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-6 h-6 rounded-full border border-slate-300 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700 hidden lg:inline max-w-[120px] truncate">
                  {user.displayName || "User"}
                </span>
              </div>

              <button
                id="nav-sign-out-btn"
                onClick={signOutUser}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
