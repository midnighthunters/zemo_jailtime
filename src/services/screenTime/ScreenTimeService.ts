import type { AppCategory, AppSuspect } from '@/src/types/court';

export type ScreenTimeUsageEvent = {
  appId: string;
  displayName: string;
  category: AppCategory;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
};

export type ScreenTimeService = {
  requestPermissions: () => Promise<{ granted: boolean; reason?: string }>;
  getPermissionStatus: () => Promise<{ granted: boolean; reason?: string }>;
  getTodayUsage: () => Promise<ScreenTimeUsageEvent[]>;
  getInstalledApps: () => Promise<AppSuspect[]>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  shieldApp?: (appId: string, minutes: number) => Promise<void>;
  unshieldApp?: (appId: string) => Promise<void>;
};
