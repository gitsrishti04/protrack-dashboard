import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ProgressUpdateModalProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
}

export default function ProgressUpdateModal({ open, onClose, projectName }: ProgressUpdateModalProps) {
  const [taskName, setTaskName] = useState("");
  const [completionPct, setCompletionPct] = useState("");
  const [status, setStatus] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Progress updated for "${projectName}"`);
    setTaskName("");
    setCompletionPct("");
    setStatus("");
    setComments("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress — {projectName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="task">Task Name</Label>
            <Input id="task" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="e.g. API Integration" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pct">Completion %</Label>
            <Input id="pct" type="number" min={0} max={100} value={completionPct} onChange={(e) => setCompletionPct(e.target.value)} placeholder="0 – 100" required />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus} required>
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
            <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Additional notes..." rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Submit Update</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
