export type ProjectStatus = "completed" | "on_track" | "delayed";
export type TaskStatus = "not_started" | "in_progress" | "completed";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
}

export interface ProjectTask {
  id: string;
  name: string;
  completion: number;
  status: TaskStatus;
  assignedMember: string;
}

export interface ProgressUpdate {
  id: string;
  date: string;
  message: string;
  completion: number;
}

export interface Project {
  id: string;
  name: string;
  completion: number;
  status: ProjectStatus;
  deadline: string;
  team: string;
  description: string;
  assignedTo: string;
  tasks: ProjectTask[];
  updates: ProgressUpdate[];
  members: TeamMember[];
}

const projectTasks: Record<string, ProjectTask[]> = {
  "1": [
    { id: "t1", name: "Design system overhaul", completion: 100, status: "completed", assignedMember: "Mira Patel" },
    { id: "t2", name: "Component library migration", completion: 90, status: "in_progress", assignedMember: "Leo Chen" },
    { id: "t3", name: "User testing rounds", completion: 60, status: "in_progress", assignedMember: "Anya Sharma" },
    { id: "t4", name: "Accessibility audit", completion: 40, status: "in_progress", assignedMember: "James Olawale" },
  ],
  "2": [
    { id: "t5", name: "Data pipeline refactor", completion: 70, status: "in_progress", assignedMember: "Tomás Rivera" },
    { id: "t6", name: "Model retraining setup", completion: 35, status: "in_progress", assignedMember: "Sara Kim" },
    { id: "t7", name: "Latency benchmarking", completion: 20, status: "in_progress", assignedMember: "Raj Mehta" },
    { id: "t8", name: "Monitoring integration", completion: 0, status: "not_started", assignedMember: "Leo Chen" },
  ],
  "3": [
    { id: "t9", name: "iOS build finalization", completion: 100, status: "completed", assignedMember: "Anya Sharma" },
    { id: "t10", name: "Android build finalization", completion: 100, status: "completed", assignedMember: "James Olawale" },
    { id: "t11", name: "App store submission", completion: 100, status: "completed", assignedMember: "Mira Patel" },
  ],
  "4": [
    { id: "t12", name: "Stripe API integration", completion: 80, status: "in_progress", assignedMember: "Tomás Rivera" },
    { id: "t13", name: "PayPal webhook handler", completion: 55, status: "in_progress", assignedMember: "Sara Kim" },
    { id: "t14", name: "Payment testing suite", completion: 30, status: "in_progress", assignedMember: "Raj Mehta" },
  ],
  "5": [
    { id: "t15", name: "Vulnerability scanning", completion: 50, status: "in_progress", assignedMember: "James Olawale" },
    { id: "t16", name: "Penetration testing", completion: 15, status: "in_progress", assignedMember: "Leo Chen" },
    { id: "t17", name: "Compliance documentation", completion: 10, status: "in_progress", assignedMember: "Mira Patel" },
  ],
  "6": [
    { id: "t18", name: "Chart component library", completion: 100, status: "completed", assignedMember: "Anya Sharma" },
    { id: "t19", name: "Real-time data hooks", completion: 90, status: "in_progress", assignedMember: "Tomás Rivera" },
    { id: "t20", name: "Dashboard layout polish", completion: 85, status: "in_progress", assignedMember: "Sara Kim" },
  ],
  "7": [
    { id: "t21", name: "Rate limit middleware", completion: 100, status: "completed", assignedMember: "Raj Mehta" },
    { id: "t22", name: "Redis cache layer", completion: 100, status: "completed", assignedMember: "Tomás Rivera" },
  ],
  "8": [
    { id: "t23", name: "Schema mapping", completion: 75, status: "in_progress", assignedMember: "Sara Kim" },
    { id: "t24", name: "Data validation scripts", completion: 50, status: "in_progress", assignedMember: "Raj Mehta" },
    { id: "t25", name: "Rollback strategy", completion: 20, status: "in_progress", assignedMember: "Leo Chen" },
  ],
};

const projectUpdates: Record<string, ProgressUpdate[]> = {
  "1": [
    { id: "u1", date: "2026-01-10", message: "Project kicked off — design audit started", completion: 10 },
    { id: "u2", date: "2026-01-28", message: "Design system tokens finalized", completion: 30 },
    { id: "u3", date: "2026-02-14", message: "Component migration 60% done", completion: 55 },
    { id: "u4", date: "2026-03-05", message: "User testing round 1 complete", completion: 72 },
    { id: "u5", date: "2026-03-18", message: "Accessibility fixes in progress", completion: 85 },
  ],
  "2": [
    { id: "u6", date: "2026-02-01", message: "Pipeline architecture approved", completion: 8 },
    { id: "u7", date: "2026-02-20", message: "Data pipeline refactor started", completion: 25 },
    { id: "u8", date: "2026-03-10", message: "Model retraining blocked by data issue", completion: 42 },
  ],
  "3": [
    { id: "u9", date: "2025-12-15", message: "Development started", completion: 15 },
    { id: "u10", date: "2026-01-20", message: "Beta testing complete", completion: 65 },
    { id: "u11", date: "2026-02-28", message: "Final QA passed", completion: 90 },
    { id: "u12", date: "2026-03-10", message: "Published to App Store & Play Store", completion: 100 },
  ],
  "4": [
    { id: "u13", date: "2026-02-10", message: "Stripe sandbox setup done", completion: 15 },
    { id: "u14", date: "2026-03-01", message: "Core payment flow working", completion: 50 },
    { id: "u15", date: "2026-03-15", message: "PayPal integration underway", completion: 67 },
  ],
  "5": [
    { id: "u16", date: "2026-03-01", message: "Audit scope defined", completion: 10 },
    { id: "u17", date: "2026-03-12", message: "Initial vulnerability scan complete", completion: 30 },
  ],
  "6": [
    { id: "u18", date: "2026-01-25", message: "Dashboard wireframes approved", completion: 20 },
    { id: "u19", date: "2026-02-15", message: "Chart library integrated", completion: 60 },
    { id: "u20", date: "2026-03-10", message: "Real-time data streaming connected", completion: 92 },
  ],
  "7": [
    { id: "u21", date: "2026-01-15", message: "Rate limiting rules defined", completion: 25 },
    { id: "u22", date: "2026-02-10", message: "Redis layer deployed", completion: 70 },
    { id: "u23", date: "2026-02-28", message: "Load testing passed — shipped", completion: 100 },
  ],
  "8": [
    { id: "u24", date: "2026-02-15", message: "Legacy schema analyzed", completion: 15 },
    { id: "u25", date: "2026-03-05", message: "Mapping script first draft", completion: 40 },
    { id: "u26", date: "2026-03-18", message: "Validation scripts 50% done", completion: 55 },
  ],
};

const projectMembers: Record<string, TeamMember[]> = {
  "1": [
    { id: "m1", name: "Mira Patel", role: "Frontend" },
    { id: "m2", name: "Leo Chen", role: "Frontend" },
    { id: "m3", name: "Anya Sharma", role: "QA" },
    { id: "m4", name: "James Olawale", role: "Frontend" },
  ],
  "2": [
    { id: "m5", name: "Tomás Rivera", role: "Backend" },
    { id: "m6", name: "Sara Kim", role: "Data Engineer" },
    { id: "m7", name: "Raj Mehta", role: "Backend" },
    { id: "m2", name: "Leo Chen", role: "DevOps" },
  ],
  "3": [
    { id: "m3", name: "Anya Sharma", role: "Mobile" },
    { id: "m4", name: "James Olawale", role: "Mobile" },
    { id: "m1", name: "Mira Patel", role: "QA" },
  ],
  "4": [
    { id: "m5", name: "Tomás Rivera", role: "Backend" },
    { id: "m6", name: "Sara Kim", role: "Backend" },
    { id: "m7", name: "Raj Mehta", role: "QA" },
  ],
  "5": [
    { id: "m4", name: "James Olawale", role: "DevOps" },
    { id: "m2", name: "Leo Chen", role: "DevOps" },
    { id: "m1", name: "Mira Patel", role: "QA" },
  ],
  "6": [
    { id: "m3", name: "Anya Sharma", role: "Frontend" },
    { id: "m5", name: "Tomás Rivera", role: "Backend" },
    { id: "m6", name: "Sara Kim", role: "Frontend" },
  ],
  "7": [
    { id: "m7", name: "Raj Mehta", role: "Backend" },
    { id: "m5", name: "Tomás Rivera", role: "Backend" },
  ],
  "8": [
    { id: "m6", name: "Sara Kim", role: "Data Engineer" },
    { id: "m7", name: "Raj Mehta", role: "Data Engineer" },
    { id: "m2", name: "Leo Chen", role: "DevOps" },
  ],
};

export const projects: Project[] = [
  { id: "1", name: "Customer Portal Redesign", completion: 85, status: "on_track", deadline: "2026-04-15", team: "Frontend", description: "Complete overhaul of customer-facing portal with new design system, improved accessibility, and modern component architecture.", assignedTo: "1", tasks: projectTasks["1"], updates: projectUpdates["1"], members: projectMembers["1"] },
  { id: "2", name: "ML Pipeline v2", completion: 42, status: "delayed", deadline: "2026-03-28", team: "Data Engineering", description: "Upgrade ML inference pipeline for lower latency, improved model retraining workflows, and better monitoring.", assignedTo: "1", tasks: projectTasks["2"], updates: projectUpdates["2"], members: projectMembers["2"] },
  { id: "3", name: "Mobile App Launch", completion: 100, status: "completed", deadline: "2026-03-10", team: "Mobile", description: "iOS and Android app release with full feature parity to web platform.", assignedTo: "1", tasks: projectTasks["3"], updates: projectUpdates["3"], members: projectMembers["3"] },
  { id: "4", name: "Payment Integration", completion: 67, status: "on_track", deadline: "2026-05-01", team: "Backend", description: "Stripe and PayPal integration for subscription billing and one-time payments.", assignedTo: "2", tasks: projectTasks["4"], updates: projectUpdates["4"], members: projectMembers["4"] },
  { id: "5", name: "Security Audit", completion: 30, status: "delayed", deadline: "2026-03-20", team: "DevOps", description: "Comprehensive security review covering vulnerabilities, penetration testing, and compliance.", assignedTo: "2", tasks: projectTasks["5"], updates: projectUpdates["5"], members: projectMembers["5"] },
  { id: "6", name: "Analytics Dashboard", completion: 92, status: "on_track", deadline: "2026-04-05", team: "Frontend", description: "Real-time analytics dashboard for admins with live charts and data streaming.", assignedTo: "1", tasks: projectTasks["6"], updates: projectUpdates["6"], members: projectMembers["6"] },
  { id: "7", name: "API Rate Limiting", completion: 100, status: "completed", deadline: "2026-02-28", team: "Backend", description: "Implement API throttling with Redis caching and configurable rate limit rules.", assignedTo: "2", tasks: projectTasks["7"], updates: projectUpdates["7"], members: projectMembers["7"] },
  { id: "8", name: "Data Migration", completion: 55, status: "delayed", deadline: "2026-03-25", team: "Data Engineering", description: "Migrate legacy data to new schema with validation, rollback strategy, and zero-downtime deployment.", assignedTo: "1", tasks: projectTasks["8"], updates: projectUpdates["8"], members: projectMembers["8"] },
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