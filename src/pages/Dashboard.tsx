import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import { ProgressLineChart, WorkloadPieChart, ResourceBarChart, TaskCompletionChart } from "@/components/ChartSection";
import Chatbot from "@/components/Chatbot";
import ProgressUpdateModal from "@/components/ProgressUpdateModal";
import { useDashboard, useTeamLeadDashboard } from "@/hooks/useDashboard";
import { FolderKanban, Activity, AlertTriangle, CheckCircle2,
  Briefcase, ListTodo, Calendar, TrendingUp,
  Circle, Brain, Loader2
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Project, Task } from "@/types";
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";
import { toast } from "sonner";

/* ─── status helpers ─── */
const statusColor: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  in_progress: "bg-blue-100 text-blue-700 border border-blue-200",
  todo: "bg-slate-100 text-slate-600 border border-slate-200",
  delayed: "bg-red-100 text-red-700 border border-red-200",
  on_track: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const statusLabel: Record<string, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  todo: "To Do",
  delayed: "Delayed",
  on_track: "On Track",
  pending: "Pending",
};

/* ─── Inline prediction badge for project cards ─── */
function ProjectPredictionBadge({ tasks, teamSize }: { tasks: Task[]; teamSize: number }) {
  const { fullPrediction, loading, getFullPrediction } = usePredictions();

  useEffect(() => {
    if (tasks.length === 0) return;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const delayed = tasks.filter((t) => t.status === "delayed").length;
    const features = calculatePredictionFeatures(tasks.length, completed, delayed, teamSize || 1);
    getFullPrediction(features);
  }, [tasks.length, teamSize]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Analyzing…</span>
      </div>
    );
  }

  if (!fullPrediction) return null;

  const isAtRisk = fullPrediction.is_delayed === 1;

  return (
    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
      <Brain className="w-3.5 h-3.5 text-violet-500 shrink-0" />
      <span className="text-xs text-muted-foreground">AI:</span>
      <span
        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          isAtRisk
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {isAtRisk ? "At Risk" : "On Track"}
      </span>
      <span className="text-xs text-muted-foreground">·</span>
      <span className="text-xs text-muted-foreground">
        ~{fullPrediction.days_remaining}d remaining
      </span>
    </div>
  );
}

/* ─── Team Lead Dashboard ─── */
function TeamLeadDashboard({ email }: { email: string }) {
  const navigate = useNavigate();
  const { projects, tasks, loading, updateTaskStatus } = useTeamLeadDashboard(email);
  const [updateModal, setUpdateModal] = useState<{ open: boolean; projectId: number; projectName: string }>({
    open: false, projectId: 0, projectName: "",
  });
  const alertedRef = useRef(false);

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;

  // Notify team lead if any of their projects are delayed
  useEffect(() => {
    if (!loading && projects.length > 0 && !alertedRef.current) {
      alertedRef.current = true;
      const delayedProjects = projects.filter((p) => p.status === "delayed");
      if (delayedProjects.length > 0) {
        toast.warning(
          `⚠️ ${delayedProjects.length} project${delayedProjects.length > 1 ? "s" : ""} need attention`,
          {
            description: delayedProjects.map((p) => p.name).join(", "),
            duration: 7000,
          }
        );
      }
    }
  }, [loading, projects]);

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskStatus(taskId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-violet-50 via-purple-50 to-transparent p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-transparent pointer-events-none" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 uppercase tracking-wider">
                Team Lead
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-2">
              Welcome back 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="rounded-xl bg-white border border-border px-4 py-3 text-center min-w-[80px] shadow-sm">
              <p className="text-2xl font-bold text-violet-600">{projects.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Projects</p>
            </div>
            <div className="rounded-xl bg-white border border-border px-4 py-3 text-center min-w-[80px] shadow-sm">
              <p className="text-2xl font-bold text-emerald-600">{completedTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Done</p>
            </div>
            <div className="rounded-xl bg-white border border-border px-4 py-3 text-center min-w-[80px] shadow-sm">
              <p className="text-2xl font-bold text-amber-600">{pendingTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── My Projects ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-4 h-4 text-violet-600" />
          <h2 className="text-base font-semibold text-foreground">My Projects</h2>
          <span className="text-xs text-muted-foreground">({projects.length})</span>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <FolderKanban className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">You haven't been added to any projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => {
              const projectTasks = tasks.filter((t) => t.project_id === project.id);
              const done = projectTasks.filter((t) => t.status === "completed").length;
              const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : (project.completion ?? 0);

              return (
                <div
                  key={project.id}
                  className="group rounded-2xl border border-border bg-card hover:border-violet-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-4 cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description || "No description"}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[project.status] ?? statusColor["todo"]}`}>
                      {statusLabel[project.status] ?? project.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span className="text-foreground font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</span>
                    </div>
                    <button
                      className="text-xs text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpdateModal({ open: true, projectId: project.id, projectName: project.name });
                      }}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Update
                    </button>
                  </div>

                  {/* AI Prediction Badge */}
                  <ProjectPredictionBadge tasks={projectTasks} teamSize={projectTasks.length} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── My Tasks ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ListTodo className="w-4 h-4 text-violet-600" />
          <h2 className="text-base font-semibold text-foreground">My Tasks</h2>
          <span className="text-xs text-muted-foreground">({tasks.length})</span>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <ListTodo className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tasks assigned to your projects yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="divide-y divide-border">
              {tasks.map((task) => {
                const proj = projects.find((p) => p.id === task.project_id);
                return (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/40 transition-colors">
                    <Circle className="w-3.5 h-3.5 shrink-0 text-violet-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                      {proj && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{proj.name}</p>
                      )}
                    </div>
                    {/* Inline status selector */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-background text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delayed">Delayed</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Progress Update Modal */}
      <ProgressUpdateModal
        open={updateModal.open}
        onClose={() => setUpdateModal({ open: false, projectId: 0, projectName: "" })}
        projectName={updateModal.projectName}
      />
    </div>
  );
}

/* ─── Main Dashboard (role-router) ─── */
export default function Dashboard() {
  const { user } = useAuth();

  const [updateModal, setUpdateModal] = useState<{ open: boolean; projectName: string }>({
    open: false,
    projectName: "",
  });

  const isAdminOrSuperAdmin =
    user?.role === "admin" || user?.role === "super_admin";
  const { dashboardData } = useDashboard(!!user && isAdminOrSuperAdmin);

  if (!user) return <Navigate to="/" replace />;

  /* ── Team Lead view ── */
  if (user.role === "team_lead") {
    return (
      <DashboardLayout>
        <TeamLeadDashboard email={user.email} />
      </DashboardLayout>
    );
  }

  /* ── Admin / Super Admin view ── */
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">

        {/* KPIs */}
        {(user.role === "admin" || user.role === "super_admin") && dashboardData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Projects" value={dashboardData.total} icon={FolderKanban} trend="Real-time" />
            <KpiCard title="Active" value={dashboardData.on_track} icon={Activity} trend="On track" />
            <KpiCard title="Delayed" value={dashboardData.delayed} icon={AlertTriangle} trend="Needs attention" />
            <KpiCard title="Completed" value={dashboardData.completed} icon={CheckCircle2} trend="Done" />
          </div>
        )}

        {/* Charts */}
        {(user.role === "admin" || user.role === "super_admin") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProgressLineChart />
            <WorkloadPieChart />
            <ResourceBarChart />
            <TaskCompletionChart />
          </div>
        )}

        {/* AI Insights Panel — Admin / Super Admin */}
        {(user.role === "admin" || user.role === "super_admin") && dashboardData && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold">AI Insights</h2>
              <span className="text-xs text-muted-foreground ml-1">Based on current project data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* At-risk ratio */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground mb-1">Projects at Risk</p>
                <p className="text-2xl font-bold text-red-500">{dashboardData.delayed}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.total > 0
                    ? `${((dashboardData.delayed / dashboardData.total) * 100).toFixed(0)}% of total`
                    : "—"}
                </p>
              </div>
              {/* On track */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground mb-1">On Track</p>
                <p className="text-2xl font-bold text-green-500">{dashboardData.on_track}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.total > 0
                    ? `${((dashboardData.on_track / dashboardData.total) * 100).toFixed(0)}% of total`
                    : "—"}
                </p>
              </div>
              {/* Completion rate */}
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-2xl font-bold text-violet-500">
                  {dashboardData.total > 0
                    ? `${((dashboardData.completed / dashboardData.total) * 100).toFixed(0)}%`
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.completed} of {dashboardData.total} completed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot */}
        {user.role === "super_admin" && (
          <div className="h-[480px]">
            <Chatbot />
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
