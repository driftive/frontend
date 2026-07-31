import {describe, expect, it} from 'vitest'
import {AnalysisRun} from '../../model/AnalysisRun.ts'
import {
  defaultStatusFilter,
  elapsedMillis,
  isRunLive,
  isRunStale,
  LIVE_POLL_MS,
  pollInterval,
  scanProgress,
  STALE_AFTER_MS,
} from './runStatus.ts'

const run = (over: Partial<AnalysisRun> = {}): AnalysisRun => ({
  uuid: 'run-1',
  repository_id: 1,
  total_projects: 10,
  total_projects_drifted: 0,
  total_projects_errored: 0,
  total_projects_skipped: 0,
  duration_millis: 0,
  status: 'COMPLETED',
  created_at: '2026-07-30T12:00:00Z',
  updated_at: '2026-07-30T12:00:00Z',
  ...over,
})

const noCounts = {drifted: 0, errored: 0, skipped: 0}

describe('isRunLive', () => {
  it('is true only for RUNNING', () => {
    expect(isRunLive(run({status: 'RUNNING'}))).toBe(true)
    expect(isRunLive(run({status: 'COMPLETED'}))).toBe(false)
  })

  it('treats a missing run as not live, so an unloaded page does not poll', () => {
    expect(isRunLive(undefined)).toBe(false)
    expect(isRunLive(null)).toBe(false)
  })
})

describe('pollInterval', () => {
  it('polls while the run is live', () => {
    expect(pollInterval(run({status: 'RUNNING'}))).toBe(LIVE_POLL_MS)
  })

  it('stops polling once the run completes', () => {
    expect(pollInterval(run({status: 'COMPLETED'}))).toBe(false)
  })

  it('keeps polling a stale live run, so it recovers if the CLI comes back', () => {
    const stale = run({status: 'RUNNING', updated_at: '2026-07-30T12:00:00Z'})
    const now = new Date('2026-07-30T12:05:00Z').getTime()
    expect(isRunStale(stale, now)).toBe(true)
    expect(pollInterval(stale)).toBe(LIVE_POLL_MS)
  })
})

describe('isRunStale', () => {
  const now = new Date('2026-07-30T12:00:00Z').getTime()

  it('is false for a live run that just reported', () => {
    expect(isRunStale(run({status: 'RUNNING', updated_at: '2026-07-30T11:59:55Z'}), now)).toBe(false)
  })

  it('is true once a live run goes quiet past the threshold', () => {
    const updatedAt = new Date(now - STALE_AFTER_MS - 1000).toISOString()
    expect(isRunStale(run({status: 'RUNNING', updated_at: updatedAt}), now)).toBe(true)
  })

  it('is never true for a completed run, however old', () => {
    expect(isRunStale(run({status: 'COMPLETED', updated_at: '2020-01-01T00:00:00Z'}), now)).toBe(false)
  })

  it('is false when updated_at is unparseable rather than showing a bogus warning', () => {
    expect(isRunStale(run({status: 'RUNNING', updated_at: 'not-a-date'}), now)).toBe(false)
  })
})

describe('defaultStatusFilter', () => {
  it("forces 'all' while live even when a drifted project is already present", () => {
    const live = run({status: 'RUNNING'})
    expect(defaultStatusFilter(live, {drifted: 3, errored: 1, skipped: 1})).toBe('all')
  })

  it('applies the drifted > errored > skipped > all priority once completed', () => {
    const done = run({status: 'COMPLETED'})
    expect(defaultStatusFilter(done, {drifted: 2, errored: 1, skipped: 1})).toBe('drifted')
    expect(defaultStatusFilter(done, {drifted: 0, errored: 1, skipped: 1})).toBe('errored')
    expect(defaultStatusFilter(done, {drifted: 0, errored: 0, skipped: 1})).toBe('skipped')
    expect(defaultStatusFilter(done, noCounts)).toBe('all')
  })

  it("falls back to 'all' before the run has loaded", () => {
    expect(defaultStatusFilter(undefined, {drifted: 5, errored: 0, skipped: 0})).toBe('all')
  })
})

describe('elapsedMillis', () => {
  it('measures from created_at', () => {
    const now = new Date('2026-07-30T12:00:30Z').getTime()
    expect(elapsedMillis(run({created_at: '2026-07-30T12:00:00Z'}), now)).toBe(30_000)
  })

  it('never goes negative when clocks disagree', () => {
    const now = new Date('2026-07-30T11:59:00Z').getTime()
    expect(elapsedMillis(run({created_at: '2026-07-30T12:00:00Z'}), now)).toBe(0)
  })
})

describe('scanProgress', () => {
  it('reports the analyzed fraction', () => {
    expect(scanProgress(5, 10)).toBe(0.5)
  })

  it('returns 0 rather than NaN before total_projects is known', () => {
    expect(scanProgress(0, 0)).toBe(0)
  })

  it('clamps to 1 if more projects report than the announced total', () => {
    expect(scanProgress(12, 10)).toBe(1)
  })
})
