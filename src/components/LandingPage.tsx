import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Lock,
  MessageSquareHeart,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500/20">
      {/* Top Banner / Nav */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                Gemini Journal
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">
                Secure Personal Reflection & AI Introspection
              </p>
            </div>
          </div>

          <button
            id="landing-header-signin-btn"
            onClick={handleSignIn}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-300 hover:border-slate-400 shadow-xs transition-all disabled:opacity-50"
          >
            {signingIn ? (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 flex-1">
        {/* Auth Error Banner if needed */}
        {authError && (
          <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start justify-between gap-3 text-sm shadow-xs animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearAuthError}
              className="text-rose-600 hover:text-rose-800 text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Powered by Google Gemini 3.8 & Firestore Security
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Your private sanctuary for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                deep mindful reflection.
              </span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              Write freely with zero judgment. Personal Gemini Journal analyzes
              your entries for emotional mood, core psychological themes, and
              curates 3 thought-provoking reflection questions to deepen your
              self-awareness.
            </p>

            {/* Primary Sign-in Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                id="landing-hero-google-signin-btn"
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold shadow-md shadow-indigo-200 hover:shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {signingIn ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Zero setup needed. Encrypted & strictly private.
              </span>
            </div>

            {/* Pillar badges */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Private data isolation</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="font-medium">3 reflection prompts</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">Gemini companion chat</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup / Interactive Feature Preview */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Mock Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Letting Go of Perfection
                    </h3>
                    <p className="text-xs text-slate-500">Today at 8:15 AM</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <span>Peaceful & Grounded</span>
                </span>
              </div>

              {/* Mock Excerpt */}
              <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 italic">
                &ldquo;I realized today that trying to control every small outcome
                was draining all my energy. When I took a step back and went for a
                silent walk, clarity returned...&rdquo;
              </div>

              {/* Mock AI Analysis Card */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Real-time Insights
                  </span>
                  <span className="text-slate-500 text-[11px]">3 questions generated</span>
                </div>

                {/* Themes */}
                <div className="flex flex-wrap gap-1.5">
                  {["Self-Compassion", "Letting Go", "Mindful Presence"].map(
                    (theme) => (
                      <span
                        key={theme}
                        className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold border border-blue-100"
                      >
                        {theme}
                      </span>
                    )
                  )}
                </div>

                {/* Reflection Questions Sample */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                    Reflection Questions:
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 border-l-2 border-l-indigo-600 pl-3">
                      What specifically about "good enough" brings you peace right now?
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 border-l-2 border-l-indigo-600 pl-3">
                      How did stepping away from your screen physically change your perspective?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Strict User Isolation
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your journal entries are guarded by granular Firestore security
              rules. Only your verified Google account can ever query, read, or
              modify your records.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Deep Mood & Theme Analysis
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Gemini 3.8 Flash automatically extracts underlying emotional tones,
              labels recurring themes, and presents 3 tailored questions to
              deepen your introspection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Interactive Journal Companion
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Feeling stuck or overwhelmed? Brainstorm in real time with a
              multi-turn Gemini conversational partner trained specifically for
              empathetic journaling.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>
          Gemini Journal &bull; Secure full-stack architecture with
          isolated Firestore storage and server-side Gemini 3.8 Flash.
        </p>
      </footer>
    </div>
  );
};
