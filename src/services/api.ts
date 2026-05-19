import Cookies from "js-cookie";

const BASE_URL = "http://127.0.0.1:8000";

/**
 * Centralized API fetch wrapper.
 * - Attaches Authorization header from cookie automatically.
 * - On 401, clears the cookie and reloads to the login page.
 * - Passes AbortSignal through for request cancellation.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = Cookies.get("token");

  const isFormData =
    options.body instanceof FormData ||
    options.body instanceof URLSearchParams;

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  // ── 401 interceptor ──────────────────────────────────────────────────────
  // Token expired or invalid — clear session and redirect to login.
  if (res.status === 401) {
    Cookies.remove("token");
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.startsWith("/")) {
      window.location.href = "/";
    } else if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    let errorMessage = "API Error";
    try {
      const errorData = await res.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // fallback to status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json();
};

// ── Domain helpers ────────────────────────────────────────────────────────

export const getDashboard = async (_token: string) => apiFetch("/dashboard");

export const getWorkloadData = async (_token: string) => apiFetch("/workload");

/**
 * Fetch projects for the current user.
 * The backend scopes results by role using the JWT — no email param needed.
 */
export const getMyProjects = async (_token: string, _email: string) =>
  apiFetch("/projects?page=1&limit=100");

export const getMyTasks = async (_token: string, projectIds: number[]) => {
  if (projectIds.length === 0) return [];
  const allTasks = await Promise.all(
    projectIds.map((id) => apiFetch(`/projects/${id}/tasks`))
  );
  return allTasks.flat();
};

export const updateTaskStatus = async (
  _token: string,
  taskId: number,
  status: string
) =>
  apiFetch(`/tasks/${taskId}/status?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  });

/**
 * Fetch the current user's profile from the backend.
 * Uses /users/me — works for ALL roles (team_lead, admin, super_admin).
 * Falls back to null on any failure so the JWT values remain as fallback.
 */
export const getCurrentUserProfile = async (): Promise<{
  id: number;
  name: string;
  email: string;
  role: string;
} | null> => {
  try {
    return await apiFetch("/users/me");
  } catch {
    return null;
  }
};

// ── ML Predictions ────────────────────────────────────────────────────────

export interface PredictionInput {
  total_tasks: number;
  completed_tasks: number;
  delayed_tasks: number;
  team_size: number;
  completion_pct: number;
  task_completion_rate: number;
  delayed_task_rate: number;
}

export interface DelayRiskPrediction {
  is_delayed: number;
  probability_on_track: number;
  probability_delayed: number;
}

export interface CompletionTimePrediction {
  days_remaining: number;
}

export interface FullPrediction extends DelayRiskPrediction, CompletionTimePrediction {}

/**
 * Get delay risk prediction for a project
 */
export const predictDelayRisk = async (
  _token: string,
  data: PredictionInput
): Promise<DelayRiskPrediction> =>
  apiFetch("/api/predictions/delay-risk", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Get completion time prediction for a project
 */
export const predictCompletionTime = async (
  _token: string,
  data: PredictionInput
): Promise<CompletionTimePrediction> =>
  apiFetch("/api/predictions/completion-time", {
    method: "POST",
    body: JSON.stringify(data),
  });

/**
 * Get both delay risk and completion time predictions
 */
export const predictFull = async (
  _token: string,
  data: PredictionInput
): Promise<FullPrediction> =>
  apiFetch("/api/predictions/full-prediction", {
    method: "POST",
    body: JSON.stringify(data),
  });
