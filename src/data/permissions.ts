import type { PermissionId, PermissionRequirement, PermissionStatus } from '@/src/types/court';

export const DEFAULT_PERMISSION_STATUSES: Record<PermissionId, PermissionStatus> = {
  notifications: 'unknown',
  screenTimeAuthorization: 'unknown',
  installedApps: 'unknown',
  appShielding: 'unknown',
  backgroundMonitoring: 'unknown',
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
    id: 'installedApps',
    title: 'App Selection',
    description: 'Lets users select real apps through the iOS FamilyActivityPicker.',
    platform: 'ios',
    requiredForProduction: true,
    settingsPath: 'FamilyActivityPicker',
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
    id: 'backgroundMonitoring',
    title: 'Background Monitoring',
    description: 'Keeps law checks alive after the app is closed.',
    platform: 'ios',
    requiredForProduction: true,
    settingsPath: 'DeviceActivityMonitor extension',
    status: 'unknown',
  },
];

export function permissionCopy(id: PermissionId) {
  return PERMISSION_REQUIREMENTS.find((permission) => permission.id === id);
}
