/**
 * EXAMPLE COMPONENT - Shows how to use predictions in your dashboard
 * 
 * This is a complete working example you can copy and adapt.
 * Remove this file once you've integrated predictions into your actual components.
 */

import { useState, useEffect } from "react";
import { usePredictions } from "@/hooks/usePredictions";
import { calculatePredictionFeatures } from "@/lib/predictionUtils";
import PredictionCard from "./PredictionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PredictionExample() {
  // Form state for manual feature input
  const [formData, setFormData] = useState({
    total_tasks: 20,
    completed_tasks: 10,
    delayed_tasks: 2,
    team_size: 5,
  });

  // Predictions hook
  const { fullPrediction, loading, error, getFullPrediction } = usePredictions();

  // Fetch predictions on component mount
  useEffect(() => {
    handleGetPredictions();
  }, []);

  const handleGetPredictions = async () => {
    const features = calculatePredictionFeatures(
      formData.total_tasks,
      formData.completed_tasks,
      formData.delayed_tasks,
      formData.team_size
    );
    await getFullPrediction(features);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">ML Predictions Example</h1>
        <p className="text-muted-foreground">
          This is an example component showing how to use the ML predictions in your dashboard.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-xl font-semibold">Project Metrics</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Total Tasks</label>
            <Input
              type="number"
              name="total_tasks"
              value={formData.total_tasks}
              onChange={handleInputChange}
              min="1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Completed Tasks</label>
            <Input
              type="number"
              name="completed_tasks"
              value={formData.completed_tasks}
              onChange={handleInputChange}
              min="0"
              max={formData.total_tasks}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Delayed Tasks</label>
            <Input
              type="number"
              name="delayed_tasks"
              value={formData.delayed_tasks}
              onChange={handleInputChange}
              min="0"
              max={formData.total_tasks}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Team Size</label>
            <Input
              type="number"
              name="team_size"
              value={formData.team_size}
              onChange={handleInputChange}
              min="1"
            />
          </div>
        </div>

        <Button onClick={handleGetPredictions} disabled={loading} className="w-full">
          {loading ? "Getting Predictions..." : "Get Predictions"}
        </Button>
      </div>

      {/* Predictions Display */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="text-xl font-semibold mb-4">Predictions</h2>
        <PredictionCard prediction={fullPrediction} loading={loading} error={error} />
      </div>

      {/* Debug Info */}
      {fullPrediction && (
        <div className="bg-muted rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold mb-2">Raw Prediction Data</h3>
          <pre className="text-xs overflow-auto bg-background p-3 rounded border border-border">
            {JSON.stringify(fullPrediction, null, 2)}
          </pre>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-semibold text-sm mb-2">How to Use This</h3>
        <ol className="text-sm space-y-1 list-decimal list-inside">
          <li>Adjust the project metrics using the form above</li>
          <li>Click "Get Predictions" to fetch ML predictions</li>
          <li>View the predictions in the card below</li>
          <li>Copy this pattern into your actual project components</li>
        </ol>
      </div>

      {/* Integration Tips */}
      <div className="bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
        <h3 className="font-semibold text-sm mb-2">Integration Tips</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Use <code className="bg-background px-1 rounded">usePredictions</code> hook in your components</li>
          <li>Calculate features using <code className="bg-background px-1 rounded">calculatePredictionFeatures</code></li>
          <li>Display results with <code className="bg-background px-1 rounded">PredictionCard</code> component</li>
          <li>Handle loading and error states properly</li>
          <li>Cache predictions to avoid unnecessary API calls</li>
        </ul>
      </div>
    </div>
  );
}
