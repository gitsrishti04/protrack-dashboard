import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * Axios instance — centralized API client.
 * - Attaches Authorization header from cookie automatically.
 * - On 401, clears the cookie and redirects to login.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
});

// ── Request interceptor — attach token ────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — handle 401 ────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    const message =
      error.response?.data?.detail ||
      error.response?.statusText ||
      "API Error";
    return Promise.reject(new Error(message));
  }
);

/**
 * Generic fetch wrapper using Axios — drop-in replacement for apiFetch.
 */
export const apiFetch = async (
  endpoint: string,
  options: {
    method?: string;
    body?: string | URLSearchParams | FormData;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  } = {}
) => {
  const { method = "GET", body, headers = {}, signal } = options;

  // Determine content type
  const isFormData =
    body instanceof FormData || body instanceof URLSearchParams;

  const response = await apiClient.request({
    url: endpoint,
    method,
    data: body,
    headers: isFormData
      ? headers
      : { "Content-Type": "application/json", ...headers },
    signal,
  });

  return response.data;
};

// ── Domain helpers ────────────────────────────────────────────────────────

export const getDashboard = async (_token: string) => apiFetch("/dashboard");

export const getWorkloadData = async (_token: string) => apiFetch("/workload");

export const getResourceUtilization = async () =>
  apiFetch("/resource-utilization");

/**
 * Fetch projects for the current user.
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

export interface FullPrediction
  extends DelayRiskPrediction,
    CompletionTimePrediction {}

export const predictDelayRisk = async (
  _token: string,
  data: PredictionInput
): Promise<DelayRiskPrediction> =>
  apiFetch("/api/predictions/delay-risk", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const predictCompletionTime = async (
  _token: string,
  data: PredictionInput
): Promise<CompletionTimePrediction> =>
  apiFetch("/api/predictions/completion-time", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const predictFull = async (
  _token: string,
  data: PredictionInput
): Promise<FullPrediction> =>
  apiFetch("/api/predictions/full-prediction", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Resource Allocation ───────────────────────────────────────────────────

export interface ResourceAllocationInput {
  project_type: number;
  complexity: number;
  total_tasks: number;
  deadline_days: number;
  has_frontend: number;
  has_backend: number;
  has_ml: number;
  has_mobile: number;
  has_devops: number;
  has_database: number;
}

export interface ResourceAllocationResult {
  required_developers: number;
  estimated_days: number;
  required_skill_sets: string[];
  project_type_label: string;
  complexity_label: string;
}

export const predictResourceAllocation = async (
  data: ResourceAllocationInput
): Promise<ResourceAllocationResult> =>
  apiFetch("/api/predictions/resource-allocation", {
    method: "POST",
    body: JSON.stringify(data),
  });
