import type { ScreenTimeService } from '@/src/services/screenTime/ScreenTimeService';

export const IosScreenTimeService: ScreenTimeService = {
  async requestPermissions() {
    // TODO: Request FamilyControls AuthorizationCenter permission in a Swift native module.
    return { granted: false, reason: 'iOS Screen Time entitlements are planned for Phase 3.' };
  },
  async getPermissionStatus() {
    // TODO: Bridge FamilyControls authorization status.
    return { granted: false, reason: 'iOS FamilyControls is not connected yet.' };
  },
  async getTodayUsage() {
    // TODO: Use DeviceActivityReport extension data with app-group storage.
    return [];
  },
  async getInstalledApps() {
    // TODO: Use FamilyActivityPicker native wrapper to let users select apps.
    return [];
  },
  async startMonitoring() {
    // TODO: Schedule DeviceActivityMonitor intervals.
  },
  async stopMonitoring() {
    // TODO: Stop DeviceActivityMonitor intervals.
  },
  async shieldApp() {
    // TODO: Apply ManagedSettingsStore shields.
  },
  async unshieldApp() {
    // TODO: Remove ManagedSettingsStore shields.
  },
};
