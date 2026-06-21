/**
 * BlockingBridge.ts
 *
 * Thin coordinator that translates court store events into real iOS blocking calls.
 * Import and call `initBlockingBridge()` once from app/_layout.tsx.
 *
 * It subscribes to the Zustand store and:
 *   • When case status becomes 'jailed'   → applyImmediateBlock()
 *   • When case status leaves  'jailed'   → clearImmediateBlock()
 *
 * applyPolicy() is called whenever the user toggles a law or suspect
 * so the DeviceActivityMonitor schedule stays in sync.
 */

import { Platform } from 'react-native';
import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';
import { useCourtStore } from '@/src/store/useCourtStore';

let _initialized = false;
let _previousJailed = false;

export function initBlockingBridge() {
  if (_initialized || Platform.OS !== 'ios') return;
  _initialized = true;

  useCourtStore.subscribe((state) => {
    const isJailed = state.activeCase.status === 'jailed';

    if (isJailed && !_previousJailed) {
      // Sentence just started → block apps now
      IosScreenTimeService.applyImmediateBlock().catch(() => undefined);
    } else if (!isJailed && _previousJailed) {
      // Sentence ended (parole, mercy, bypass) → unblock
      IosScreenTimeService.clearImmediateBlock().catch(() => undefined);
    }

    _previousJailed = isJailed;
  });
}

/**
 * Call after toggling suspects or laws to push the updated daily-limit
 * schedule to DeviceActivityMonitor.
 */
export async function syncPolicyToNative() {
  if (Platform.OS !== 'ios') return;
  const { laws, suspects, profile } = useCourtStore.getState();
  const selectedSuspects = suspects.filter((s) => s.isSelected);
  if (selectedSuspects.length === 0) return;

  await IosScreenTimeService.applyPolicy?.({
    laws,
    suspects,
    settings: profile.screenTimeSettings,
  });
}
