import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/hooks/useUsers";
import Pagination from "@/components/Pagination";
import {
  Users, Trash2, UserPlus, Shield, Crown, User as UserIcon,
  Mail, Lock, ChevronDown, Search, RefreshCw, Loader2, X
} from "lucide-react";
import { User } from "@/types";

const roleHierarchy: Record<string, number> = {
  team_lead: 0,
  admin: 1,
  super_admin: 2,
};

const roleConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  super_admin: {
    label: "Super Admin",
    color: "bg-violet-100 text-violet-700 border border-violet-200",
    icon: <Crown className="w-3 h-3" />,
  },
  admin: {
    label: "Admin",
    color: "bg-blue-100 text-blue-700 border border-blue-200",
    icon: <Shield className="w-3 h-3" />,
  },
  team_lead: {
    label: "Team Lead",
    color: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    icon: <UserIcon className="w-3 h-3" />,
  },
};

const avatarColors = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

export default function UsersPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const { debounced: debouncedSearch, isPending: isSearchPending } = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "team_lead" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { users, total, loading, refetch: fetchUsers, createUser, deleteUser } = useUsers({
    search: debouncedSearch,
    page,
  });

  const handleCreate = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.password) {
      setFormError("Name, email and password are required.");
      return;
    }
    setFormLoading(true);
    try {
      await createUser(form);
      setForm({ name: "", email: "", password: "", role: "team_lead" });
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleting(userId);
    try {
      await deleteUser(userId);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = users;
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const isSearching = isSearchPending || loading;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all registered users and their roles
            </p>          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg border border-border hover:bg-accent/40 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { setShowForm(!showForm); setFormError(""); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {(["super_admin", "admin", "team_lead"] as const).map((role) => {
            const count = users.filter((u) => u.role === role).length;
            const cfg = roleConfig[role];
            return (
              <div key={role} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}s</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add User Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Create New User
            </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Name */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Role — filtered by hierarchy */}
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="team_lead">Team Lead</option>
                  {user?.role === "super_admin" && (
                    <option value="admin">Admin</option>
                  )}
                </select>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-600">{formError}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={formLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {formLoading ? "Creating…" : "Create User"}
              </button>
              <button
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-accent/40 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          {isSearchPending ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          )}
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* User Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border bg-muted/30">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Email</div>
            <div className="col-span-3">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {loading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 items-center px-5 py-3.5 animate-pulse">
                  <div className="col-span-1"><div className="h-3 w-4 rounded bg-muted" /></div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-2.5 w-32 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="col-span-3"><div className="h-5 w-20 rounded-full bg-muted" /></div>
                  <div className="col-span-2"><div className="h-5 w-14 rounded-full bg-muted" /></div>
                  <div className="col-span-1" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
              {search ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    No users match <span className="font-medium text-foreground">"{search}"</span>
                  </p>
                  <button
                    onClick={() => setSearch("")}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No users found.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((u, idx) => {
                const cfg = roleConfig[u.role] ?? roleConfig["team_lead"];
                const avatarColor = avatarColors[u.id % avatarColors.length];
                const isSelf = u.email === user?.email;

                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-accent/30 transition-colors"
                  >
                    {/* Index */}
                    <div className="col-span-1 text-sm text-muted-foreground">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </div>

                    {/* Email + avatar */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor}`}>
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.name || "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        {isSelf && (
                          <p className="text-xs text-primary font-medium">You</p>
                        )}
                      </div>
                    </div>

                    {/* Role badge */}
                    <div className="col-span-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>

                    {/* Delete — only shown if target is below current user's level */}
                    <div className="col-span-1 flex justify-end">
                      {!isSelf && (roleHierarchy[u.role] ?? 0) < (roleHierarchy[user?.role ?? ""] ?? 0) && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deleting === u.id}
                          title="Delete user"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deleting === u.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </DashboardLayout>
  );
}
