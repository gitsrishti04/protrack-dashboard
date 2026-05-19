import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { progressOverTime, resourceUsage } from "@/data/mockData";
import { getWorkloadData } from "@/services/api";

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

export function ProgressLineChart() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-4">Project Progress Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={progressOverTime}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215,12%,50%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,12%,50%)" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214,20%,90%)", fontSize: 13 }} />
          <Line type="monotone" dataKey="progress" stroke="hsl(215,90%,52%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(215,90%,52%)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResourceBarChart() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-4">Resource Utilization</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={resourceUsage} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,90%)" />
          <XAxis dataKey="team" tick={{ fontSize: 11 }} stroke="hsl(215,12%,50%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(215,12%,50%)" />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214,20%,90%)", fontSize: 13 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="allocated" fill="hsl(215,90%,52%)" radius={[6, 6, 0, 0]} name="Allocated" />
          <Bar dataKey="used" fill="hsl(152,60%,42%)" radius={[6, 6, 0, 0]} name="Used" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WorkloadPieChart() {
  const [workloadData, setWorkloadData] = useState<{ name: string; value: number; tasks: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkloadData("")
      .then((data) => {
        setWorkloadData(data);
      })
      .catch((err) => {
        console.error("Failed to load workload data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-sm mb-4">Team Workload Distribution</h3>

      {loading ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
          Loading...
        </div>
      ) : workloadData.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
          No task assignments found
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
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
                const tasks: number = props.payload.tasks ?? 0;
                return [`${tasks} task${tasks !== 1 ? "s" : ""}`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
