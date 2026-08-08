/**
 * IosScreenTimeService.ts
 *
 * Bridges the Swift FocusCourtModule to the ScreenTimeService interface. This is
 * the only screen-time implementation — there is no mock. Every app under the
 * court's authority is a real app the user picked on this device through
 * Apple's FamilyActivityPicker.
 *
 * The native module exposes:
 *   FocusCourtModule.requestAuthorization()       → { granted, reason? }
 *   FocusCourtModule.getAuthorizationStatus()     → "authorized"|"denied"|"notDetermined"
 *   FocusCourtModule.presentAppPicker()           → { selected, count, categories, webDomains }
 *   FocusCourtModule.hasAppSelection()            → boolean
 *   FocusCourtModule.getSelectionCount()          → { applications, categories, webDomains }
 *   FocusCourtModule.getPolicyState()             → { dailyLimitMinutes, blockingActive, blockStartedAt, hasSelection }
 *   FocusCourtModule.applyPolicy(minutes)         → { success }
 *   FocusCourtModule.clearPolicy()                → { success }
 *   FocusCourtModule.applyImmediateBlock()        → { success }
 *   FocusCourtModule.clearImmediateBlock()        → { success }
 */

import { NativeModules, Platform } from 'react-native';
import type {
  AppSelectionCount,
  PolicyState,
  ScreenTimeService,
} from '@/src/services/screenTime/ScreenTimeService';

// Unavailable in Expo Go — the FamilyControls entitlement needs a dev/release build.
const { FocusCourtModule } = NativeModules as {
  FocusCourtModule?: {
    requestAuthorization(): Promise<{ granted: boolean; reason?: string }>;
    getAuthorizationStatus(): Promise<'authorized' | 'denied' | 'notDetermined'>;
    presentAppPicker(): Promise<{ selected: boolean; count: number }>;
    hasAppSelection(): Promise<boolean>;
    getSelectionCount(): Promise<AppSelectionCount>;
    getPolicyState(): Promise<PolicyState>;
    applyPolicy(dailyLimitMinutes: number): Promise<{ success: boolean }>;
    clearPolicy(): Promise<{ success: boolean }>;
    applyImmediateBlock(): Promise<{ success: boolean }>;
    clearImmediateBlock(): Promise<{ success: boolean }>;
  };
};

const EMPTY_SELECTION: AppSelectionCount = { applications: 0, categories: 0, webDomains: 0 };

const EMPTY_POLICY: PolicyState = {
  dailyLimitMinutes: 30,
  blockingActive: false,
  blockStartedAt: null,
  hasSelection: false,
};

/** True only in a build that actually contains the native module. */
export function screenTimeAvailable() {
  return Platform.OS === 'ios' && FocusCourtModule != null;
}

export const IosScreenTimeService: ScreenTimeService = {
  // ── Authorization ───────────────────────────────────────────────────────

  async requestPermissions() {
    if (!screenTimeAvailable()) {
      return {
        granted: false,
        reason: 'Screen Time needs a development or release build — it is unavailable in Expo Go.',
      };
    }
    return FocusCourtModule!.requestAuthorization();
  },

  async getPermissionStatus() {
    if (!screenTimeAvailable()) {
      return { granted: false, reason: 'Screen Time is unavailable in this build.' };
    }
    const status = await FocusCourtModule!.getAuthorizationStatus();
    return {
      granted: status === 'authorized',
      reason: status !== 'authorized' ? `FamilyControls status: ${status}` : undefined,
    };
  },

  // ── App selection ───────────────────────────────────────────────────────

  async presentAppPicker() {
    if (!screenTimeAvailable()) return { selected: false, count: 0 };
    return FocusCourtModule!.presentAppPicker();
  },

  async hasAppSelection() {
    if (!screenTimeAvailable()) return false;
    return FocusCourtModule!.hasAppSelection();
  },

  async getSelectionCount() {
    if (!screenTimeAvailable()) return EMPTY_SELECTION;
    try {
      return await FocusCourtModule!.getSelectionCount();
    } catch {
      return EMPTY_SELECTION;
    }
  },

  // ── Policy ──────────────────────────────────────────────────────────────

  async getPolicyState() {
    if (!screenTimeAvailable()) return EMPTY_POLICY;
    try {
      return await FocusCourtModule!.getPolicyState();
    } catch {
      return EMPTY_POLICY;
    }
  },

  async applyPolicy(policy) {
    if (!screenTimeAvailable()) return;
    // The DeviceActivity schedule takes one threshold, so the strictest enabled
    // daily limit wins.
    const strictest = policy.laws
      .filter((law) => law.isEnabled && law.dailyLimitMinutes != null)
      .sort((a, b) => (a.dailyLimitMinutes ?? 99) - (b.dailyLimitMinutes ?? 99))[0];
    await FocusCourtModule!.applyPolicy(strictest?.dailyLimitMinutes ?? 30);
  },

  async clearPolicy() {
    if (!screenTimeAvailable()) return;
    await FocusCourtModule!.clearPolicy();
  },

  async openPermissionSettings() {
    if (!screenTimeAvailable()) return;
    // requestAuthorization already presents the system sheet.
    await FocusCourtModule!.requestAuthorization();
  },

  // ── Shield ──────────────────────────────────────────────────────────────

  async applyImmediateBlock() {
    if (!screenTimeAvailable()) return;
    await FocusCourtModule!.applyImmediateBlock();
  },

  async clearImmediateBlock() {
    if (!screenTimeAvailable()) return;
    await FocusCourtModule!.clearImmediateBlock();
  },
};
