"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, FileText, ArrowLeft, Loader2, Sparkles, TrendingUp, Users } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Link from "next/link";
import { toast } from "sonner";

export default function ExportDueDiligencePage() {
  const params = useParams();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch(`/api/ideas/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setStartup(data);
        setLoading(false);
      });
  }, [params.id]);

  const handleExport = async () => {
    if (!reportRef.current || !startup) return;
    setExporting(true);
    toast.info("Generating PDF...");
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${startup.name}_Due_Diligence_Report.pdf`);
      toast.success("Export successful!");
    } catch (error) {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-500)]" /></div>;
  if (!startup) return <div className="text-center p-12">Startup not found</div>;

  const evaluation = startup.evaluations?.[0];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-sm flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={handleExport} disabled={exporting} className="btn-primary flex items-center gap-2">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Export PDF
        </button>
      </div>

      {/* Printable Report Container */}
      <div ref={reportRef} className="bg-white text-slate-900 p-8 rounded-xl shadow-lg print-container">
        {/* Header */}
        <div className="border-b pb-6 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">{startup.name}</h1>
            <p className="text-slate-600 text-lg">{startup.tagline}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-500">NEXUS AI SCORE</div>
            <div className="text-4xl font-black text-indigo-600">{evaluation?.nexusScore || "N/A"}</div>
          </div>
        </div>

        {/* Basics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Industry</div>
            <div className="font-medium">{startup.industry}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Stage</div>
            <div className="font-medium">{startup.stage.replace("_", " ")}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Seeking</div>
            <div className="font-medium">${(startup.fundingSeeking || 0).toLocaleString()}</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Team Size</div>
            <div className="font-medium">{startup.teamSize}</div>
          </div>
        </div>

        {/* Problem/Solution */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-indigo-900">
            <FileText className="w-5 h-5 text-indigo-500" /> Executive Summary
          </h2>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <strong className="block text-slate-900 mb-1">The Problem:</strong>
              <p>{startup.problem}</p>
            </div>
            <div>
              <strong className="block text-slate-900 mb-1">The Solution:</strong>
              <p>{startup.solution}</p>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {evaluation && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-900">
                <Sparkles className="w-5 h-5 text-indigo-500" /> AI Evaluation Breakdown
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Market", val: evaluation.marketScore },
                  { label: "Uniqueness", val: evaluation.uniquenessScore },
                  { label: "Execution", val: evaluation.executionScore },
                  { label: "Viability", val: evaluation.viabilityScore },
                  { label: "Team Fit", val: evaluation.teamFitScore },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-indigo-600">{s.val || 0}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* SWOT */}
            {evaluation.swotAnalysis && (
              <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                <div className="p-4 border rounded-lg bg-emerald-50 border-emerald-100">
                  <strong className="text-emerald-800 block mb-2">Strengths</strong>
                  <ul className="list-disc pl-4 space-y-1 text-emerald-900">
                    {(evaluation.swotAnalysis as any).strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div className="p-4 border rounded-lg bg-rose-50 border-rose-100">
                  <strong className="text-rose-800 block mb-2">Weaknesses</strong>
                  <ul className="list-disc pl-4 space-y-1 text-rose-900">
                    {(evaluation.swotAnalysis as any).weaknesses?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-12 pt-6 border-t text-center text-xs text-slate-400">
          Generated by Nexus AI Incubation Platform on {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {/* Required for jsPDF formatting when dark mode is active to ensure the text stays readable */}
      <style dangerouslySetInnerHTML={{__html: `
        .print-container { color: #0f172a !important; }
        .print-container h1, .print-container h2, .print-container strong { color: #0f172a !important; }
        .print-container p { color: #334155 !important; }
      `}} />
    </div>
  );
}
