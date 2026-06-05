import type { PermissionId, PermissionRequirement, PermissionStatus } from '@/src/types/court';

export const DEFAULT_PERMISSION_STATUSES: Record<PermissionId, PermissionStatus> = {
  notifications: 'unknown',
  screenTimeAuthorization: 'unknown',
  usageAccess: 'unknown',
  installedApps: 'unknown',
  appShielding: 'unknown',
  overlayBlocker: 'unknown',
  accessibilityBlocker: 'unknown',
  backgroundMonitoring: 'unknown',
  bootRecovery: 'unknown',
};

export const PERMISSION_REQUIREMENTS: PermissionRequirement[] = [
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Sends warnings before limits, bedtime notices, and parole reminders.',
    platform: 'all',
    requiredForProduction: true,
    settingsPath: 'System notification permission',
    status: 'unknown',
  },
  {
    id: 'screenTimeAuthorization',
    title: 'iOS Screen Time',
    description: 'Authorizes Family Controls, Device Activity, and Managed Settings.',
    platform: 'ios',
    requiredForProduction: true,
    settingsPath: 'Family Controls authorization sheet',
    status: 'unknown',
  },
  {
    id: 'usageAccess',
    title: 'Android Usage Access',
    description: 'Reads foreground app usage through UsageStatsManager.',
    platform: 'android',
    requiredForProduction: true,
    settingsPath: 'Settings > Apps > Special app access > Usage access',
    status: 'unknown',
  },
  {
    id: 'installedApps',
    title: 'App Selection',
    description: 'Lets users pick real apps instead of generic suspect groups.',
    platform: 'all',
    requiredForProduction: true,
    settingsPath: 'Native app picker or launcher-app query',
    status: 'unknown',
  },
  {
    id: 'appShielding',
    title: 'App Shielding',
    description: 'Applies active blocks when a law is violated.',
    platform: 'ios',
    requiredForProduction: true,
    settingsPath: 'Managed Settings shield entitlement',
    status: 'unknown',
  },
  {
    id: 'overlayBlocker',
    title: 'Android Block Screen',
    description: 'Shows a compliant block screen when a watched app is opened.',
    platform: 'android',
    requiredForProduction: true,
    settingsPath: 'Settings > Apps > Special app access > Display over other apps',
    status: 'unknown',
  },
  {
    id: 'accessibilityBlocker',
    title: 'Accessibility Guard',
    description: 'Optional stronger foreground detection for hard blocks, with clear user consent.',
    platform: 'android',
    requiredForProduction: false,
    settingsPath: 'Settings > Accessibility',
    status: 'unknown',
  },
  {
    id: 'backgroundMonitoring',
    title: 'Background Monitoring',
    description: 'Keeps law checks alive after the app is closed.',
    platform: 'all',
    requiredForProduction: true,
    settingsPath: 'Device Activity extension or Android foreground service',
    status: 'unknown',
  },
  {
    id: 'bootRecovery',
    title: 'Restart Recovery',
    description: 'Restores monitoring after an Android device restart.',
    platform: 'android',
    requiredForProduction: false,
    settingsPath: 'Android RECEIVE_BOOT_COMPLETED receiver',
    status: 'unknown',
  },
];

export function permissionCopy(id: PermissionId) {
  return PERMISSION_REQUIREMENTS.find((permission) => permission.id === id);
}
