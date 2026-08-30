"use client";

import { useState } from "react";
import { Difficulty, TOPIC_ICONS, TOPIC_LABELS, Topic } from "../lib/types";

const TOPICS = Object.keys(TOPIC_LABELS) as Topic[];
const DIFFICULTIES: { value: Difficulty; label: string; blurb: string }[] = [
  { value: "easy", label: "Rookie", blurb: "Straightforward clues, gentle nudge" },
  { value: "medium", label: "Detective", blurb: "Standard case, real reasoning required" },
  { value: "hard", label: "Master Sleuth", blurb: "Extra stage, subtler evidence" },
];

export default function TopicDifficultySelect({
  onStart,
}: {
  onStart: (topic: Topic, difficulty: Difficulty) => void;
}) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  return (
    <div className="mx-auto w-full max-w-3xl animate-fade-in-up">
      <h2 className="font-detective text-2xl text-slate-50">Open a New Case File</h2>
      <p className="mt-1 text-sm text-slate-400">Pick a concept to investigate, then set your difficulty.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={`case-card flex flex-col items-center gap-2 px-3 py-5 text-sm transition-all ${
              topic === t
                ? "border-amber-400 shadow-glow text-amber-400"
                : "text-slate-300 hover:border-amber-400/40"
            }`}
          >
            <span className="text-3xl">{TOPIC_ICONS[t]}</span>
            {TOPIC_LABELS[t]}
          </button>
        ))}
      </div>

      <h3 className="mt-8 font-detective text-lg text-slate-50">Difficulty</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {DIFFICULTIES.map((d) => (
          <button
            key={d.value}
            onClick={() => setDifficulty(d.value)}
            className={`case-card px-4 py-3 text-left transition-all ${
              difficulty === d.value
                ? "border-crime-500 shadow-glow-red"
                : "hover:border-crime-500/40"
            }`}
          >
            <div className="font-semibold text-slate-100">{d.label}</div>
            <div className="text-xs text-slate-400">{d.blurb}</div>
          </button>
        ))}
      </div>

      <button
        disabled={!topic}
        onClick={() => topic && onStart(topic, difficulty)}
        className="btn-primary mt-8 w-full sm:w-auto"
      >
        Open the Case File <span aria-hidden>&rarr;</span>
      </button>
    </div>
  );
}
