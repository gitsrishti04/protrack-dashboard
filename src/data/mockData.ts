export type ProjectStatus = "completed" | "on_track" | "delayed";

export interface Project {
  id: string;
  name: string;
  completion: number;
  status: ProjectStatus;
  deadline: string;
  team: string;
  description: string;
  assignedTo: string;
}

export const projects: Project[] = [
  { id: "1", name: "Customer Portal Redesign", completion: 85, status: "on_track", deadline: "2026-04-15", team: "Frontend", description: "Complete overhaul of customer-facing portal", assignedTo: "1" },
  { id: "2", name: "ML Pipeline v2", completion: 42, status: "delayed", deadline: "2026-03-28", team: "Data Engineering", description: "Upgrade ML inference pipeline for lower latency", assignedTo: "1" },
  { id: "3", name: "Mobile App Launch", completion: 100, status: "completed", deadline: "2026-03-10", team: "Mobile", description: "iOS and Android app release", assignedTo: "1" },
  { id: "4", name: "Payment Integration", completion: 67, status: "on_track", deadline: "2026-05-01", team: "Backend", description: "Stripe and PayPal integration", assignedTo: "2" },
  { id: "5", name: "Security Audit", completion: 30, status: "delayed", deadline: "2026-03-20", team: "DevOps", description: "Comprehensive security review and fixes", assignedTo: "2" },
  { id: "6", name: "Analytics Dashboard", completion: 92, status: "on_track", deadline: "2026-04-05", team: "Frontend", description: "Real-time analytics for admins", assignedTo: "1" },
  { id: "7", name: "API Rate Limiting", completion: 100, status: "completed", deadline: "2026-02-28", team: "Backend", description: "Implement API throttling", assignedTo: "2" },
  { id: "8", name: "Data Migration", completion: 55, status: "delayed", deadline: "2026-03-25", team: "Data Engineering", description: "Migrate legacy data to new schema", assignedTo: "1" },
];

export const progressOverTime = [
  { month: "Oct", progress: 22 },
  { month: "Nov", progress: 35 },
  { month: "Dec", progress: 48 },
  { month: "Jan", progress: 58 },
  { month: "Feb", progress: 70 },
  { month: "Mar", progress: 78 },
];

export const resourceUsage = [
  { team: "Frontend", allocated: 85, used: 72 },
  { team: "Backend", allocated: 90, used: 88 },
  { team: "Data Eng", allocated: 70, used: 65 },
  { team: "Mobile", allocated: 60, used: 45 },
  { team: "DevOps", allocated: 50, used: 48 },
];

export const teamWorkload = [
  { name: "Frontend", value: 32 },
  { name: "Backend", value: 28 },
  { name: "Data Eng", value: 18 },
  { name: "Mobile", value: 12 },
  { name: "DevOps", value: 10 },
];

export const kpiData = {
  totalProjects: 8,
  activeProjects: 5,
  delayedProjects: 3,
  completedProjects: 2,
  completionRate: 78,
  avgResourceUtil: 73,
};
