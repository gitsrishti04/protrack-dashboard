import { PredictionInput } from "@/services/api";

/**
 * Calculate prediction features from project and task data
 * This transforms your project data into the format expected by the ML models
 */
export const calculatePredictionFeatures = (
  totalTasks: number,
  completedTasks: number,
  delayedTasks: number,
  teamSize: number
): PredictionInput => {
  // Calculate derived features
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskCompletionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const delayedTaskRate = totalTasks > 0 ? delayedTasks / totalTasks : 0;

  return {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    delayed_tasks: delayedTasks,
    team_size: teamSize,
    completion_pct: completionPct,
    task_completion_rate: taskCompletionRate,
    delayed_task_rate: delayedTaskRate,
  };
};

/**
 * Example: Calculate features from a project object
 * Adjust this based on your actual project structure
 */
export const calculateFeaturesFromProject = (project: {
  total_tasks?: number;
  completed_tasks?: number;
  delayed_tasks?: number;
  team_size?: number;
  tasks?: Array<{ status: string }>;
  team_members?: Array<{ id: number }>;
}): PredictionInput | null => {
  // If you have task array, calculate from it
  if (project.tasks && project.tasks.length > 0) {
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === "completed").length;
    const delayedTasks = project.tasks.filter((t) => t.status === "delayed").length;
    const teamSize = project.team_members?.length || 1;

    return calculatePredictionFeatures(totalTasks, completedTasks, delayedTasks, teamSize);
  }

  // Otherwise use provided fields
  if (
    project.total_tasks !== undefined &&
    project.completed_tasks !== undefined &&
    project.delayed_tasks !== undefined &&
    project.team_size !== undefined
  ) {
    return calculatePredictionFeatures(
      project.total_tasks,
      project.completed_tasks,
      project.delayed_tasks,
      project.team_size
    );
  }

  return null;
};
