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
import { appsLocked } from '@/src/utils/docket';

let _initialized = false;
let _previousBlocking = false;

export function initBlockingBridge() {
  if (_initialized || Platform.OS !== 'ios') return;
  _initialized = true;

  useCourtStore.subscribe((state) => {
    const shouldBlock = appsLocked(state.cases, state.enforcementEnabled);

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
 * Call after changing laws or the app selection to push the updated daily-limit
 * schedule to DeviceActivityMonitor. No-ops until the user has picked real apps,
 * since the native schedule needs a selection to watch.
 */
export async function syncPolicyToNative() {
  if (Platform.OS !== 'ios') return;
  const { laws, profile, appSelection } = useCourtStore.getState();
  const hasSelection =
    appSelection.applications + appSelection.categories + appSelection.webDomains > 0;
  if (!hasSelection) return;

  await IosScreenTimeService.applyPolicy({
    laws,
    settings: profile.screenTimeSettings,
  });
}

/**
 * Reads the real selection back from the system and stores the counts. Called on
 * launch and after the picker closes so the UI always reflects the device.
 */
export async function syncAppSelectionFromNative() {
  if (Platform.OS !== 'ios') return;
  const counts = await IosScreenTimeService.getSelectionCount();
  useCourtStore.getState().setAppSelection(counts);
}
