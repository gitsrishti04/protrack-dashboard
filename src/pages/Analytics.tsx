import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import { ProgressLineChart, ResourceBarChart, WorkloadPieChart } from "@/components/ChartSection";
import { getDashboard } from "@/services/api";
import { DashboardData } from "@/types";
import { FolderKanban, Activity, AlertTriangle, TrendingUp, Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) return;
    setLoading(true);
    getDashboard("")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return <Navigate to="/dashboard" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance insights across all projects</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Completion Rate" value={data ? `${data.completionRate}%` : "—"} icon={TrendingUp} />
            <KpiCard title="Active Projects" value={data?.activeProjects ?? "—"} icon={Activity} />
            <KpiCard title="Delayed" value={data?.delayed ?? "—"} icon={AlertTriangle} trend={data?.delayed ? `${data.delayed} need attention` : undefined} />
            <KpiCard title="Resource Utilization" value={data ? `${data.avgResourceUtil}%` : "—"} icon={FolderKanban} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgressLineChart />
          <ResourceBarChart />
        </div>

        <WorkloadPieChart />
      </div>
    </DashboardLayout>
  );
}
