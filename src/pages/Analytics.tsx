import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import KpiCard from "@/components/KpiCard";
import { ProgressLineChart, ResourceBarChart, WorkloadPieChart } from "@/components/ChartSection";
import { kpiData } from "@/data/mockData";
import { FolderKanban, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Analytics() {
  const { user } = useAuth();

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) return <Navigate to="/dashboard" replace />;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance insights across all projects</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Completion Rate" value={`${kpiData.completionRate}%`} icon={TrendingUp} trend="+6% vs last month" />
          <KpiCard title="Active Projects" value={kpiData.activeProjects} icon={Activity} />
          <KpiCard title="Delayed" value={kpiData.delayedProjects} icon={AlertTriangle} trend="3 need attention" />
          <KpiCard title="Resource Utilization" value={`${kpiData.avgResourceUtil}%`} icon={FolderKanban} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ProgressLineChart />
          <ResourceBarChart />
        </div>

        <WorkloadPieChart />
      </div>
    </DashboardLayout>
  );
}
