"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Users, Presentation, Briefcase, TrendingUp } from "lucide-react";

interface Startup {
  id: string;
  name: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  persona?: string;
  content: string;
  createdAt: string;
}

export default function BoardSimulationPage() {
  const { data: session } = useSession();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<string>("");
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch user startups
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        if (data.startups) {
          setStartups(data.startups);
          if (data.startups.length > 0) setSelectedStartup(data.startups[0].id);
        }
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSimulation = async () => {
    if (!selectedStartup) return;
    setLoading(true);
    try {
      const res = await fetch("/api/board-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", startupId: selectedStartup }),
      });
      const data = await res.json();
      if (data.simulation) {
        setSimulationId(data.simulation.id);
        setMessages(data.simulation.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !simulationId) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed, createdAt: new Date().toISOString() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/board-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "message", simulationId, content: trimmed }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      console.error("Failed to send");
    } finally {
      setLoading(false);
    }
  };

  const getPersonaIcon = (persona: string) => {
    if (persona === "Skeptic Investor") return <Briefcase className="w-4 h-4 text-white" />;
    if (persona === "Growth Expert") return <TrendingUp className="w-4 h-4 text-white" />;
    return <Presentation className="w-4 h-4 text-white" />;
  };

  return (
    <div className="h-[calc(100vh-130px)] flex flex-col animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} />
          AI Board Simulation
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Practice your pitch and defend your business model against an AI board of directors.
        </p>
      </div>

      {!simulationId ? (
        <div className="flex-1 rounded-xl p-8 flex flex-col items-center justify-center text-center" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 animate-pulse-glow">
            <Presentation className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to face the board?</h2>
          <p className="text-sm mb-6 max-w-md" style={{ color: "var(--text-secondary)" }}>
            Select your startup and enter the boardroom. You will be questioned by a Skeptic Investor, a Growth Expert, and a Domain Expert.
          </p>

          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-left">Select Startup</label>
              <select 
                value={selectedStartup} 
                onChange={(e) => setSelectedStartup(e.target.value)}
                className="input-field w-full"
              >
                <option value="" disabled>-- Choose a startup --</option>
                {startups.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={startSimulation}
              disabled={loading || !selectedStartup}
              className="btn-primary w-full py-3"
            >
              {loading ? "Preparing Boardroom..." : "Enter Boardroom"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto rounded-xl p-4 space-y-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
            {messages.map((msg, i) => {
              if (msg.role === "system") {
                return (
                  <div key={i} className="flex justify-center my-4">
                    <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        msg.persona === "Skeptic Investor" ? "bg-red-500" :
                        msg.persona === "Growth Expert" ? "bg-green-500" : "bg-blue-500"
                      }`}>
                        {getPersonaIcon(msg.persona || "")}
                      </div>
                      <span className="text-[10px] font-bold text-center max-w-[60px] leading-tight opacity-70">
                        {msg.persona?.split(" ")[0]}
                      </span>
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
              );
            })}
            
            {loading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
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

          <div className="mt-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="input-field flex-1"
              placeholder="Defend your business..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || input.trim().length < 2}
              className="btn-primary px-4 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
