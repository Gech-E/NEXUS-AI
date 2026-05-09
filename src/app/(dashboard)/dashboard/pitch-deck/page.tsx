"use client";

import { useEffect, useState } from "react";
import { Presentation, Download, Loader2 } from "lucide-react";

interface Startup {
  id: string;
  name: string;
}

export default function PitchDeckPage() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        if (data.startups) {
          setStartups(data.startups);
          if (data.startups.length > 0) setSelectedStartup(data.startups[0].id);
        }
      });
  }, []);

  const downloadDeck = async () => {
    if (!selectedStartup) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pitch-deck/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: selectedStartup }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PitchDeck.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Error generating pitch deck. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Presentation className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} />
          AI Pitch Deck Generator
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Automatically generate a structured PowerPoint presentation based on your startup's profile and AI evaluation.
        </p>
      </div>

      <div className="p-6 rounded-xl space-y-6" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}>
        <div>
          <label className="block text-sm font-medium mb-2">Select Startup</label>
          <select 
            value={selectedStartup} 
            onChange={(e) => setSelectedStartup(e.target.value)}
            className="input-field w-full"
            disabled={loading}
          >
            <option value="" disabled>-- Choose a startup --</option>
            {startups.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="p-4 rounded-lg" style={{ background: "var(--bg-card)" }}>
          <h3 className="font-semibold mb-2 text-sm">Included Slides:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: "var(--text-secondary)" }}>
            <li>Title & Tagline</li>
            <li>The Problem</li>
            <li>Our Solution</li>
            <li>Target Market</li>
            <li>Business Model</li>
            <li>Nexus AI Evaluation Scores</li>
          </ul>
        </div>

        <button 
          onClick={downloadDeck}
          disabled={loading || !selectedStartup}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating .pptx...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Presentation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
