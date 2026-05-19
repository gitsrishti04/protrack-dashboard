import { useState, useEffect } from "react";
import {
  getDashboard,
  getMyProjects,
  getMyTasks,
  updateTaskStatus as apiUpdateTaskStatus,
} from "@/services/api";
import { DashboardData, Project, Task } from "@/types";

// ── Admin / Super Admin dashboard ──────────────────────────────────────────

interface UseDashboardReturn {
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(enabled: boolean): UseDashboardReturn {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // apiFetch attaches the auth token from cookies automatically
        const data = await getDashboard("");
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [enabled]);

  return { dashboardData, loading, error };
}

// ── Team Lead dashboard ────────────────────────────────────────────────────

interface UseTeamLeadDashboardReturn {
  projects: Project[];
  tasks: Task[];
  loading: boolean;
  error: string | null;
  updateTaskStatus: (taskId: number, newStatus: string) => Promise<void>;
}

export function useTeamLeadDashboard(email: string): UseTeamLeadDashboardReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // apiFetch attaches the auth token from cookies automatically
        const data = await getMyProjects("", email);
        const myProjects: Project[] = data.items || [];
        setProjects(myProjects);

        const projectIds = myProjects.map((p) => p.id);
        const myTasks = await getMyTasks("", projectIds);
        setTasks(myTasks);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load team lead data"
        );
        console.error("Team lead data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [email]);

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      await apiUpdateTaskStatus("", taskId, newStatus);
      // Optimistic local update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  return { projects, tasks, loading, error, updateTaskStatus };
}
