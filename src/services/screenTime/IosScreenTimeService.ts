/**
 * IosScreenTimeService.ts
 *
 * Bridges the Swift FocusCourtModule native module to the ScreenTimeService
 * interface used by the rest of the app.
 *
 * The native module exposes:
 *   FocusCourtModule.requestAuthorization()       → { granted, reason? }
 *   FocusCourtModule.getAuthorizationStatus()     → "authorized"|"denied"|"notDetermined"
 *   FocusCourtModule.presentAppPicker()           → { selected, count }
 *   FocusCourtModule.hasAppSelection()            → boolean
 *   FocusCourtModule.applyPolicy(minutes)         → { success }
 *   FocusCourtModule.clearPolicy()                → { success }
 *   FocusCourtModule.applyImmediateBlock()        → { success }
 *   FocusCourtModule.clearImmediateBlock()        → { success }
 */

import { NativeModules, Platform } from 'react-native';
import type { ScreenTimeService } from '@/src/services/screenTime/ScreenTimeService';

// Pull the native module — it is unavailable in Expo Go without the iOS native module.
const { FocusCourtModule } = NativeModules as {
  FocusCourtModule?: {
    requestAuthorization(): Promise<{ granted: boolean; reason?: string }>;
    getAuthorizationStatus(): Promise<'authorized' | 'denied' | 'notDetermined'>;
    presentAppPicker(): Promise<{ selected: boolean; count: number }>;
    hasAppSelection(): Promise<boolean>;
    applyPolicy(dailyLimitMinutes: number): Promise<{ success: boolean }>;
    clearPolicy(): Promise<{ success: boolean }>;
    applyImmediateBlock(): Promise<{ success: boolean }>;
    clearImmediateBlock(): Promise<{ success: boolean }>;
  };
};

function nativeAvailable() {
  return Platform.OS === 'ios' && FocusCourtModule != null;
}

export const IosScreenTimeService: ScreenTimeService & {
  /** Show FamilyActivityPicker so user can choose which apps to monitor. */
  presentAppPicker(): Promise<{ selected: boolean; count: number }>;
  /** Check if user has already selected apps. */
  hasAppSelection(): Promise<boolean>;
  /** Shield selected apps immediately (sentence active). */
  applyImmediateBlock(): Promise<void>;
  /** Remove immediate shield (parole granted / emergency bypass). */
  clearImmediateBlock(): Promise<void>;
} = {
  // ── Authorization ───────────────────────────────────────────────────────

  async requestPermissions() {
    if (!nativeAvailable()) {
      return { granted: false, reason: 'FocusCourtModule not available on this platform.' };
    }
    const result = await FocusCourtModule!.requestAuthorization();
    return result;
  },

  async getPermissionStatus() {
    if (!nativeAvailable()) {
      return { granted: false, reason: 'iOS only.' };
    }
    const status = await FocusCourtModule!.getAuthorizationStatus();
    return {
      granted: status === 'authorized',
      reason: status !== 'authorized' ? `FamilyControls status: ${status}` : undefined,
    };
  },

  // ── App picker ──────────────────────────────────────────────────────────

  async presentAppPicker() {
    if (!nativeAvailable()) return { selected: false, count: 0 };
    return FocusCourtModule!.presentAppPicker();
  },

  async hasAppSelection() {
    if (!nativeAvailable()) return false;
    return FocusCourtModule!.hasAppSelection();
  },

  // ── Policy (schedule-based daily limit blocking) ────────────────────────

  async applyPolicy(policy) {
    if (!nativeAvailable()) return;
    // Use the first enabled law that has a dailyLimitMinutes, or fall back to 30
    const firstLimit = policy.laws
      .filter((l) => l.isEnabled && l.dailyLimitMinutes != null)
      .sort((a, b) => (a.dailyLimitMinutes ?? 99) - (b.dailyLimitMinutes ?? 99))[0];
    const minutes = firstLimit?.dailyLimitMinutes ?? 30;
    await FocusCourtModule!.applyPolicy(minutes);
  },

  async clearPolicy() {
    if (!nativeAvailable()) return;
    await FocusCourtModule!.clearPolicy();
  },

  // ── Immediate block / unblock (sentence / parole) ───────────────────────

  async applyImmediateBlock() {
    if (!nativeAvailable()) return;
    await FocusCourtModule!.applyImmediateBlock();
  },

  async clearImmediateBlock() {
    if (!nativeAvailable()) return;
    await FocusCourtModule!.clearImmediateBlock();
  },

  // ── Stubs for interface methods not yet backed by a report extension ────

  async getTodayUsage() {
    // DeviceActivityReport requires a separate App Extension using SwiftUI.
    // For now return an empty array — usage data comes from the court store simulation.
    return [];
  },

  async getInstalledApps() {
    // FamilyActivityPicker is the only sanctioned way to get this on iOS.
    // Return empty — the picker stores the selection natively.
    return [];
  },

  async openPermissionSettings() {
    if (!nativeAvailable()) return;
    // requestAuthorization already presents the system sheet
    await FocusCourtModule!.requestAuthorization();
  },

  async startMonitoring() {
    // Monitoring starts automatically when applyPolicy() is called.
  },

  async stopMonitoring() {
    if (!nativeAvailable()) return;
    await FocusCourtModule!.clearPolicy();
  },

  async shieldApp() {
    // Individual app shielding goes through applyImmediateBlock which shields
    // the whole selection. Per-app granularity requires the selection to contain
    // only that app — handled at the JS level via the picker.
    if (!nativeAvailable()) return;
    await FocusCourtModule!.applyImmediateBlock();
  },

  async unshieldApp() {
    if (!nativeAvailable()) return;
    await FocusCourtModule!.clearImmediateBlock();
  },
};
