export type ProjectStatus = "on_track" | "delayed" | "completed" | "todo" | "in_progress" | "pending";

export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  completion: number;
  deadline?: string;
  team?: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status: string;
  assigned_to?: string;
}

export interface Member {
  id: number;
  name: string;
  role: string;
  email?: string;
}

export interface DashboardData {
  total: number;
  completed: number;
  delayed: number;
  on_track: number;
  role: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ProgressUpdate {
  id: number;
  updated_at: string;
  progress: number;
  task_name: string;
  comments: string;
  status: string;
}

// ── Global user state stored in AuthContext ────────────────────────────────

/**
 * The shape of the authenticated user stored globally in AuthContext.
 * Populated in two phases:
 *   1. Immediately from the JWT token (id may be absent, role may be stale)
 *   2. Confirmed from the backend profile fetch (authoritative values)
 */
export interface AuthUser {
  id?: number;           // available after backend profile sync
  name?: string;
  email: string;
  role: string;          // authoritative after backend sync
}

export type UserRole = "team_lead" | "admin" | "super_admin";
