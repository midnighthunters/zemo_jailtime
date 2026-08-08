/**
 * BlockingBridge.ts
 *
 * Thin coordinator that translates court store events into real iOS blocking calls.
 * Import and call `initBlockingBridge()` once from app/_layout.tsx.
 *
 * It subscribes to the Zustand store and:
 *   • When the first app enters custody → applyImmediateBlock()
 *   • When the last app leaves custody  → clearImmediateBlock()
 *
 * The iOS bridge only exposes a global immediate block, so the native shield is
 * all-or-nothing while per-app locking is enforced in-app. Turning off
 * `enforcementEnabled` always clears the shield.
 *
 * applyPolicy() is called whenever the user toggles a law or suspect
 * so the DeviceActivityMonitor schedule stays in sync.
 */

import { Platform } from 'react-native';
import { IosScreenTimeService } from '@/src/services/screenTime/IosScreenTimeService';
import { useCourtStore } from '@/src/store/useCourtStore';
import { jailedAppIds } from '@/src/utils/docket';

let _initialized = false;
let _previousBlocking = false;

export function initBlockingBridge() {
  if (_initialized || Platform.OS !== 'ios') return;
  _initialized = true;

  useCourtStore.subscribe((state) => {
    const shouldBlock = state.enforcementEnabled && jailedAppIds(state.cases).length > 0;

    if (shouldBlock && !_previousBlocking) {
      // First app entered custody → shield now.
      IosScreenTimeService.applyImmediateBlock().catch(() => undefined);
    } else if (!shouldBlock && _previousBlocking) {
      // Docket cleared, released, or enforcement switched off → unshield.
      IosScreenTimeService.clearImmediateBlock().catch(() => undefined);
    }

    _previousBlocking = shouldBlock;
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
