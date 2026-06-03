import { useState } from "react";
import { Users, Clock, Code2, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { predictResourceAllocation, ResourceAllocationInput, ResourceAllocationResult } from "@/services/api";

// ── Helpers ───────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  { value: 0, label: "Web Application" },
  { value: 1, label: "Mobile Application" },
  { value: 2, label: "Data / ML Project" },
  { value: 3, label: "DevOps / Infrastructure" },
  { value: 4, label: "Embedded / IoT" },
];

const COMPLEXITY_LEVELS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

const SKILL_FLAGS: { key: keyof ResourceAllocationInput; label: string }[] = [
  { key: "has_frontend", label: "Frontend" },
  { key: "has_backend",  label: "Backend" },
  { key: "has_ml",       label: "ML / AI" },
  { key: "has_mobile",   label: "Mobile" },
  { key: "has_devops",   label: "DevOps" },
  { key: "has_database", label: "Database" },
];

// ── Component ─────────────────────────────────────────────────────────────

interface ResourceAllocationCardProps {
  /** Pre-fill total_tasks and deadline_days from the project form */
  totalTasks?: number;
  deadlineDays?: number;
}

export default function ResourceAllocationCard({
  totalTasks = 10,
  deadlineDays = 90,
}: ResourceAllocationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ResourceAllocationResult | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const [form, setForm] = useState<ResourceAllocationInput>({
    project_type:  0,
    complexity:    2,
    total_tasks:   totalTasks,
    deadline_days: deadlineDays,
    has_frontend:  1,
    has_backend:   1,
    has_ml:        0,
    has_mobile:    0,
    has_devops:    0,
    has_database:  1,
  });

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predictResourceAllocation(form);
      setResult(res);
    } catch (e) {
      setError("Failed to get prediction. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (key: keyof ResourceAllocationInput) => {
    setForm((prev) => ({ ...prev, [key]: prev[key] === 1 ? 0 : 1 }));
    setResult(null);
  };

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/50 dark:bg-violet-950/20 dark:border-violet-800 overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            AI Resource Prediction
          </span>
          <span className="text-xs text-muted-foreground">(optional)</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-violet-200 dark:border-violet-800 pt-3">

          {/* Project Type */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Project Type</label>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { setForm((p) => ({ ...p, project_type: t.value })); setResult(null); }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    form.project_type === t.value
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-background border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Complexity</label>
            <div className="flex gap-1.5">
              {COMPLEXITY_LEVELS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => { setForm((p) => ({ ...p, complexity: c.value })); setResult(null); }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                    form.complexity === c.value
                      ? "bg-violet-600 text-white border-violet-600"
                      : "bg-background border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Sets */}
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Required Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_FLAGS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSkill(key)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    form[key] === 1
                      ? "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900 dark:text-violet-200"
                      : "bg-background border-border text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Predict Button */}
          <Button
            type="button"
            onClick={handlePredict}
            disabled={loading}
            size="sm"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Predicting…</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5 mr-2" /> Predict Resources</>
            )}
          </Button>

          {/* Error */}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="rounded-lg border border-border bg-background p-3 space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                Prediction Results
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Developers */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Developers</p>
                    <p className="text-lg font-bold text-foreground">{result.required_developers}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Est. Timeline</p>
                    <p className="text-lg font-bold text-foreground">{result.estimated_days}d</p>
                  </div>
                </div>
              </div>

              {/* Skill Sets */}
              {result.required_skill_sets.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Required Skills</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {result.required_skill_sets.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {result.project_type_label} · {result.complexity_label} complexity
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
