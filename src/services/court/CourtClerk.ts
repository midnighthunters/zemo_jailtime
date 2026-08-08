/**
 * CourtClerk.ts
 *
 * Files cases onto today's docket. There is no simulated usage here — a case is
 * only ever opened by a real event.
 *
 * Two sources:
 *
 *  1. `checkDeviceLimit()` reads the shared policy the DeviceActivityMonitor
 *     extension writes. iOS flips `blockingActive` the moment the protected
 *     apps cross their daily limit, even with JailTime closed. That is the real
 *     law break, so the clerk files a case for it.
 *
 *  2. `selfReport()` lets the user hand themselves in. Useful when they know
 *     they slipped before the system threshold fired.
 *
 * The clerk never picks a verdict. That stays with the user on the Court screen.
 */

import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { FocusLaw } from '@/src/types/court';
import { todayKey } from '@/src/utils/date';

/** The enabled law whose daily limit the native schedule is enforcing. */
export function activeLimitLaw(laws: FocusLaw[]): FocusLaw | undefined {
  const withLimits = laws.filter((law) => law.isEnabled && law.dailyLimitMinutes != null);
  if (withLimits.length === 0) return laws.find((law) => law.isEnabled);
  // The strictest limit is the one applyPolicy pushed to DeviceActivity.
  return withLimits.sort(
    (a, b) => (a.dailyLimitMinutes ?? 99) - (b.dailyLimitMinutes ?? 99),
  )[0];
}

/**
 * Polls the shared policy for a real limit breach and files a case for it.
 * Returns the case id when one is opened or already on file.
 */
export async function checkDeviceLimit(): Promise<string | undefined> {
  const state = useCourtStore.getState();
  if (!state.enforcementEnabled) return undefined;

  const policy = await IosScreenTimeService.getPolicyState();
  if (!policy.hasSelection || !policy.blockingActive) return undefined;

  const law = activeLimitLaw(state.laws);
  if (!law) return undefined;

  return useCourtStore.getState().fileCase({
    lawId: law.id,
    source: 'deviceLimit',
    dedupeKey: `limit-${law.id}`,
    title: `${law.shortName} broken`,
    evidenceLine: `Your protected apps passed their ${policy.dailyLimitMinutes} minute daily limit. iOS shielded them at the threshold.`,
  });
}

/**
 * Files a case because the user reported breaking a law themselves.
 * Deduped per law per day, same as a device-detected breach.
 */
export function selfReport(lawId: string): string | undefined {
  const state = useCourtStore.getState();
  const law = state.laws.find((item) => item.id === lawId);
  if (!law) return undefined;

  return state.fileCase({
    lawId: law.id,
    source: 'selfReported',
    dedupeKey: `self-${law.id}-${todayKey()}`,
    title: `${law.shortName} broken`,
    evidenceLine: `You reported breaking ${law.name}. The court respects an honest defendant.`,
  });
}

export const CourtClerk = { activeLimitLaw, checkDeviceLimit, selfReport };
