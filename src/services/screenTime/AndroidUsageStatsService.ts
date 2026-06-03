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
