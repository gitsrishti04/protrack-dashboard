import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProjectCard from "@/components/ProjectCard";
import ProgressUpdateModal from "@/components/ProgressUpdateModal";
import { projects, ProjectStatus } from "@/data/mockData";
import { Search, Filter } from "lucide-react";
import { Navigate } from "react-router-dom";

const statusFilters: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "on_track", label: "On Track" },
  { value: "delayed", label: "Delayed" },
  { value: "completed", label: "Completed" },
];

export default function Projects() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [updateModal, setUpdateModal] = useState<{ open: boolean; projectName: string }>({ open: false, projectName: "" });

  if (!user) return <Navigate to="/" replace />;

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold">Projects</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} projects found</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or teams..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                name={p.name}
                completion={p.completion}
                status={p.status}
                deadline={p.deadline}
                team={p.team}
                onUpdate={user.role === "team_lead" ? () => setUpdateModal({ open: true, projectName: p.name }) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No projects found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <ProgressUpdateModal
        open={updateModal.open}
        onClose={() => setUpdateModal({ open: false, projectName: "" })}
        projectName={updateModal.projectName}
      />
    </DashboardLayout>
  );
}
