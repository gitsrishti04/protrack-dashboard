import { AlertCircle, CheckCircle, Clock, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FullPrediction } from "@/services/api";

interface PredictionCardProps {
  prediction: FullPrediction | null;
  loading?: boolean;
  error?: string | null;
}

export default function PredictionCard({ prediction, loading = false, error = null }: PredictionCardProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 rounded-lg border border-destructive/20 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Failed to load predictions</span>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const isDelayed = prediction.is_delayed === 1;
  const delayProbability = (prediction.probability_delayed * 100).toFixed(0);
  const onTrackProbability = (prediction.probability_on_track * 100).toFixed(0);

  return (
    <div className="space-y-3">
      {/* Delay Risk Card */}
      <div
        className={cn(
          "rounded-lg border p-4 transition-colors",
          isDelayed
            ? "bg-destructive/10 border-destructive/30"
            : "bg-success/10 border-success/30"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {isDelayed ? (
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
            )}
            <div>
              <h4 className="font-semibold text-sm mb-1">
                {isDelayed ? "At Risk of Delay" : "On Track"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isDelayed
                  ? `${delayProbability}% probability of delay`
                  : `${onTrackProbability}% probability of staying on track`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Time Card */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Estimated Completion</h4>
            <p className="text-lg font-bold text-primary">
              {prediction.days_remaining} days
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on current progress and team velocity
            </p>
          </div>
        </div>
      </div>

      {/* Confidence Breakdown */}
      <div className="bg-card rounded-lg border border-border p-4">
        <h4 className="font-semibold text-sm mb-3">Prediction Confidence</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">On Track</span>
              <span className="font-medium">{onTrackProbability}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${onTrackProbability}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">At Risk</span>
              <span className="font-medium">{delayProbability}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-destructive rounded-full transition-all"
                style={{ width: `${delayProbability}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
