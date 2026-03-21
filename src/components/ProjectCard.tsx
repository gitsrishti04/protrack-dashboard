import { ProjectStatus } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  name: string;
  completion: number;
  status: ProjectStatus;
  deadline: string;
  team: string;
  onUpdate?: () => void;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  on_track: { label: "On Track", className: "bg-warning/10 text-warning" },
  delayed: { label: "Delayed", className: "bg-destructive/10 text-destructive" },
};

export default function ProjectCard({ id, name, completion, status, deadline, team, onUpdate }: ProjectCardProps) {
  const navigate = useNavigate();
  const { label, className } = statusConfig[status];

  return (
    <div
      onClick={() => navigate(`/projects/${id}`)}
      className="group bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-card-foreground text-base leading-tight group-hover:text-primary transition-colors">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{team}</p>
        </div>
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", className)}>{label}</span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{completion}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              status === "completed" ? "bg-success" : status === "delayed" ? "bg-destructive" : "bg-primary"
            )}
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        {onUpdate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate();
            }}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors active:scale-95"
          >
            Update Progress
          </button>
        )}
      </div>
    </div>
  );
}