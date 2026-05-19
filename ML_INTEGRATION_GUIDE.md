# ML Predictions Integration Guide

This guide explains how to integrate the ML prediction models into your frontend dashboard.

## What's Been Created

### Backend (Already Done)
- ✅ `train.py` - Trains both ML models
- ✅ `predict.py` - Loads models and makes predictions
- ✅ `predictions.py` - FastAPI endpoints

### Frontend (New Files)
- ✅ `src/services/api.ts` - Updated with prediction API functions
- ✅ `src/hooks/usePredictions.ts` - Custom hook for predictions
- ✅ `src/components/PredictionCard.tsx` - UI component to display predictions
- ✅ `src/lib/predictionUtils.ts` - Utility functions to calculate features

---

## How It Works

### 1. Feature Calculation
Your project data → Calculate features → Send to API

```typescript
// Example: Calculate features from project data
const features = calculatePredictionFeatures(
  totalTasks: 20,
  completedTasks: 10,
  delayedTasks: 2,
  teamSize: 5
);
// Returns: { total_tasks, completed_tasks, delayed_tasks, team_size, completion_pct, task_completion_rate, delayed_task_rate }
```

### 2. API Call
Send features to backend → ML models predict → Return results

```typescript
const prediction = await predictFull(token, features);
// Returns: { is_delayed, probability_on_track, probability_delayed, days_remaining }
```

### 3. Display Results
Show predictions in UI

```typescript
<PredictionCard prediction={prediction} loading={loading} error={error} />
```

---

## Integration Examples

### Example 1: Add Predictions to Project Card

**File:** `src/components/ProjectCard.tsx`

```typescript
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";
import PredictionCard from "./PredictionCard";
import { useEffect } from "react";

export default function ProjectCard({
  id,
  name,
  completion,
  status,
  deadline,
  team,
  totalTasks,
  completedTasks,
  delayedTasks,
  teamSize,
  onUpdate,
}: ProjectCardProps) {
  const { fullPrediction, loading, error, getFullPrediction } = usePredictions();

  useEffect(() => {
    // Calculate features and get predictions when component mounts
    const features = calculatePredictionFeatures(
      totalTasks,
      completedTasks,
      delayedTasks,
      teamSize
    );
    getFullPrediction(features);
  }, [totalTasks, completedTasks, delayedTasks, teamSize]);

  return (
    <div className="group bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      {/* Existing card content */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-card-foreground text-base leading-tight">
            {name}
          </h3>
        </div>
        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", className)}>
          {label}
        </span>
      </div>

      {/* Add predictions section */}
      <div className="mt-4 pt-4 border-t border-border">
        <PredictionCard 
          prediction={fullPrediction} 
          loading={loading} 
          error={error} 
        />
      </div>
    </div>
  );
}
```

### Example 2: Add Predictions to Project Detail Page

**File:** `src/pages/ProjectDetail.tsx` (or similar)

```typescript
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";
import PredictionCard from "@/components/PredictionCard";
import { useEffect, useState } from "react";

export default function ProjectDetail({ projectId }: { projectId: number }) {
  const [project, setProject] = useState(null);
  const { fullPrediction, loading, error, getFullPrediction } = usePredictions();

  useEffect(() => {
    // Fetch project data
    fetchProject(projectId).then((data) => {
      setProject(data);

      // Calculate and get predictions
      const features = calculatePredictionFeatures(
        data.total_tasks,
        data.completed_tasks,
        data.delayed_tasks,
        data.team_size
      );
      getFullPrediction(features);
    });
  }, [projectId]);

  return (
    <div className="space-y-6">
      {/* Project info */}
      <div>
        <h1 className="text-3xl font-bold">{project?.name}</h1>
        <p className="text-muted-foreground">{project?.description}</p>
      </div>

      {/* Predictions section */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">AI Predictions</h2>
        <PredictionCard 
          prediction={fullPrediction} 
          loading={loading} 
          error={error} 
        />
      </div>

      {/* Other project details */}
    </div>
  );
}
```

### Example 3: Add Predictions to Dashboard Overview

**File:** `src/pages/Dashboard.tsx`

```typescript
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";
import PredictionCard from "@/components/PredictionCard";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const { fullPrediction, loading, error, getFullPrediction } = usePredictions();

  useEffect(() => {
    // Fetch all projects
    fetchProjects().then((data) => {
      setProjects(data);

      // Get predictions for the first project (or aggregate)
      if (data.length > 0) {
        const project = data[0];
        const features = calculatePredictionFeatures(
          project.total_tasks,
          project.completed_tasks,
          project.delayed_tasks,
          project.team_size
        );
        getFullPrediction(features);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* AI Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
          <PredictionCard 
            prediction={fullPrediction} 
            loading={loading} 
            error={error} 
          />
        </div>

        {/* Other dashboard sections */}
      </div>
    </div>
  );
}
```

---

## API Endpoints Reference

### 1. Delay Risk Prediction
```
POST /api/predictions/delay-risk
```

**Request:**
```json
{
  "total_tasks": 20,
  "completed_tasks": 10,
  "delayed_tasks": 2,
  "team_size": 5,
  "completion_pct": 50,
  "task_completion_rate": 0.5,
  "delayed_task_rate": 0.1
}
```

**Response:**
```json
{
  "is_delayed": 0,
  "probability_on_track": 0.85,
  "probability_delayed": 0.15
}
```

### 2. Completion Time Prediction
```
POST /api/predictions/completion-time
```

**Response:**
```json
{
  "days_remaining": 15
}
```

### 3. Full Prediction (Recommended)
```
POST /api/predictions/full-prediction
```

**Response:**
```json
{
  "is_delayed": 0,
  "probability_on_track": 0.85,
  "probability_delayed": 0.15,
  "days_remaining": 15
}
```

---

## Usage in Your Components

### Using the Hook

```typescript
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";

function MyComponent() {
  const { 
    fullPrediction,    // Combined prediction result
    delayRisk,         // Just delay risk
    completionTime,    // Just completion time
    loading,           // Loading state
    error,             // Error message
    getFullPrediction, // Function to fetch predictions
    getDelayRisk,      // Function to fetch delay risk only
    getCompletionTime, // Function to fetch completion time only
    reset              // Function to clear predictions
  } = usePredictions();

  // Fetch predictions
  const handleGetPredictions = async () => {
    const features = calculatePredictionFeatures(20, 10, 2, 5);
    await getFullPrediction(features);
  };

  return (
    <div>
      <button onClick={handleGetPredictions}>Get Predictions</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {fullPrediction && (
        <div>
          <p>Days Remaining: {fullPrediction.days_remaining}</p>
          <p>Delay Risk: {(fullPrediction.probability_delayed * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## Feature Explanation

The ML models expect these features:

| Feature | Type | Description |
|---------|------|-------------|
| `total_tasks` | int | Total number of tasks in project |
| `completed_tasks` | int | Number of completed tasks |
| `delayed_tasks` | int | Number of delayed tasks |
| `team_size` | int | Number of team members |
| `completion_pct` | int | Completion percentage (0-100) |
| `task_completion_rate` | float | Ratio of completed to total (0-1) |
| `delayed_task_rate` | float | Ratio of delayed to total (0-1) |

---

## Next Steps

1. **Identify where to display predictions** in your dashboard
2. **Update your project/task data structure** to include the required fields
3. **Add the PredictionCard component** to your pages
4. **Test the integration** by running the backend and frontend together

---

## Troubleshooting

### "Failed to load predictions"
- Check that the backend is running (`python -m uvicorn app.main:app --reload`)
- Verify the API endpoint is correct in `api.ts`
- Check browser console for CORS errors

### "Module not found" errors
- Ensure all new files are created in the correct paths
- Check that imports use the correct relative paths

### Predictions seem incorrect
- Verify the feature values are being calculated correctly
- Check that the models were trained successfully (`.pkl` files exist)
- Review the training data in `synthetic_completion.csv`

---

## Performance Tips

1. **Cache predictions** - Don't refetch for the same project data
2. **Batch requests** - Get predictions for multiple projects in parallel
3. **Debounce updates** - Wait for user to finish editing before fetching new predictions
4. **Show loading states** - Use the `loading` flag to show spinners

---

## Future Enhancements

- Add resource allocation predictions
- Implement prediction history tracking
- Add confidence intervals
- Create prediction alerts/notifications
- Add model retraining endpoint
