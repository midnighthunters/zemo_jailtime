import type { FocusLaw } from '@/src/types/court';

/**
 * Read-only helpers for describing a law.
 *
 * The old per-app violation evaluator lived here. It has been removed: it scored
 * violations against simulated per-app usage counters, and iOS reports a limit
 * breach through the DeviceActivityMonitor extension without ever naming the app.
 * Real breach detection now lives in `src/services/court/CourtClerk.ts`.
 */

export function describesSchedule(law: FocusLaw) {
  const window = law.blockedStart && law.blockedEnd ? `${law.blockedStart}-${law.blockedEnd}` : undefined;
  const days = law.activeDays?.length
    ? `${law.activeDays.length} day${law.activeDays.length === 1 ? '' : 's'}`
    : 'daily';
  if (window) return `${window} ${days}`;
  if (law.focusSessionMinutes) return `${law.focusSessionMinutes} min focus`;
  if (law.cooldownMinutes) return `${law.cooldownMinutes} min cooldown`;
  if (law.unlockLimit) return `${law.unlockLimit} unlock cap`;
  if (law.dailyLimitMinutes) return `${law.dailyLimitMinutes} min limit`;
  return 'always on';
}
