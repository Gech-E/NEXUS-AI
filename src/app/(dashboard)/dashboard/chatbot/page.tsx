"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input/Input";
import { Button } from "@/components/ui/Button/Button";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const ROLE_SUGGESTIONS: Record<string, string[]> = {
  FOUNDER: [
    "Help me validate my startup idea",
    "How do I build a pitch deck?",
    "What metrics should I track for my MVP?",
    "How do I find product-market fit?",
  ],
  MENTOR: [
    "How can I structure a first mentorship session?",
    "What questions should I ask to evaluate a startup's progress?",
    "Best practices for giving constructive feedback",
  ],
  INVESTOR: [
    "What metrics indicate strong product-market fit?",
    "How to evaluate a startup's TAM/SAM/SOM",
    "Key red flags in early-stage startups",
  ],
  ADMIN: [
    "How can I improve platform engagement?",
    "What are some good community-building strategies?",
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
    if (!trimmed || loading || trimmed.length < 2 || !/[a-zA-Z0-9]/.test(trimmed)) return;

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
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, createdAt: new Date().toISOString() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", createdAt: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} />
          Nexus AI Assistant
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Your 24/7 AI-powered assistant tailored for your role.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-xl p-4 space-y-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4 animate-pulse-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold mb-2">How can I help you today?</h2>
            <p className="text-sm mb-6 max-w-md" style={{ color: "var(--text-secondary)" }}>
              I can assist you with your tasks, provide tailored advice, and help you get the most out of Nexus platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestions.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-left text-sm p-3 rounded-lg transition-all hover:scale-[1.02]"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] p-3 rounded-xl text-sm leading-relaxed ${
              msg.role === "user" ? "gradient-bg text-white" : ""
            }`} style={msg.role === "assistant" ? { background: "var(--bg-card)", border: "1px solid var(--border-primary)" } : undefined}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-sm font-medium" style={{ background: "var(--color-brand-600)" }}>
                {session?.user?.name?.[0] || "U"}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="p-3 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-brand-500)", animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-brand-500)", animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--color-brand-500)", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
          className="flex-1"
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || input.trim().length < 2}
          className="px-4"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
