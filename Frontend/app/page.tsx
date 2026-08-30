"use client";

import Link from "next/link";
import { TOPIC_ICONS, TOPIC_LABELS } from "../lib/types";
import { useAuth } from "../components/AuthProvider";

export default function LandingPage() {
  const { user, logout } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-spotlight" />

      {/* Authenticated User Header */}
      <header className="absolute top-0 right-0 left-0 flex items-center justify-between px-6 py-4 animate-fade-in-up z-50">
        <div className="font-detective text-xs text-slate-500 uppercase tracking-widest">
          Clearance: Level 1
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 font-detective">
              Det. {user.name}
            </span>
            <button
              onClick={logout}
              className="text-xs text-crime-400 hover:text-crime-500 font-detective border border-crime-500/30 hover:border-crime-500/60 rounded px-2.5 py-1 bg-crime-500/5 transition-all active:scale-95"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-6 flex items-center gap-2 chip border-amber-400/30 text-amber-400 animate-fade-in-up">
          <span>🔍</span> AI-Powered Educational Mystery Game
        </div>

        <h1 className="font-detective text-4xl leading-tight text-slate-50 sm:text-6xl animate-fade-in-up">
          CONCEPT <span className="text-amber-400 animate-flicker">DETECTIVE</span>
        </h1>
        <p className="mt-2 font-detective text-sm uppercase tracking-[0.3em] text-crime-400 animate-fade-in-up">
          Every case has a concept to crack
        </p>

        <p className="mt-6 max-w-2xl text-balance text-slate-400 sm:text-lg animate-fade-in-up">
          Forget memorizing answers. Step into the role of a detective and solve real mysteries by
          <span className="text-slate-200"> applying what you know</span> &mdash; electricity, forces,
          photosynthesis, algebra, and fractions all hide inside the evidence. Get it wrong, and the AI
          diagnoses <em>exactly</em> where your thinking went sideways.
        </p>

        <Link href="/play" className="btn-primary mt-10 text-lg animate-fade-in-up">
          Start an Investigation <span aria-hidden>&rarr;</span>
        </Link>

        <div className="mt-16 grid w-full grid-cols-2 gap-3 sm:grid-cols-5 animate-fade-in-up">
          {Object.entries(TOPIC_LABELS).map(([key, label]) => (
            <div
              key={key}
              className="case-card flex flex-col items-center gap-2 px-3 py-4 text-sm text-slate-300"
            >
              <span className="text-2xl">{TOPIC_ICONS[key as keyof typeof TOPIC_ICONS]}</span>
              {label}
            </div>
          ))}
        </div>

        <div className="mt-16 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <Feature
            title="1. Investigate"
            body="Read the case briefing, examine clues, and reason through what the evidence actually implies."
          />
          <Feature
            title="2. Get Diagnosed"
            body="Answer wrong, and the AI names your exact misconception -- not just 'incorrect'."
          />
          <Feature
            title="3. Solve & Learn"
            body="Difficulty adapts as you go, and a personalized learning report closes the case."
          />
        </div>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="case-card p-5">
      <h3 className="font-detective text-amber-400">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
    </div>
  );
}
