import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { projects, ProjectTask, TaskStatus, ProjectStatus } from "@/data/mockData";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, CheckCircle2, Clock, AlertTriangle, Users, User, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig: Record<ProjectStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Completed", className: "bg-success/10 text-success", icon: CheckCircle2 },
  on_track: { label: "On Track", className: "bg-warning/10 text-warning", icon: Clock },
  delayed: { label: "Delayed", className: "bg-destructive/10 text-destructive", icon: AlertTriangle },
};

const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);

  const [tasks, setTasks] = useState<ProjectTask[]>(project?.tasks ?? []);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskForm, setTaskForm] = useState({ name: "", completion: 0, status: "in_progress" as TaskStatus, comments: "" });

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground text-lg">Project not found.</p>
          <Button variant="outline" onClick={() => navigate("/projects")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { label: statusLabel, className: statusClass, icon: StatusIcon } = statusConfig[project.status];

  const openEditModal = (task: ProjectTask) => {
    setEditingTask(task);
    setTaskForm({ name: task.name, completion: task.completion, status: task.status, comments: "" });
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id ? { ...t, name: taskForm.name, completion: taskForm.completion, status: taskForm.status } : t
      )
    );
    setEditingTask(null);
  };

  const roleCounts = project.members.reduce<Record<string, number>>((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-up">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground mt-1 max-w-xl">{project.description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={cn("text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5", statusClass)}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Deadline: {new Date(project.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {project.team}
            </div>
          </div>

          {/* Overall progress */}
          <div className="mt-5 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-semibold text-foreground">{project.completion}%</span>
            </div>
            <Progress value={project.completion} className="h-3" />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Tasks</h2>
              <div className="space-y-3">
                {tasks.map((task) => {
                  const ts = taskStatusConfig[task.status];
                  return (
                    <div
                      key={task.id}
                      className="bg-card border border-border rounded-2xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-card-foreground text-sm truncate">{task.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{task.assignedMember}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", ts.className)}>
                            {ts.label}
                          </span>
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95"
                            aria-label="Update task"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              task.status === "completed" ? "bg-success" : task.status === "not_started" ? "bg-muted-foreground/30" : "bg-primary"
                            )}
                            style={{ width: `${task.completion}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground w-8 text-right">{task.completion}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Progress Timeline */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Progress Timeline</h2>
              <div className="relative pl-6 border-l-2 border-border space-y-6">
                {project.updates.map((update, i) => (
                  <div key={update.id} className="relative">
                    <div className={cn(
                      "absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-background",
                      i === project.updates.length - 1 ? "bg-primary" : "bg-muted-foreground/40"
                    )} />
                    <div className="bg-card border border-border rounded-xl p-3.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {new Date(update.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <span className="text-xs font-semibold text-primary">{update.completion}%</span>
                      </div>
                      <p className="text-sm text-card-foreground">{update.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right sidebar — team & resources */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Team & Resources</h2>

              {/* Resource summary */}
              <div className="bg-card border border-border rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-card-foreground">{project.members.length} Developer{project.members.length !== 1 ? "s" : ""} assigned</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(roleCounts).map(([role, count]) => (
                    <span key={role} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {count} {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Members list */}
              <div className="space-y-2">
                {project.members.map((member) => (
                  <div
                    key={member.id + member.role}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl p-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Task Name</label>
              <Input value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Completion %</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taskForm.completion}
                onChange={(e) => setTaskForm({ ...taskForm, completion: Math.min(100, Math.max(0, Number(e.target.value))) })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
              <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v as TaskStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Comments</label>
              <Textarea
                placeholder="Add any notes..."
                value={taskForm.comments}
                onChange={(e) => setTaskForm({ ...taskForm, comments: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
              <Button onClick={handleSaveTask}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}