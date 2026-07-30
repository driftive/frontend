// Wire format returned by the API's drift analysis endpoints. Field names are snake_case to
// match the DTOs in api/pkg/model/dto/analysis_run.go.

export interface ProjectAnalysisRun {
  id: number;
  run_id: string;
  dir: string;
  type: string;
  drifted: boolean;
  succeeded: boolean;
  init_output: string;
  plan_output: string;
  skipped_due_to_pr: boolean;
  resources_added?: number | null;
  resources_changed?: number | null;
  resources_destroyed?: number | null;
}

export interface AnalysisRun {
  uuid: string;
  repository_id: number;
  total_projects: number;
  total_projects_drifted: number;
  total_projects_errored: number;
  total_projects_skipped: number;
  duration_millis: number;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRunWithProjects extends AnalysisRun {
  projects: ProjectAnalysisRun[];
}

export interface RepositoryRunStats {
  total_runs: number;
  runs_with_drift: number;
  last_run_at: string | null;
  latest_run: AnalysisRun | null;
}
