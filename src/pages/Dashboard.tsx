import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import ProjectCard from "@/components/ProjectCard";
import KpiCard from "@/components/KpiCard";
import { ProgressLineChart, ResourceBarChart, WorkloadPieChart } from "@/components/ChartSection";
import Chatbot from "@/components/Chatbot";
import ProgressUpdateModal from "@/components/ProgressUpdateModal";
import { projects, kpiData } from "@/data/mockData";
import { FolderKanban, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [updateModal, setUpdateModal] = useState<{ open: boolean; projectName: string }>({ open: false, projectName: "" });

  if (!user) return <Navigate to="/" replace />;

  const myProjects = user.role === "team_lead" ? projects.filter((p) => p.assignedTo === user.id) : projects;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up">
        {/* KPIs for Admin/Super Admin */}
        {(user.role === "admin" || user.role === "super_admin") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Projects" value={kpiData.totalProjects} icon={FolderKanban} trend="+2 this month" />
            <KpiCard title="Active" value={kpiData.activeProjects} icon={Activity} trend="5 in progress" />
            <KpiCard title="Delayed" value={kpiData.delayedProjects} icon={AlertTriangle} trend="Needs attention" />
            <KpiCard title="Completed" value={kpiData.completedProjects} icon={CheckCircle2} trend="100% on time" />
          </div>
        )}

        {/* Team Lead header */}
        {user.role === "team_lead" && (
          <div>
            <h2 className="text-lg font-semibold">My Projects</h2>
            <p className="text-sm text-muted-foreground">{myProjects.length} projects assigned to you</p>
          </div>
        )}

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myProjects.map((p) => (
            <ProjectCard
              key={p.id}
              id={p.id}
              name={p.name}
              completion={p.completion}
              status={p.status}
              deadline={p.deadline}
              team={p.team}
              onUpdate={user.role === "team_lead" ? () => setUpdateModal({ open: true, projectName: p.name }) : undefined}
            />
          ))}
        </div>

        {/* Charts for Admin / Super Admin */}
        {(user.role === "admin" || user.role === "super_admin") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <ProgressLineChart />
            <ResourceBarChart />
            <WorkloadPieChart />
          </div>
        )}

        {/* Chatbot for Super Admin */}
        {user.role === "super_admin" && (
          <div className="h-[480px]">
            <Chatbot />
          </div>
        )}
      </div>

      <ProgressUpdateModal
        open={updateModal.open}
        onClose={() => setUpdateModal({ open: false, projectName: "" })}
        projectName={updateModal.projectName}
      />
    </DashboardLayout>
  );
}
