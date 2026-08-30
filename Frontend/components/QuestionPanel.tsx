"use client";

import { useState } from "react";
import { QuestionOut } from "../lib/types";

export default function QuestionPanel({
  question,
  onSubmit,
  submitting,
  hint,
  onRequestHint,
  hintLoading,
  hintsUsed,
}: {
  question: QuestionOut;
  onSubmit: (answer: string, reasoning: string) => void;
  submitting: boolean;
  hint: string | null;
  onRequestHint: () => void;
  hintLoading: boolean;
  hintsUsed: number;
}) {
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");

  const canSubmit = answer.trim().length > 0 && !submitting;

  return (
    <div className="case-card p-6 animate-fade-in-up" key={question.id}>
      <p className="text-xs uppercase tracking-widest text-crime-400">Detective&apos;s Question</p>
      <h3 className="mt-2 text-lg font-medium leading-snug text-slate-100">{question.prompt}</h3>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Your Answer
          </label>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="What do you conclude?"
            className="mt-1 w-full rounded-lg border border-noir-600 bg-noir-900 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none ring-amber-400/40 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Explain your reasoning{" "}
            <span className="normal-case text-slate-600">(this is what the AI actually grades)</span>
          </label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Walk through why the evidence points there..."
            rows={3}
            className="mt-1 w-full resize-none rounded-lg border border-noir-600 bg-noir-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none ring-amber-400/40 focus:ring-2"
          />
        </div>
      </div>

      {hint && (
        <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-200 animate-fade-in-up">
          💡 {hint}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          disabled={!canSubmit}
          onClick={() => onSubmit(answer, reasoning)}
          className="btn-primary"
        >
          {submitting ? "Analyzing..." : "Submit Deduction"}
        </button>
        <button disabled={hintLoading} onClick={onRequestHint} className="btn-secondary text-sm">
          {hintLoading ? "Thinking..." : `Request Hint${hintsUsed ? ` (${hintsUsed} used)` : ""}`}
        </button>
      </div>
    </div>
  );
}
