import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import DashboardLayout from "@/components/DashboardLayout";
import ProgressUpdateModal from "@/components/ProgressUpdateModal";
import { ProgressUpdate } from "@/types";
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Users,
  Pencil,
  Brain,
  ShieldAlert,
  UserPlus,
  Trash2,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeamLead = user?.role === "team_lead";

  const {
    project,
    tasks,
    members,
    progressHistory,
    loading,
    refetch: fetchData,
    createTask,
    updateTaskStatus,
    deleteTask,
    addMember,
    deleteMember,
  } = useProjectDetail(id);

  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState<{ id: number; title: string; description?: string; status: string; assigned_to?: string } | null>(null);
  const [openProgressModal, setOpenProgressModal] = useState(false);

  // ── ML Predictions ──────────────────────────────────────────────────────
  const { fullPrediction, loading: predLoading, getFullPrediction } = usePredictions();
  const alertedRef = useRef(false); // prevent duplicate toasts per page load

  useEffect(() => {
    if (!loading && tasks.length > 0) {
      const completedTasks = tasks.filter((t) => t.status === "completed").length;
      const delayedTasks = tasks.filter((t) => t.status === "delayed").length;
      const features = calculatePredictionFeatures(
        tasks.length,
        completedTasks,
        delayedTasks,
        members.length || 1
      );
      getFullPrediction(features);
    }
  }, [loading, tasks, members]);

  // ── Delay notification ────────────────────────────────────────────────
  useEffect(() => {
    if (fullPrediction && !alertedRef.current && project) {
      alertedRef.current = true;
      if (fullPrediction.is_delayed === 1) {
        toast.warning(
          `⚠️ Delay Risk Detected — ${project.name}`,
          {
            description: `${(fullPrediction.probability_delayed * 100).toFixed(0)}% probability of delay. Est. ${fullPrediction.days_remaining} days remaining.`,
            duration: 6000,
          }
        );
      }
    }
  }, [fullPrediction, project]);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "pending",
    assigned_to: "",
  });

  const [memberForm, setMemberForm] = useState({
    name: "",
    role: "",
    email: "",
  });

  // ================= CREATE TASK =================
  const handleCreateTask = async () => {
    await createTask(taskForm);
    setOpenTaskModal(false);
    setTaskForm({ title: "", description: "", status: "pending", assigned_to: "" });
  };

  // ================= UPDATE TASK =================
  const handleUpdateTask = async () => {
    if (!editingTask) return;
    await updateTaskStatus(editingTask.id, taskForm.status);
    setEditingTask(null);
  };

  // ================= ADD MEMBER =================
  const handleAddMember = async () => {
    await addMember(memberForm);
    setOpenMemberModal(false);
    setMemberForm({ name: "", role: "", email: "" });
  };

  // ================= DELETE TASK =================
  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
  };

  // ================= DELETE MEMBER =================
  const handleDeleteMember = async (memberId: number) => {
    if (!confirm("Remove this member from the project?")) return;
    await deleteMember(memberId);
  };

  if (loading || !project) {
    return <DashboardLayout>Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>

        <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
          <div className="flex gap-2 items-center">
            <Calendar className="w-4 h-4" />
            {new Date(project.deadline).toDateString()}
          </div>

          <div className="flex gap-2 items-center">
            <Users className="w-4 h-4" />
            {members.length} Members
          </div>
        </div>

        <Progress value={project.completion} />
        <div className="flex justify-end">
          <Button onClick={() => setOpenProgressModal(true)} size="sm">
            Update Progress
          </Button>
        </div>

        {/* KPI CARDS */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card border rounded-2xl p-5 flex gap-4 items-center">
            <Brain className="w-5 h-5 text-violet-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Estimated Completion</p>
              {predLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1" />
              ) : fullPrediction ? (
                <p className="font-bold">{fullPrediction.days_remaining} days</p>
              ) : (
                <p className="font-bold text-muted-foreground">—</p>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-5 flex gap-4 items-center">
            <UserPlus className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Team Size</p>
              <p className="font-bold">{members.length}</p>
            </div>
          </div>

          <div
            className={`border rounded-2xl p-5 flex gap-4 items-center ${
              predLoading
                ? "bg-card"
                : fullPrediction?.is_delayed === 1
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <ShieldAlert
              className={`w-5 h-5 shrink-0 ${
                predLoading
                  ? "text-muted-foreground"
                  : fullPrediction?.is_delayed === 1
                  ? "text-red-500"
                  : "text-green-500"
              }`}
            />
            <div>
              <p className="text-xs text-muted-foreground">Delay Risk</p>
              {predLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1" />
              ) : fullPrediction ? (
                <>
                  <p
                    className={`font-bold ${
                      fullPrediction.is_delayed === 1 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {fullPrediction.is_delayed === 1 ? "At Risk" : "Low"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(fullPrediction.probability_delayed * 100).toFixed(0)}% probability
                  </p>
                </>
              ) : (
                <p className="font-bold text-muted-foreground">—</p>
              )}
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* TASK HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Tasks</h2>
              {!isTeamLead && (
                <Button onClick={() => setOpenTaskModal(true)}>
                  + Add Task
                </Button>
              )}
            </div>

            {/* TASK CARDS */}
            {tasks.map((task) => (
              <div key={task.id} className="bg-card border rounded-2xl p-4">

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.assigned_to}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-600">
                      {task.status}
                    </span>

                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setTaskForm({
                          title: task.title || "",
                          description: task.description || "",
                          status: task.status || "pending",
                          assigned_to: task.assigned_to || "",
                        });
                      }}
                      title="Edit task status"
                    >
                      <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>

                    {!isTeamLead && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  {task.description}
                </p>
              </div>
            ))}

            {/* TIMELINE */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Progress Timeline</h2>

              {progressHistory.length === 0 ? (
                <div className="border-l pl-6 space-y-6">
                  <div className="relative">
                    <span className="absolute -left-[29px] w-3.5 h-3.5 rounded-full bg-muted-foreground/30 border-2 border-background ring-2 ring-muted" />
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="text-sm">Project Created</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[29px] w-3.5 h-3.5 rounded-full bg-primary/40 border-2 border-background ring-2 ring-primary/30" />
                    <p className="text-xs text-muted-foreground">Now</p>
                    <p className="text-sm text-muted-foreground italic">No progress updates yet. Use &quot;Update Progress&quot; to log one.</p>
                  </div>
                </div>
              ) : (
                <div className="border-l pl-6 space-y-6">
                  {/* Static start node */}
                  <div className="relative">
                    <span className="absolute -left-[29px] w-3.5 h-3.5 rounded-full bg-muted-foreground/30 border-2 border-background ring-2 ring-muted" />
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="text-sm font-medium">Project Created</p>
                  </div>

                  {/* Dynamic update nodes */}
                  {progressHistory.map((entry: ProgressUpdate, idx: number) => {
                    const isLatest = idx === progressHistory.length - 1;
                    const date = entry.updated_at;
                    const pct = entry.progress;
                    const note = entry.task_name;

                    return (
                      <div key={entry.id ?? idx} className="relative">
                        {/* Timeline dot */}
                        <span
                          className={`absolute -left-[29px] w-3.5 h-3.5 rounded-full border-2 border-background ring-2 ${
                            isLatest
                              ? "bg-primary ring-primary/40"
                              : "bg-muted-foreground/50 ring-muted"
                          }`}
                        />

                        {/* Timestamp */}
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {date
                            ? new Date(date).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>

                        {/* Progress bar row */}
                        <div className="flex items-center gap-3 mb-1">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold w-10 text-right">{pct}%</span>
                        </div>

                        {/* Note */}
                        <p className="text-sm text-muted-foreground">{note}</p>
                      </div>
                    );
                  })}

                  {/* "Now" marker at the end */}
                  <div className="relative">
                    <span className="absolute -left-[29px] w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background ring-2 ring-green-300" />
                    <p className="text-xs text-green-600 font-medium">Now</p>
                    <p className="text-sm font-semibold">
                      Current progress: {project?.completion ?? 0}%
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Team & Resources
              </h2>

              {!isTeamLead && (
                <Button onClick={() => setOpenMemberModal(true)}>
                  + Add Member
                </Button>
              )}
            </div>

            <div className="bg-card border rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold">
                {members.length} Members
              </p>
            </div>

            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 border rounded-xl p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                    {member.name[0]}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                    {member.email && (
                      <p className="text-xs text-violet-600 mt-0.5">{member.email}</p>
                    )}
                  </div>

                  {!isTeamLead && (
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
                    </button>
                  )}
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* TASK MODAL */}
      <Dialog open={openTaskModal} onOpenChange={setOpenTaskModal}>
        <DialogContent>
          <DialogTitle>Create Task</DialogTitle>

          <Input
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
          />

          <Textarea
            placeholder="Description"
            value={taskForm.description}
            onChange={(e) =>
              setTaskForm({ ...taskForm, description: e.target.value })
            }
          />

          {/* MEMBER DROPDOWN */}
          <Select
            value={taskForm.assigned_to}
            onValueChange={(v) =>
              setTaskForm({ ...taskForm, assigned_to: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Assign Member" />
            </SelectTrigger>

            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name} ({m.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleCreateTask}>Create</Button>
        </DialogContent>
      </Dialog>

      {/* MEMBER MODAL */}
      <Dialog open={openMemberModal} onOpenChange={setOpenMemberModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Full Name"
              value={memberForm.name}
              onChange={(e) =>
                setMemberForm({ ...memberForm, name: e.target.value })
              }
            />

            <Input
              placeholder="Role (e.g. Developer, Designer)"
              value={memberForm.role}
              onChange={(e) =>
                setMemberForm({ ...memberForm, role: e.target.value })
              }
            />

            <div>
              <Input
                placeholder="Login Email (e.g. teamlead@company.com)"
                type="email"
                value={memberForm.email}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, email: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional — enter their login email so they can access this project from their dashboard.
              </p>
            </div>
          </div>

          <Button className="w-full mt-2" onClick={handleAddMember}>Add Member</Button>
        </DialogContent>
      </Dialog>

      {/* UPDATE TASK */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent>
          <DialogTitle>Update Task</DialogTitle>

          <Select
            value={taskForm.status}
            onValueChange={(v) =>
              setTaskForm({ ...taskForm, status: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleUpdateTask}>Update</Button>
        </DialogContent>
      </Dialog>

      {/* PROGRESS UPDATE MODAL */}
      <ProgressUpdateModal
        open={openProgressModal}
        onClose={(refreshNeeded) => {
          setOpenProgressModal(false);
          if (refreshNeeded) fetchData();
        }}
        projectId={id ? Number(id) : null}
        projectName={project?.name ?? ""}
        completion={project?.completion ?? 0}
        status={project?.status ?? "on_track"}
      />

    </DashboardLayout>
  );
}