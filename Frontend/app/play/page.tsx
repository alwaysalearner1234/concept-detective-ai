"use client";

import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "../../lib/api";
import { useAuth } from "../../components/AuthProvider";
import {
  Difficulty,
  EvaluationResult,
  MysteryCase,
  ReportResponse,
  Topic,
} from "../../lib/types";

import TopicDifficultySelect from "../../components/TopicDifficultySelect";
import LoadingDetective from "../../components/LoadingDetective";
import ErrorBanner from "../../components/ErrorBanner";
import ProgressBar from "../../components/ProgressBar";
import CaseBriefing from "../../components/CaseBriefing";
import QuestionPanel from "../../components/QuestionPanel";
import FeedbackPanel from "../../components/FeedbackPanel";
import ReportDashboard from "../../components/ReportDashboard";

type Screen = "select" | "loading_case" | "playing" | "feedback" | "loading_report" | "report" | "error";

export default function PlayPage() {
  const { user, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>("select");
  const [errorMessage, setErrorMessage] = useState("");
  const [lastAction, setLastAction] = useState<(() => void) | null>(null);

  const [mysteryCase, setMysteryCase] = useState<MysteryCase | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  function fail(err: unknown, retry: () => void) {
    setErrorMessage(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    setLastAction(() => retry);
    setScreen("error");
  }

  async function handleStart(topic: Topic, diff: Difficulty) {
    setDifficulty(diff);
    setScreen("loading_case");
    try {
      const data = await api.generateMystery(topic, diff);
      setMysteryCase(data);
      setHint(null);
      setHintsUsed(0);
      setScreen("playing");
    } catch (err) {
      fail(err, () => handleStart(topic, diff));
    }
  }

  async function handleSubmit(answer: string, reasoning: string) {
    if (!mysteryCase) return;
    setSubmitting(true);
    try {
      const result = await api.submitAnswer(
        mysteryCase.session_id,
        mysteryCase.current_question.id,
        answer,
        reasoning
      );
      setEvaluation(result);
      setScreen("feedback");
    } catch (err) {
      fail(err, () => handleSubmit(answer, reasoning));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestHint() {
    if (!mysteryCase) return;
    setHintLoading(true);
    try {
      const res = await api.getHint(mysteryCase.session_id, mysteryCase.current_question.id);
      setHint(res.hint);
      setHintsUsed(res.hints_used);
    } catch (err) {
      fail(err, handleRequestHint);
    } finally {
      setHintLoading(false);
    }
  }

  async function handleContinue() {
    if (!mysteryCase || !evaluation) return;

    if (evaluation.case_solved) {
      setScreen("loading_report");
      try {
        const rep = await api.generateReport(mysteryCase.session_id);
        setReport(rep);
        setScreen("report");
      } catch (err) {
        fail(err, handleContinue);
      }
      return;
    }

    setMysteryCase({
      ...mysteryCase,
      current_question: evaluation.next_question!,
      stage: evaluation.stage,
      score: evaluation.score,
      difficulty: evaluation.new_difficulty,
    });
    setHint(null);
    setEvaluation(null);
    setScreen("playing");
  }

  function handlePlayAgain() {
    setMysteryCase(null);
    setEvaluation(null);
    setReport(null);
    setHint(null);
    setHintsUsed(0);
    setScreen("select");
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between border-b border-noir-600 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-detective text-sm text-slate-400 hover:text-amber-400">
              &larr; Headquarters
            </Link>
            {user && (
              <>
                <span className="text-slate-600 text-xs">|</span>
                <span className="text-xs text-slate-400 font-detective font-bold uppercase tracking-wider">
                  Det. {user.name}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-detective text-xs text-slate-500 bg-noir-800 border border-noir-600 px-2 py-0.5 rounded">
              {mysteryCase?.mode === "mock" ? "DEMO MODE" : mysteryCase?.mode === "live" ? "LIVE AI" : "SECURE SESSION"}
            </span>
            {user && (
              <button
                onClick={logout}
                className="text-xs text-crime-400 hover:text-crime-500 font-detective border border-crime-500/30 hover:border-crime-500/60 rounded px-2.5 py-1 bg-crime-500/5 transition-all active:scale-95"
              >
                Sign Out
              </button>
            )}
          </div>
        </header>

        {screen === "select" && <TopicDifficultySelect onStart={handleStart} />}

        {screen === "loading_case" && <LoadingDetective label="Assembling your case file..." />}

        {screen === "error" && (
          <ErrorBanner message={errorMessage} onRetry={lastAction ?? undefined} />
        )}

        {(screen === "playing" || screen === "feedback") && mysteryCase && (
          <div className="space-y-6">
            <ProgressBar
              stage={mysteryCase.stage}
              totalStages={mysteryCase.total_stages}
              score={mysteryCase.score}
              difficulty={difficulty}
            />
            <CaseBriefing
              title={mysteryCase.title}
              setting={mysteryCase.setting}
              briefing={mysteryCase.briefing}
              suspects={mysteryCase.suspects}
              clues={mysteryCase.clues}
            />

            {screen === "playing" && (
              <QuestionPanel
                key={mysteryCase.current_question.id}
                question={mysteryCase.current_question}
                onSubmit={handleSubmit}
                submitting={submitting}
                hint={hint}
                onRequestHint={handleRequestHint}
                hintLoading={hintLoading}
                hintsUsed={hintsUsed}
              />
            )}

            {screen === "feedback" && evaluation && (
              <FeedbackPanel result={evaluation} onContinue={handleContinue} />
            )}
          </div>
        )}

        {screen === "loading_report" && <LoadingDetective label="Writing your learning report..." />}

        {screen === "report" && report && (
          <ReportDashboard report={report} onPlayAgain={handlePlayAgain} />
        )}
      </div>
    </main>
  );
}
