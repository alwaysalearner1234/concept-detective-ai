import type {
  Difficulty,
  EvaluationResult,
  HintResponse,
  MysteryCase,
  ReportResponse,
  Topic,
  User,
  AuthResponse,
} from "./types";

const LOCAL_API_URL = "http://localhost:8000";
const PRODUCTION_API_URL = "https://concept-detect-api.onrender.com";

function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
  ) {
    return LOCAL_API_URL;
  }

  return PRODUCTION_API_URL;
}

const API_URL = getApiUrl();

let authToken: string | null = null;
if (typeof window !== "undefined") {
  authToken = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
}

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  let res: Response;
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      "Can't reach the detective backend. Is the FastAPI server running?"
    );
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore parse failure */
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  setToken: (token: string | null, rememberMe: boolean = false) => {
    authToken = token;
    if (typeof window !== "undefined") {
      if (token) {
        if (rememberMe) {
          localStorage.setItem("auth_token", token);
          sessionStorage.removeItem("auth_token");
        } else {
          sessionStorage.setItem("auth_token", token);
          localStorage.removeItem("auth_token");
        }
      } else {
        localStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_token");
      }
    }
  },

  login: (req: any) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  register: (req: any) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    }),

  me: () =>
    request<User>("/api/auth/me", {
      method: "GET",
    }),

  forgotPassword: (email: string) =>
    request<{ message: string; demo_code?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (req: any) =>
    request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  generateMystery: (topic: Topic, difficulty: Difficulty) =>
    request<MysteryCase>("/api/mystery/generate", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty }),
    }),

  submitAnswer: (session_id: string, question_id: string, answer: string, reasoning: string) =>
    request<EvaluationResult>("/api/answer/submit", {
      method: "POST",
      body: JSON.stringify({ session_id, question_id, answer, reasoning }),
    }),

  getHint: (session_id: string, question_id: string) =>
    request<HintResponse>("/api/hint", {
      method: "POST",
      body: JSON.stringify({ session_id, question_id }),
    }),

  generateReport: (session_id: string) =>
    request<ReportResponse>("/api/report/generate", {
      method: "POST",
      body: JSON.stringify({ session_id }),
    }),
};

export { ApiError };
