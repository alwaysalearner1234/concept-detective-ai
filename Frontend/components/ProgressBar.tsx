"use client";

export default function ProgressBar({
  stage,
  totalStages,
  score,
  difficulty,
}: {
  stage: number;
  totalStages: number;
  score: number;
  difficulty: string;
}) {
  const pct = Math.min(100, Math.round(((stage - 1) / totalStages) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Stage {stage} of {totalStages}
        </span>
        <span className="chip border-noir-600 text-slate-300">{difficulty}</span>
        <span className="text-amber-400">Score: {score}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-noir-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-crime-500 to-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
