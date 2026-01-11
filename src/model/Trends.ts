export interface DriftRateDataPoint {
  date: string;
  total_runs: number;
  runs_with_drift: number;
  drift_rate_percent: number;
}

export interface FrequentlyDriftedProject {
  dir: string;
  type: string;
  drift_count: number;
  total_appearances: number;
  drift_percentage: number;
}

export interface DriftFreeStreak {
  streak_count: number;
  last_run_at: string | null;
}

export interface ResolutionTimeDataPoint {
  date: string;
  resolutions_count: number;
  avg_hours_to_resolve: number;
}

export interface TrendsSummary {
  total_runs: number;
  runs_with_drift: number;
  drift_rate_percent: number;
  streak_count: number;
}

export interface RepositoryTrends {
  summary: TrendsSummary;
  drift_rate_over_time: DriftRateDataPoint[];
  frequently_drifted_projects: FrequentlyDriftedProject[];
  drift_free_streak: DriftFreeStreak;
  resolution_times: ResolutionTimeDataPoint[];
  days_back: number;
}
