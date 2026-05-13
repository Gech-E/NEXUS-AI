"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Sparkles, MessageSquare, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const ROLE_SUGGESTIONS: Record<string, { title: string, subtitle: string }[]> = {
  FOUNDER: [
    { title: "Validate Idea", subtitle: "Help me evaluate my startup concept" },
    { title: "Pitch Deck", subtitle: "How do I build a winning deck?" },
    { title: "Metrics & MVP", subtitle: "What should I track for my MVP?" },
    { title: "PMF Strategy", subtitle: "How do I find product-market fit?" },
  ],
  MENTOR: [
    { title: "First Session", subtitle: "How to structure a mentorship intro" },
    { title: "Evaluate Startups", subtitle: "Questions to ask founders" },
    { title: "Give Feedback", subtitle: "Best practices for constructive advice" },
  ],
  INVESTOR: [
    { title: "Evaluate PMF", subtitle: "Metrics indicating strong PMF" },
    { title: "Market Sizing", subtitle: "How to evaluate TAM/SAM/SOM" },
    { title: "Risk Analysis", subtitle: "Key red flags in early-stage startups" },
  ],
  ADMIN: [
    { title: "Engagement", subtitle: "How can I improve platform usage?" },
    { title: "Community", subtitle: "Good community-building strategies?" },
  ],
};

export default function ChatbotPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const userRole = (session?.user as any)?.role || "FOUNDER";
  const suggestions = ROLE_SUGGESTIONS[userRole] || ROLE_SUGGESTIONS.FOUNDER;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || trimmed.length < 2) return;

    const userMsg: Message = { role: "user", content: trimmed, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || data.error, createdAt: new Date().toISOString() },
      ]);
    } catch (e: any) {
      toast.error("Failed to connect to Nexus AI.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I am having trouble connecting to my knowledge base right now. Please check your API keys or try again later.", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col relative max-w-5xl mx-auto pb-4">
      
      {/* Ambient Orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6 px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Nexus AI Assistant</h1>
            <p className="text-xs text-white/50">Your 24/7 AI-powered startup advisor</p>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/60 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </div>
      </div>

      {/* Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl p-4 md:p-6 mb-6 custom-scrollbar flex flex-col gap-6">
        
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)] relative">
              <Sparkles className="w-10 h-10 text-indigo-400 relative z-10" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-3xl animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-white">How can I help you today?</h2>
            <p className="text-white/50 mb-10 max-w-md text-sm leading-relaxed">
              I'm an expert startup advisor trained on the Nexus knowledge base. Ask me about your business model, metrics, or pitch deck.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => sendMessage(s.title + ": " + s.subtitle)}
                  className="group flex flex-col items-start text-left p-4 rounded-2xl transition-all duration-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                >
                  <span className="text-sm font-semibold text-white/90 group-hover:text-indigo-300 transition-colors flex items-center gap-2 mb-1">
                    <MessageSquare className="w-4 h-4 text-indigo-400/70" />
                    {s.title}
                  </span>
                  <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                    {s.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
              msg.role === "user" 
                ? "bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/10" 
                : "bg-slate-800 border border-indigo-500/30 text-indigo-400"
            }`}>
              {msg.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-xl shadow-indigo-500/20" 
                : "bg-slate-800/80 backdrop-blur-sm border border-white/10 text-white/90 rounded-tl-sm shadow-xl"
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className={`text-[10px] mt-2 opacity-50 flex items-center gap-1 ${msg.role === "user" ? "justify-end text-indigo-100" : "text-white/40"}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 max-w-[85%] animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-800/80 backdrop-blur-sm border border-white/10 shadow-xl flex items-center gap-2">
              <div className="flex gap-1.5 py-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl blur-xl -z-10" />
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-end gap-2 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask Nexus AI about your startup..."
            disabled={loading}
            rows={1}
            className="w-full bg-transparent text-white placeholder-white/30 resize-none px-4 py-3 outline-none min-h-[50px] max-h-[150px] text-sm"
            style={{ fieldSizing: "content" } as any}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || input.trim().length < 2}
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-white/30 text-white transition-all disabled:border disabled:border-white/5"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-white/30">AI can make mistakes. Verify important information.</span>
        </div>
      </div>

    </div>
  );
}
