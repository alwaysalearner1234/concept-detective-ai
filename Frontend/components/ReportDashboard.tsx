"use client";

import Link from "next/link";
import { ReportResponse, TOPIC_LABELS } from "../lib/types";

export default function ReportDashboard({
  report,
  onPlayAgain,
}: {
  report: ReportResponse;
  onPlayAgain: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <div className="case-card overflow-hidden p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-crime-400">Case Closed</p>
        <h2 className="font-detective mt-1 text-3xl text-amber-400">{report.badge}</h2>
        <p className="mt-1 text-sm text-slate-400">{TOPIC_LABELS[report.topic]} &middot; {report.final_difficulty} difficulty</p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="Score" value={report.total_score} />
          <Stat label="Accuracy" value={`${report.accuracy}%`} />
          <Stat label="Questions" value={report.questions_answered} />
        </div>

        <p className="mt-6 text-left text-sm leading-relaxed text-slate-300">{report.narrative_summary}</p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="case-card p-5 text-left">
          <h3 className="font-detective text-sm uppercase tracking-widest text-emerald-400">Strengths</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-400">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="case-card p-5 text-left">
          <h3 className="font-detective text-sm uppercase tracking-widest text-crime-400">
            Areas to Review
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {report.areas_to_review.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-crime-400">!</span> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {report.misconceptions_detected.length > 0 && (
        <div className="case-card mt-4 p-5 text-left">
          <h3 className="font-detective text-sm uppercase tracking-widest text-amber-400">
            Misconceptions Detected This Case
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {report.misconceptions_detected.map((m, i) => (
              <li key={i}>&bull; {m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={onPlayAgain} className="btn-primary">
          Investigate Another Case
        </button>
        <Link href="/" className="btn-secondary">
          Back to Headquarters
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-noir-600 bg-noir-900/60 py-3">
      <div className="text-2xl font-semibold text-slate-50">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
