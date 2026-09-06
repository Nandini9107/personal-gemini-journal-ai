import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  ArrowDownLeft,
  RotateCcw,
} from "lucide-react";
import { ChatMessage } from "../types";
import { geminiApi } from "../services/geminiApi";

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (text: string) => void;
  currentDraftContext?: { title: string; content: string };
}

const STARTER_PROMPTS = [
  "Help me reflect on what went well today",
  "I am feeling overwhelmed with decisions. Help me unpack this.",
  "Give me 3 deep questions to ask myself this evening",
  "Help me reframe a difficult conversation constructively",
  "I have writer's block. Give me an inspiring opening sentence.",
];

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
  currentDraftContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your Gemini Journal Companion. I am here to help you unpack raw thoughts, brainstorm ideas, reframe emotions, or explore topics deeply. What is on your mind today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const reply = await geminiApi.chatWithGemini(
        newHistory,
        currentDraftContext
      );

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I ran into an issue connecting to the reflection service. Please try asking again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content:
          "Chat reset. I am ready to explore new journal thoughts whenever you are.",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div
      id="gemini-chat-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl h-[85vh] max-h-[750px] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Gemini Journal Companion
              </h3>
              <p className="text-xs text-slate-500">
                Multi-turn brainstorming & mindful dialogue
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Draft Context Badge */}
        {currentDraftContext?.title && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center gap-2 overflow-hidden">
            <span className="shrink-0 font-bold text-indigo-600">Draft Context:</span>
            <span className="truncate italic text-slate-700">
              &ldquo;{currentDraftContext.title}&rdquo;
            </span>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed space-y-2 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white font-medium rounded-tr-none shadow-xs"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Actions for assistant responses */}
                {msg.role === "assistant" && msg.id !== "welcome" && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end gap-2 text-xs text-slate-500">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {onInsertText && (
                      <button
                        onClick={() => {
                          onInsertText(msg.content);
                          onClose();
                        }}
                        className="hover:text-indigo-700 flex items-center gap-1 transition-colors text-indigo-600 font-semibold ml-2 cursor-pointer"
                        title="Insert this reply into the journal editor"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        <span>Insert in Journal</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-sm flex items-center gap-2 rounded-tl-none">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 text-xs font-medium">Gemini is reflecting...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inspiration Pills */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] text-slate-500 shrink-0 font-medium mr-1">
            Try asking:
          </span>
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="gemini-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question, share a thought, or seek writing clarity..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />
            <button
              id="gemini-chat-send-btn"
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-40 flex items-center gap-2 shrink-0 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
