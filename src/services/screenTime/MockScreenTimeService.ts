import { DEFAULT_SUSPECTS } from '@/src/data/suspects';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { ScreenTimeService, ScreenTimeUsageEvent } from '@/src/services/screenTime/ScreenTimeService';
import type { Charge } from '@/src/types/court';

export const MockScreenTimeService: ScreenTimeService & {
  simulateAppOpen: (appId: string) => Charge | undefined;
} = {
  async requestPermissions() {
    return { granted: true };
  },

  async getPermissionStatus() {
    return { granted: true };
  },

  async getTodayUsage() {
    const suspects = useCourtStore.getState().suspects;
    return suspects.map<ScreenTimeUsageEvent>((suspect, index) => ({
      appId: suspect.id,
      displayName: suspect.displayName,
      category: suspect.category,
      startedAt: new Date(Date.now() - (index + 1) * 35 * 60 * 1000).toISOString(),
      endedAt: new Date(Date.now() - index * 20 * 60 * 1000).toISOString(),
      durationMinutes: suspect.dailyUsageMinutes,
    }));
  },

  async getInstalledApps() {
    return DEFAULT_SUSPECTS;
  },

  async startMonitoring() {
    return undefined;
  },

  async stopMonitoring() {
    return undefined;
  },

  simulateAppOpen(appId: string) {
    return useCourtStore.getState().simulateAppOpen(appId);
  },
};
