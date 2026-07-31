import {AnalysisRun} from "../../model/AnalysisRun.ts";

export type StatusFilter = 'all' | 'drifted' | 'errored' | 'skipped' | 'ok';

/** How often to re-fetch a live run. */
export const LIVE_POLL_MS = 3000;

/** How often to re-fetch a runs list that contains at least one live run. */
export const LIVE_LIST_POLL_MS = 5000;

/**
 * A live run whose updated_at is older than this is treated as stale. The CLI heartbeats every 15s
 * even when nothing changed, so silence this long means the runner is very likely gone. The API
 * deletes it outright at 15 minutes.
 */
export const STALE_AFTER_MS = 60_000;

/** True while the run is still being scanned. */
export const isRunLive = (run?: Pick<AnalysisRun, 'status'> | null): boolean =>
  run?.status === 'RUNNING';

/**
 * Milliseconds between polls, or false to stop. Completion is signalled by status, never by
 * comparing project counts: a cancelled scan legitimately reports fewer checked projects than
 * total_projects and simply stops.
 */
export const pollInterval = (run?: Pick<AnalysisRun, 'status'> | null): number | false =>
  isRunLive(run) ? LIVE_POLL_MS : false;

/** True when a run claims to be live but has not reported in for a while. */
export const isRunStale = (
  run?: Pick<AnalysisRun, 'status' | 'updated_at'> | null,
  now: number = Date.now(),
): boolean => {
  if (!isRunLive(run) || !run?.updated_at) return false;
  const updatedAt = new Date(run.updated_at).getTime();
  if (Number.isNaN(updatedAt)) return false;
  return now - updatedAt > STALE_AFTER_MS;
};

export interface ProjectCounts {
  drifted: number;
  errored: number;
  skipped: number;
}

/**
 * The status filter to apply when the user has not picked one.
 *
 * While a run is live this is forced to 'all': the drifted-first auto-pick would otherwise hide
 * rows mid-scan, so the table would appear to lose projects as they finish. Once the run completes
 * the usual drifted > errored > skipped > all priority applies.
 */
export const defaultStatusFilter = (
  run: Pick<AnalysisRun, 'status'> | null | undefined,
  counts: ProjectCounts,
): StatusFilter => {
  if (!run || isRunLive(run)) return 'all';
  if (counts.drifted > 0) return 'drifted';
  if (counts.errored > 0) return 'errored';
  if (counts.skipped > 0) return 'skipped';
  return 'all';
};

/** Elapsed wall-clock time of a live run, which has no meaningful duration_millis yet. */
export const elapsedMillis = (
  run: Pick<AnalysisRun, 'created_at'>,
  now: number = Date.now(),
): number => {
  const startedAt = new Date(run.created_at).getTime();
  if (Number.isNaN(startedAt)) return 0;
  return Math.max(0, now - startedAt);
};

/**
 * Fraction of the scan that has completed, clamped to [0, 1]. Guards against total_projects being
 * 0 on the very first progress post, before the CLI has reported a count.
 */
export const scanProgress = (analyzed: number, totalProjects: number): number => {
  if (totalProjects <= 0) return 0;
  return Math.min(1, Math.max(0, analyzed / totalProjects));
};
