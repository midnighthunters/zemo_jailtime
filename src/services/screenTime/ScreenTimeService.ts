import type { AppCategory, AppSuspect, FocusLaw, PermissionId, UserProfile } from '@/src/types/court';

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
  applyPolicy?: (policy: { laws: FocusLaw[]; suspects: AppSuspect[]; settings: UserProfile['screenTimeSettings'] }) => Promise<void>;
  clearPolicy?: () => Promise<void>;
  openPermissionSettings?: (permissionId: PermissionId) => Promise<void>;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  shieldApp?: (appId: string, minutes: number) => Promise<void>;
  unshieldApp?: (appId: string) => Promise<void>;
};
