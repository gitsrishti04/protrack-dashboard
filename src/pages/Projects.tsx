import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProjectCard from "@/components/ProjectCard";
import ProgressUpdateModal from "@/components/ProgressUpdateModal";
import Pagination from "@/components/Pagination";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useProjects } from "@/hooks/useProjects";
import { Navigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProjectStatus = "on_track" | "delayed" | "completed";

interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  completion: number;
  deadline?: string;
  team?: string;
}

const statusFilters = [
  { value: "all", label: "All" },
  { value: "on_track", label: "On Track" },
  { value: "delayed", label: "Delayed" },
  { value: "completed", label: "Completed" },
];

export default function Projects() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { debounced: debouncedSearch, isPending: isSearchPending } = useDebounce(search, 400);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { projects, total, loading, refetch, createProject } = useProjects({
    search: debouncedSearch,
    status: statusFilter,
    page,
  });

  //  FIXED MODAL STATE
  const [updateModal, setUpdateModal] = useState({
    open: false,
    projectId: null as number | null,
    projectName: "",
    completion: 0,
    status: "on_track" as ProjectStatus,
  });

  const [openProjectModal, setOpenProjectModal] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    status: "on_track",
    completion: 0,
    deadline: "",
    team: "",
  });

  // ================= CREATE PROJECT =================
  const handleCreateProject = async () => {
    await createProject(projectForm);
    setOpenProjectModal(false);
  };

  // ================= GUARD =================
  if (!user) return <Navigate to="/" replace />;

  const totalPages = Math.ceil(total / 10);
  const PAGE_SIZE = 10;
  // isSearching covers both: user still typing OR request in-flight
  const isSearching = isSearchPending || loading;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="text-sm text-muted-foreground">
              {isSearching
                ? "Searching…"
                : total > 0
                ? `${total} project${total !== 1 ? "s" : ""} found`
                : "No projects found"}
            </p>
          </div>

          <button
            onClick={() => setOpenProjectModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm"
          >
            + Create Project
          </button>
        </div>

        {/* SEARCH + STATUS FILTER */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            {isSearchPending ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="w-full pl-10 pr-8 py-2 rounded-xl border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
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

          {/* Status filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value as ProjectStatus | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* PROJECT GRID */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-2 w-full rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            {search ? (
              <>
                <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No projects match <span className="font-medium text-foreground">"{search}"</span>
                </p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No projects found.</p>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                {...p}
                onUpdate={(project) =>
                  setUpdateModal({
                    open: true,
                    projectId: project.id,
                    projectName: project.name,
                    completion: project.completion,
                    status: project.status,
                  })
                }
              />
            ))}
          </div>
        )}

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

      {/* CREATE PROJECT MODAL */}
      <Dialog open={openProjectModal} onOpenChange={setOpenProjectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Project Name"
            value={projectForm.name}
            onChange={(e) =>
              setProjectForm({ ...projectForm, name: e.target.value })
            }
          />

          <Textarea
            placeholder="Description"
            value={projectForm.description}
            onChange={(e) =>
              setProjectForm({
                ...projectForm,
                description: e.target.value,
              })
            }
          />

          <Input
            placeholder="Team"
            value={projectForm.team}
            onChange={(e) =>
              setProjectForm({ ...projectForm, team: e.target.value })
            }
          />

          <Input
            type="date"
            value={projectForm.deadline}
            onChange={(e) =>
              setProjectForm({
                ...projectForm,
                deadline: e.target.value,
              })
            }
          />

          <Select
            value={projectForm.status}
            onValueChange={(v) =>
              setProjectForm({ ...projectForm, status: v })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="on_track">On Track</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleCreateProject}>
            Create Project
          </Button>
        </DialogContent>
      </Dialog>

      {/*  FIXED MODAL */}
      <ProgressUpdateModal
        open={updateModal.open}
        onClose={(refreshNeeded) => {
          setUpdateModal({
            open: false,
            projectId: null,
            projectName: "",
            completion: 0,
            status: "on_track",
          });
          if (refreshNeeded) refetch(); // re-fetch so card updates immediately
        }}
        projectId={updateModal.projectId}
        projectName={updateModal.projectName}
        completion={updateModal.completion}
        status={updateModal.status}
      />
    </DashboardLayout>
  );
}