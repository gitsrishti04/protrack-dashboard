import { useState, useEffect } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { getWorkloadData, getResourceUtilization, apiFetch } from "@/services/api";

const COLORS = [
  "hsl(215, 90%, 52%)",
  "hsl(152, 60%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 55%)",
  "hsl(340, 70%, 55%)",
  "hsl(190, 80%, 45%)",
  "hsl(15, 85%, 55%)",
  "hsl(60, 75%, 45%)",
  "hsl(240, 70%, 60%)",
  "hsl(100, 55%, 40%)",
];

const STATUS_COLORS: Record<string, string> = {
  completed:   "hsl(152, 60%, 42%)",
  in_progress: "hsl(215, 90%, 52%)",
  delayed:     "hsl(0, 72%, 55%)",
  on_track:    "hsl(152, 60%, 42%)",
};

// ── Skeleton loader ───────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[260px]">
      <div className="w-full h-full bg-muted rounded-xl animate-pulse" />
    </div>
  );
}

// ── Project Progress Over Time — live from DB ─────────────────────────────
export function ProgressLineChart() {
  const [data, setData]       = useState<{ month: string; progress: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/progress-over-time")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-1">Project Progress Over Time</h3>
      <p className="text-xs text-muted-foreground mb-4">Average completion % across all projects</p>
      {loading ? <ChartSkeleton /> : data.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
          No progress history yet — submit a progress update to see data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,12%,50%)" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(215,12%,50%)" tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(214,20%,90%)", fontSize: 13 }}
              formatter={(v: number) => [`${v}%`, "Avg Progress"]}
            />
            <Line type="monotone" dataKey="progress" stroke="hsl(215,90%,52%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(215,90%,52%)" }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Resource Utilization — live data from backend ─────────────────────────
export function ResourceBarChart() {
  const [data, setData]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResourceUtilization()
      .then((rows) => {
        // Take top 8 projects by member count for readability
        setData(rows.slice(0, 8).map((r: any) => ({
          project:     r.project.length > 18 ? r.project.slice(0, 16) + "…" : r.project,
          Members:     r.members,
          Completed:   r.completed,
          "In Progress": r.in_progress,
          Delayed:     r.delayed,
          utilization: r.utilization,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-1">Resource Utilization</h3>
      <p className="text-xs text-muted-foreground mb-4">Team members assigned per project</p>

      {loading ? <ChartSkeleton /> : data.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={2} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
            <XAxis dataKey="project" tick={{ fontSize: 10 }} stroke="hsl(215,12%,50%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(215,12%,50%)" />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(214,20%,90%)", fontSize: 13 }}
              formatter={(val: number, name: string) => [val, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Members"      fill="hsl(215,90%,52%)"  radius={[4,4,0,0]} name="Members" />
            <Bar dataKey="Completed"    fill="hsl(152,60%,42%)"  radius={[4,4,0,0]} name="Completed Tasks" />
            <Bar dataKey="In Progress"  fill="hsl(38,92%,50%)"   radius={[4,4,0,0]} name="In Progress" />
            <Bar dataKey="Delayed"      fill="hsl(0,72%,55%)"    radius={[4,4,0,0]} name="Delayed" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Task Completion Rate per Project ──────────────────────────────────────
export function TaskCompletionChart() {
  const [data, setData]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResourceUtilization()
      .then((rows) => {
        setData(rows.slice(0, 8).map((r: any) => ({
          project:     r.project.length > 18 ? r.project.slice(0, 16) + "…" : r.project,
          utilization: r.utilization,
          status:      r.status,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-1">Task Completion Rate</h3>
      <p className="text-xs text-muted-foreground mb-4">% of tasks completed per project</p>

      {loading ? <ChartSkeleton /> : data.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">No data</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(215,12%,50%)" tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="project" tick={{ fontSize: 10 }} stroke="hsl(215,12%,50%)" width={110} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(214,20%,90%)", fontSize: 13 }}
              formatter={(v: number) => [`${v}%`, "Completion"]}
            />
            <Bar dataKey="utilization" radius={[0,4,4,0]} name="Completion %">
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.status === "completed" ? "hsl(152,60%,42%)" :
                    entry.status === "delayed"   ? "hsl(0,72%,55%)" :
                    "hsl(215,90%,52%)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── Team Workload Distribution pie ────────────────────────────────────────
export function WorkloadPieChart() {
  const [workloadData, setWorkloadData] = useState<{ name: string; value: number; tasks: number }[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    getWorkloadData("")
      .then(setWorkloadData)
      .catch((err) => console.error("Failed to load workload data:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-1">Team Workload Distribution</h3>
      <p className="text-xs text-muted-foreground mb-4">Tasks assigned per team member</p>

      {loading ? <ChartSkeleton /> : workloadData.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
          No task assignments found
        </div>
      ) : (
        <div className="flex gap-4 h-[340px]">
          <div className="w-[45%] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {workloadData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(214,20%,90%)", fontSize: 13 }}
                  formatter={(_value: number, name: string, props: { payload: { tasks?: number } }) => {
                    const tasks = props.payload.tasks ?? 0;
                    return [`${tasks} task${tasks !== 1 ? "s" : ""}`, name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
            {workloadData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="truncate text-foreground">{entry.name}</span>
                <span className="ml-auto shrink-0 text-muted-foreground tabular-nums">{entry.tasks}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
