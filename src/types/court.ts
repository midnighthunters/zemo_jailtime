import type { FocusCourtAssetKey } from '@/src/constants/assets';

export type StrictnessLevel = 'soft' | 'balanced' | 'brutal';
export type HumorLevel = 'light' | 'sarcastic' | 'dramatic';
export type FocusReason = 'sleep_better' | 'study_work' | 'be_present' | 'less_doomscrolling';
export type DangerWindow = 'morning' | 'afternoon' | 'evening' | 'late_night';
export type FocusGoal = 'focus_better' | 'sleep_better' | 'be_present' | 'reduce_anxiety' | 'read_more' | 'exercise_more' | 'spend_less' | 'study_better';
export type UserRole = 'student' | 'entrepreneur' | 'remote_worker' | 'technologist' | 'creative' | 'parent' | 'executive' | 'other';
export type AgeRange = 'under_18' | '18_24' | '25_34' | '35_44' | '45_54' | '55_plus';
export type DailyScreenTime = 'under_2h' | '2_4h' | '4_6h' | '6_8h' | 'over_8h';
export type EnforcementMode = 'notice' | 'softBlock' | 'hardBlock' | 'focusSession';
export type LawTrigger = 'appLaunch' | 'dailyLimit' | 'blockedWindow' | 'pickupLoop' | 'focusSession' | 'unlockCount';
export type PermissionStatus = 'unknown' | 'granted' | 'missing' | 'blocked' | 'notAvailable';
export type PermissionId =
  | 'notifications'
  | 'screenTimeAuthorization'
  | 'installedApps'
  | 'appShielding'
  | 'backgroundMonitoring';
export type ShieldIntensity = 'gentle' | 'standard' | 'lockdown';

export type DreamType =
  | 'sleep'
  | 'fitness'
  | 'study'
  | 'career'
  | 'business'
  | 'reading'
  | 'family'
  | 'peace'
  | 'confidence'
  | 'creativity'
  | 'spirituality'
  | 'custom';

export type AppCategory =
  | 'social'
  | 'shortVideo'
  | 'video'
  | 'game'
  | 'shopping'
  | 'dating'
  | 'news'
  | 'custom';

/**
 * The user's protected apps, as much as iOS will ever tell us.
 *
 * A FamilyActivityPicker selection is a set of opaque `ApplicationToken`s. The
 * app process cannot read their names, bundle IDs, or icons — only how many were
 * chosen. So the court tracks counts and lets the system name the apps inside
 * the picker and on its own shield screen.
 */
export type AppSelection = {
  applications: number;
  categories: number;
  webDomains: number;
  /** ISO timestamp of the last time the user confirmed a selection. */
  updatedAt?: string;
};

// A running focus timer.
// When `caseId` is set the session serves that case and releases the app on
// completion. Without a `caseId` it is free-standing deep work that only earns
// parole points.
export type FocusSession = {
  id: string;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
  caseId?: string;
};

export type FocusLaw = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: AppCategory | 'all';
  appIds: string[];
  trigger?: LawTrigger;
  enforcementMode?: EnforcementMode;
  requiredPermissionIds?: readonly PermissionId[];
  dailyLimitMinutes?: number;
  blockedStart?: string;
  blockedEnd?: string;
  activeDays?: readonly (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  focusSessionMinutes?: number;
  cooldownMinutes?: number;
  unlockLimit?: number;
  graceOpens: number;
  firstPunishmentMinutes: number;
  repeatMultiplier: number;
  maxSentenceMinutes: number;
  strictness: StrictnessLevel;
  isEnabled: boolean;
  isPremium?: boolean;
  assetKey: FocusCourtAssetKey;
  judgeLine: string;
  prosecutorLine: string;
  paroleRewardLine: string;
};

export type PermissionRequirement = {
  id: PermissionId;
  title: string;
  description: string;
  platform: 'all' | 'ios';
  requiredForProduction: boolean;
  settingsPath: string;
  status: PermissionStatus;
};

// Where a case sits on today's docket.
//  - hearing   → law broken, case filed, awaiting the user's call
//  - warning   → let off with a notice; the app stays open
//  - jailed    → the app is locked until focus time is served
//  - served    → focus time completed; the app is released
//  - dismissed → thrown out via mercy pass or the user's choice
export type CaseVerdict = 'hearing' | 'warning' | 'jailed' | 'served' | 'dismissed';

/**
 * One break of one focus law. The docket holds every case filed today and is
 * renewed from scratch at the start of each local day.
 *
 * A case is scoped to a law, not to a named app: iOS reports that the protected
 * selection crossed its limit without ever revealing which app did it. A
 * `jailed` verdict shields the whole protected selection.
 */
export type CourtCase = {
  id: string;
  // Local day key (YYYY-MM-DD) this case belongs to.
  date: string;
  lawId: string;
  lawName: string;
  title: string;
  evidenceLine: string;
  severity: 1 | 2 | 3 | 4 | 5;
  verdict: CaseVerdict;
  filedAt: string;
  resolvedAt?: string;
  /** How the case reached the court. */
  source: 'deviceLimit' | 'selfReported';
  // Focus minutes required to clear a `jailed` verdict.
  requiredFocusMinutes: number;
  // Focus seconds banked so far. Partial sessions still count.
  focusServedSeconds: number;
};

export type ParoleRecord = {
  id: string;
  type: 'focus' | 'sleep' | 'limit' | 'streak' | 'miniAction' | 'manual' | 'purchase';
  pointsEarned: number;
  message: string;
  createdAt: string;
};

export type UserProfile = {
  name?: string;
  whyFocus?: FocusReason;
  focusGoals?: FocusGoal[];
  userRole?: UserRole;
  ageRange?: AgeRange;
  dailyScreenTime?: DailyScreenTime;
  dangerWindow?: DangerWindow;
  dailyScreenGoalMinutes: number;
  dreams: DreamType[];
  customDream?: string;
  bedtime: string;
  wakeTime: string;
  strictness: StrictnessLevel;
  humorLevel: HumorLevel;
  screenTimeSettings: {
    monitoringEnabled: boolean;
    shieldIntensity: ShieldIntensity;
    blockDuringActiveSentence: boolean;
    allowEmergencyBypass: boolean;
    emergencyBypassMinutes: number;
    requireFocusSessionForParole: boolean;
    notifyBeforeLimitMinutes: number;
    weekendRelaxationMinutes: number;
    backgroundRefreshEnabled: boolean;
    reopenCooldownMinutes: number;
  };
  permissionStatuses: Record<PermissionId, PermissionStatus>;
  cleanRecordStreak: number;
  focusCoins: number;
  parolePoints: number;
  mercyPasses: number;
  hasCompletedOnboarding: boolean;
};
