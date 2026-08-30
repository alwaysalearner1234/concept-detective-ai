"use client";

export default function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="case-card border-crime-500/60 flex flex-col items-start gap-3 p-5 text-sm text-slate-200 animate-fade-in-up">
      <div className="flex items-center gap-2 font-detective text-crime-400">
        <span>🚨</span> Case Interrupted
      </div>
      <p className="text-slate-400">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary">
          Try Again
        </button>
      )}
    </div>
  );
}
