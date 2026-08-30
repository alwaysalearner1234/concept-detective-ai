"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Dusting for conceptual fingerprints...",
  "Cross-examining the evidence...",
  "Consulting the case files...",
  "Connecting the clues...",
];

export default function LoadingDetective({ label }: { label?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % MESSAGES.length), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center animate-fade-in-up">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-ping rounded-full bg-amber-400/20" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl">🔍</div>
      </div>
      <p className="font-detective text-amber-400">{label || MESSAGES[i]}</p>
    </div>
  );
}
