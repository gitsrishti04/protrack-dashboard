import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/services/api";
import { User } from "@/types";

interface UseUsersOptions {
  search?: string;
  page?: number;
}

interface UseUsersReturn {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createUser: (form: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
}

export function useUsers({ search = "", page = 1 }: UseUsersOptions = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to abort in-flight requests when params change
  const abortRef = useRef<AbortController | null>(null);

  const fetchUsers = useCallback(async () => {
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
      ...(search ? { search } : {}),
    });

    try {
      const data = await apiFetch(`/users?${params.toString()}`, {
        signal: controller.signal,
      });
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      // Ignore abort errors — they're intentional
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchUsers]);

  const createUser = async (form: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(form),
    });
    fetchUsers();
  };

  const deleteUser = async (userId: number) => {
    await apiFetch(`/users/${userId}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return { users, total, loading, error, refetch: fetchUsers, createUser, deleteUser };
}
