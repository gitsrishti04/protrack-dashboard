import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/services/api";
import { Project, Task, Member, ProgressUpdate } from "@/types";

interface UseProjectDetailReturn {
  project: Project | null;
  tasks: Task[];
  members: Member[];
  progressHistory: ProgressUpdate[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createTask: (form: {
    title: string;
    description: string;
    status: string;
    assigned_to: string;
  }) => Promise<void>;
  updateTaskStatus: (taskId: number, status: string) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  addMember: (form: { name: string; role: string; email: string }) => Promise<void>;
  deleteMember: (memberId: number) => Promise<void>;
}

export function useProjectDetail(id: string | undefined): UseProjectDetailReturn {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [progressHistory, setProgressHistory] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [projectData, tasksData, membersData, historyData] = await Promise.all([
        apiFetch(`/projects/${id}`),
        apiFetch(`/projects/${id}/tasks`),
        apiFetch(`/projects/${id}/members`),
        apiFetch(`/projects/${id}/history`).catch(() => []),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setMembers(membersData);

      // Use DB history if available, fall back to localStorage
      if (historyData && historyData.length > 0) {
        setProgressHistory(historyData);
      } else {
        const stored = localStorage.getItem(`progress_history_${id}`);
        setProgressHistory(stored ? JSON.parse(stored) : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createTask = async (form: {
    title: string;
    description: string;
    status: string;
    assigned_to: string;
  }) => {
    await apiFetch(`/projects/${id}/tasks`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    fetchData();
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    await apiFetch(`/tasks/${taskId}/status?status=${encodeURIComponent(status)}`, {
      method: "PUT",
    });
    fetchData();
  };

  const deleteTask = async (taskId: number) => {
    await apiFetch(`/tasks/${taskId}`, { method: "DELETE" });
    fetchData();
  };

  const addMember = async (form: { name: string; role: string; email: string }) => {
    await apiFetch(`/projects/${id}/members`, {
      method: "POST",
      body: JSON.stringify(form),
    });
    fetchData();
  };

  const deleteMember = async (memberId: number) => {
    await apiFetch(`/projects/${id}/members/${memberId}`, { method: "DELETE" });
    fetchData();
  };

  return {
    project,
    tasks,
    members,
    progressHistory,
    loading,
    error,
    refetch: fetchData,
    createTask,
    updateTaskStatus,
    deleteTask,
    addMember,
    deleteMember,
  };
}
