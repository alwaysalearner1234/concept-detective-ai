"use client";

import { EvaluationResult } from "../lib/types";

export default function FeedbackPanel({
  result,
  onContinue,
}: {
  result: EvaluationResult;
  onContinue: () => void;
}) {
  return (
    <div
      className={`case-card p-6 animate-fade-in-up ${
        result.correct ? "border-emerald-500/40" : "border-crime-500/50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{result.correct ? "✅" : "🧩"}</span>
        <h3 className={`font-detective text-lg ${result.correct ? "text-emerald-400" : "text-crime-400"}`}>
          {result.correct ? "Correct Deduction" : "Not Quite -- Misconception Detected"}
        </h3>
      </div>

      <p className="mt-3 text-sm text-slate-300">{result.feedback}</p>

      {!result.correct && result.misconception && (
        <div className="mt-3 rounded-lg border border-crime-500/30 bg-crime-500/5 px-4 py-3 text-sm text-slate-300">
          <span className="font-semibold text-crime-400">What went sideways: </span>
          {result.misconception}
        </div>
      )}

      <div className="mt-3 rounded-lg border border-amber-400/20 bg-noir-900/60 px-4 py-3 text-sm text-slate-300">
        <span className="font-semibold text-amber-400">The concept: </span>
        {result.concept_reinforcement}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>
          {result.score_delta >= 0 ? "+" : ""}
          {result.score_delta} points &middot; running score {result.score}
        </span>
        <span className="chip border-noir-600">Adaptive difficulty: {result.new_difficulty}</span>
      </div>

      {result.case_solved && result.culprit_reveal && (
        <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
          <span className="font-detective">Case Closed: </span>
          {result.culprit_reveal}
        </div>
      )}

      <button onClick={onContinue} className="btn-primary mt-5">
        {result.case_solved ? "View Learning Report" : "Next Clue"} <span aria-hidden>&rarr;</span>
      </button>
    </div>
  );
}
