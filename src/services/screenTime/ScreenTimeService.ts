import type { FocusLaw, PermissionId, UserProfile } from '@/src/types/court';

/**
 * What the app can actually know about the user's protected apps.
 *
 * Apple's FamilyControls keeps every `ApplicationToken` opaque: the app process
 * can never read the names, bundle IDs, or icons behind a selection. So there is
 * no "list installed apps" call here and never can be. We get counts only, and
 * the system renders the real app identities inside `FamilyActivityPicker`.
 */
export type AppSelectionCount = {
  applications: number;
  categories: number;
  webDomains: number;
};

/** Shared blocking state, written by the app and by the monitor extension. */
export type PolicyState = {
  dailyLimitMinutes: number;
  /** True once the daily limit was reached — set by the extension, even if the app was closed. */
  blockingActive: boolean;
  blockStartedAt: string | null;
  hasSelection: boolean;
};

export type ScreenTimeService = {
  requestPermissions: () => Promise<{ granted: boolean; reason?: string }>;
  getPermissionStatus: () => Promise<{ granted: boolean; reason?: string }>;
  /** Opens the system FamilyActivityPicker. The only sanctioned way to choose apps. */
  presentAppPicker: () => Promise<{ selected: boolean; count: number }>;
  hasAppSelection: () => Promise<boolean>;
  getSelectionCount: () => Promise<AppSelectionCount>;
  getPolicyState: () => Promise<PolicyState>;
  applyPolicy: (policy: { laws: FocusLaw[]; settings: UserProfile['screenTimeSettings'] }) => Promise<void>;
  clearPolicy: () => Promise<void>;
  openPermissionSettings?: (permissionId: PermissionId) => Promise<void>;
  applyImmediateBlock: () => Promise<void>;
  clearImmediateBlock: () => Promise<void>;
};
