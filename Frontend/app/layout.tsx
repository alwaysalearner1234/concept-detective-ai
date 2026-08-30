import type { Metadata } from "next";
import { AuthProvider } from "../components/AuthProvider";
import "./globals.css";

// NOTE: We intentionally use system font stacks (defined in tailwind.config.ts
// as `font-detective` / `font-body`) instead of next/font/google. This keeps
// `npm run build` fully offline-safe -- no dependency on fetching fonts from
// Google at build time, which matters in sandboxed/CI/hackathon wifi conditions.

export const metadata: Metadata = {
  title: "Concept Detective AI",
  description: "Solve mysteries. Apply concepts. Think like a detective.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

