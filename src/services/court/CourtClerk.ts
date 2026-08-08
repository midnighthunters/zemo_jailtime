/**
 * CourtClerk.ts
 *
 * Watches the store for broken focus laws and files cases onto today's docket.
 *
 * A law is broken when a monitored suspect's daily usage crosses the daily
 * limit of an enabled law that governs it. `fileCase` dedupes on
 * date + lawId + appId, so one law break yields exactly one case per day.
 *
 * The clerk only files. It never decides a verdict — that stays with the user
 * on the Court screen.
 */

import { useCourtStore } from '@/src/store/useCourtStore';
import type { AppSuspect, BlockCategory, FocusLaw } from '@/src/types/court';

function blockCategory(suspect: AppSuspect): BlockCategory {
  return suspect.blockCategory ?? 'distracting';
}

/** Apps the court is allowed to file against. */
export function monitoredSuspects(suspects: AppSuspect[]) {
  return suspects.filter((suspect) => {
    const category = blockCategory(suspect);
    if (category === 'alwaysAllowed') return false;
    if (category === 'neverAllowed') return true;
    return suspect.isSelected;
  });
}

/** The enabled law that governs an app, most specific first. */
export function governingLaw(laws: FocusLaw[], suspect: AppSuspect): FocusLaw | undefined {
  const enabled = laws.filter((law) => law.isEnabled);
  return (
    enabled.find((law) => law.appIds?.includes(suspect.id)) ??
    enabled.find((law) => law.category === suspect.category) ??
    enabled.find((law) => law.category === 'all')
  );
}

/**
 * Files a case for every monitored app that is over its governing law's daily
 * limit. Returns the ids of any cases created or already on file.
 */
export function evaluateNow(): string[] {
  const state = useCourtStore.getState();
  if (!state.enforcementEnabled) return [];

  const filed: string[] = [];
  for (const suspect of monitoredSuspects(state.suspects)) {
    const law = governingLaw(state.laws, suspect);
    if (!law) continue;

    const limit = law.dailyLimitMinutes;
    if (limit == null) continue;
    if (suspect.dailyUsageMinutes < limit) continue;

    const id = useCourtStore.getState().fileCase({
      lawId: law.id,
      appId: suspect.id,
      evidenceLine: `${suspect.displayName} ran ${suspect.dailyUsageMinutes} min against a ${limit} min limit.`,
    });
    if (id) filed.push(id);
  }
  return filed;
}

/**
 * Files a case because the user tried to open a monitored app. This is the
 * interactive path and it works without native usage data.
 */
export function fileForAppLaunch(appId: string): string | undefined {
  const state = useCourtStore.getState();
  const suspect = state.suspects.find((item) => item.id === appId);
  if (!suspect) return undefined;

  const law = governingLaw(state.laws, suspect);
  if (!law) return undefined;

  return state.fileCase({
    lawId: law.id,
    appId: suspect.id,
    evidenceLine: `${suspect.displayName} was opened while ${law.name} was in force.`,
  });
}

export const CourtClerk = { evaluateNow, fileForAppLaunch, governingLaw, monitoredSuspects };
