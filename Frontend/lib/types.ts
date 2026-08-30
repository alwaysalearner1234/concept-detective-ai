export type Topic =
  | "electricity"
  | "newtons_laws"
  | "photosynthesis"
  | "algebra"
  | "fractions";

export type Difficulty = "easy" | "medium" | "hard";

export interface Clue {
  id: string;
  title: string;
  content: string;
  concept_link: string;
}

export interface QuestionOut {
  id: string;
  prompt: string;
  stage: number;
}

export interface MysteryCase {
  session_id: string;
  topic: Topic;
  difficulty: Difficulty;
  title: string;
  setting: string;
  briefing: string;
  suspects: string[];
  clues: Clue[];
  current_question: QuestionOut;
  stage: number;
  total_stages: number;
  score: number;
  mode: "live" | "mock";
}

export interface EvaluationResult {
  correct: boolean;
  misconception: string | null;
  feedback: string;
  concept_reinforcement: string;
  score_delta: number;
  score: number;
  stage: number;
  total_stages: number;
  case_solved: boolean;
  new_difficulty: Difficulty;
  next_question: QuestionOut | null;
  culprit_reveal: string | null;
}

export interface HintResponse {
  hint: string;
  hints_used: number;
  score_penalty_applied: number;
}

export interface ReportResponse {
  topic: Topic;
  final_difficulty: Difficulty;
  total_score: number;
  accuracy: number;
  questions_answered: number;
  misconceptions_detected: string[];
  strengths: string[];
  areas_to_review: string[];
  narrative_summary: string;
  badge: string;
}

export const TOPIC_LABELS: Record<Topic, string> = {
  electricity: "Electricity & Circuits",
  newtons_laws: "Newton's Laws",
  photosynthesis: "Photosynthesis",
  algebra: "Basic Algebra",
  fractions: "Fractions",
};

export const TOPIC_ICONS: Record<Topic, string> = {
  electricity: "⚡",
  newtons_laws: "🍎",
  photosynthesis: "🌿",
  algebra: "🔢",
  fractions: "🥧",
};

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

