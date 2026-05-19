import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/services/api";
import { Project } from "@/types";

interface UseProjectsOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseProjectsReturn {
  projects: Project[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createProject: (form: Partial<Project>) => Promise<void>;
}

export function useProjects({
  search = "",
  status = "",
  page = 1,
  limit = 10,
}: UseProjectsOptions = {}): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to abort in-flight requests when params change
  const abortRef = useRef<AbortController | null>(null);

  const fetchProjects = useCallback(async () => {
    // Cancel any previous in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
      ...(status && status !== "all" ? { status } : {}),
    });

    try {
      const data = await apiFetch(`/projects?${params.toString()}`, {
        signal: controller.signal,
      });
      setProjects(Array.isArray(data.items) ? data.items : []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      // Ignore abort errors — they're intentional
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      // Only clear loading if this request wasn't aborted
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchProjects();
    // Cleanup: abort on unmount
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchProjects]);

  const createProject = async (form: Partial<Project>) => {
    await apiFetch("/projects", {
      method: "POST",
      body: JSON.stringify(form),
    });
    fetchProjects();
  };

  return { projects, total, loading, error, refetch: fetchProjects, createProject };
}
