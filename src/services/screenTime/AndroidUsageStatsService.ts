import type { ScreenTimeService } from '@/src/services/screenTime/ScreenTimeService';

export const AndroidUsageStatsService: ScreenTimeService = {
  async requestPermissions() {
    // TODO: Open ACTION_USAGE_ACCESS_SETTINGS through a config-plugin-backed native module.
    return { granted: false, reason: 'Android native UsageStatsManager module is planned for Phase 2.' };
  },
  async getPermissionStatus() {
    // TODO: Check PACKAGE_USAGE_STATS through native code.
    return { granted: false, reason: 'Android usage access is not connected yet.' };
  },
  async getTodayUsage() {
    // TODO: Read UsageEvents/UsageStatsManager and normalize foreground sessions.
    return [];
  },
  async getInstalledApps() {
    // TODO: Query launcher apps natively and map them into AppSuspect values.
    return [];
  },
  async applyPolicy() {
    // TODO: Translate enabled laws into UsageStats polling, warning notifications, and block-screen state.
  },
  async openPermissionSettings() {
    // TODO: Open Usage Access, overlay, notification, and accessibility settings through native intents.
  },
  async startMonitoring() {
    // TODO: Start foreground monitoring service or compliant polling strategy.
  },
  async stopMonitoring() {
    // TODO: Stop native monitoring service.
  },
  async shieldApp() {
    // TODO: Present blocking activity for foreground app when threshold is exceeded.
  },
  async unshieldApp() {
    // TODO: Clear active block state.
  },
};
