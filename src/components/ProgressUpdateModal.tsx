import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ProjectStatus, ProgressUpdate } from "@/types";

interface ProgressUpdateModalProps {
  open: boolean;
  onClose: (refreshNeeded?: boolean) => void;
  projectId?: number | null;
  projectName: string;
  completion?: number;
  status?: ProjectStatus;
}

export default function ProgressUpdateModal({
  open,
  onClose,
  projectId,
  projectName,
  completion = 0,
  status: initialStatus = "on_track",
}: ProgressUpdateModalProps) {
  const [taskName, setTaskName] = useState("");
  const [completionPct, setCompletionPct] = useState(String(completion));
  const [status, setStatus] = useState(initialStatus);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-fill values whenever the modal opens for a new project
  useEffect(() => {
    if (open) {
      setCompletionPct(String(completion));
      setStatus(initialStatus);
      setTaskName("");
      setComments("");
    }
  }, [open, completion, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      toast.error("No project selected.");
      return;
    }

    setLoading(true);
    try {
      // Update project completion percentage + save history to DB
      await apiFetch(`/projects/${projectId}/progress`, {
        method: "PUT",
        body: JSON.stringify({
          progress: Number(completionPct),
          task_name: taskName || "Progress update",
          comments: comments || "",
          status: status,
        }),
      });

      // Also keep localStorage as fallback for the timeline view
      const historyKey = `progress_history_${projectId}`;
      const existing: ProgressUpdate[] = JSON.parse(localStorage.getItem(historyKey) || "[]");
      existing.push({
        id: Date.now(),
        updated_at: new Date().toISOString(),
        progress: Number(completionPct),
        task_name: taskName || "Progress update",
        comments: comments,
        status,
      });
      localStorage.setItem(historyKey, JSON.stringify(existing));

      toast.success(`Progress updated for "${projectName}"`);
      onClose(true); // signal parent to refresh
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress — {projectName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="task">Task Name</Label>
            <Input
              id="task"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. API Integration"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pct">Completion %</Label>
            <Input
              id="pct"
              type="number"
              min={0}
              max={100}
              value={completionPct}
              onChange={(e) => setCompletionPct(e.target.value)}
              placeholder="0 – 100"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "on_track" | "delayed" | "completed")}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="on_track">On Track</SelectItem>
                <SelectItem value="delayed">Delayed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Submit Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
