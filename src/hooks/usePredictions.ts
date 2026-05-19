import { useState, useCallback } from "react";
import Cookies from "js-cookie";
import {
  predictDelayRisk,
  predictCompletionTime,
  predictFull,
  PredictionInput,
  DelayRiskPrediction,
  CompletionTimePrediction,
  FullPrediction,
} from "@/services/api";

interface UsePredictionsReturn {
  loading: boolean;
  error: string | null;
  delayRisk: DelayRiskPrediction | null;
  completionTime: CompletionTimePrediction | null;
  fullPrediction: FullPrediction | null;
  getDelayRisk: (data: PredictionInput) => Promise<void>;
  getCompletionTime: (data: PredictionInput) => Promise<void>;
  getFullPrediction: (data: PredictionInput) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for ML predictions
 * Handles loading, error states, and provides prediction functions
 */
export const usePredictions = (): UsePredictionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [delayRisk, setDelayRisk] = useState<DelayRiskPrediction | null>(null);
  const [completionTime, setCompletionTime] = useState<CompletionTimePrediction | null>(null);
  const [fullPrediction, setFullPrediction] = useState<FullPrediction | null>(null);

  const token = Cookies.get("token") || "";

  const getDelayRisk = useCallback(
    async (data: PredictionInput) => {
      setLoading(true);
      setError(null);
      try {
        const result = await predictDelayRisk(token, data);
        setDelayRisk(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get delay risk prediction");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getCompletionTime = useCallback(
    async (data: PredictionInput) => {
      setLoading(true);
      setError(null);
      try {
        const result = await predictCompletionTime(token, data);
        setCompletionTime(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get completion time prediction");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getFullPrediction = useCallback(
    async (data: PredictionInput) => {
      setLoading(true);
      setError(null);
      try {
        const result = await predictFull(token, data);
        setFullPrediction(result);
        setDelayRisk({
          is_delayed: result.is_delayed,
          probability_on_track: result.probability_on_track,
          probability_delayed: result.probability_delayed,
        });
        setCompletionTime({
          days_remaining: result.days_remaining,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to get predictions");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const reset = useCallback(() => {
    setDelayRisk(null);
    setCompletionTime(null);
    setFullPrediction(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    delayRisk,
    completionTime,
    fullPrediction,
    getDelayRisk,
    getCompletionTime,
    getFullPrediction,
    reset,
  };
};
