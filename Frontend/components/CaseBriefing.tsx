"use client";

import { useState } from "react";
import { Clue } from "../lib/types";

export default function CaseBriefing({
  title,
  setting,
  briefing,
  suspects,
  clues,
}: {
  title: string;
  setting: string;
  briefing: string;
  suspects: string[];
  clues: Clue[];
}) {
  const [openClue, setOpenClue] = useState<string | null>(clues[0]?.id ?? null);

  return (
    <div className="case-card p-6 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-crime-400">Case File</p>
          <h2 className="font-detective text-2xl text-slate-50">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{setting}</p>
        </div>
        <span className="hidden text-4xl sm:block">🕵️</span>
      </div>

      <p className="mt-4 border-l-2 border-amber-400/50 pl-4 text-sm leading-relaxed text-slate-300">
        {briefing}
      </p>

      {suspects.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suspects.map((s) => (
            <span key={s} className="chip border-noir-600 text-slate-400">
              {s}
            </span>
          ))}
        </div>
      )}

      <h3 className="mt-6 font-detective text-sm uppercase tracking-widest text-amber-400">
        Evidence Board
      </h3>
      <div className="mt-3 space-y-2">
        {clues.map((clue) => {
          const open = openClue === clue.id;
          return (
            <div
              key={clue.id}
              className="rounded-lg border border-noir-600 bg-noir-900/60 transition-all"
            >
              <button
                onClick={() => setOpenClue(open ? null : clue.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <span className="text-amber-400">📌</span> {clue.title}
                </span>
                <span className="text-slate-500">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="border-t border-noir-600 px-4 py-3 text-sm animate-fade-in-up">
                  <p className="text-slate-300">{clue.content}</p>
                  <p className="mt-2 text-xs italic text-amber-400/80">
                    Why it matters: {clue.concept_link}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
