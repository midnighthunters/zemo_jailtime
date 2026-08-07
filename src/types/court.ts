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

// How the court treats an app:
//  - distracting   → monitored & jailed when limits are broken (the default offenders)
//  - alwaysAllowed → whitelisted, never blocked (e.g. phone, maps, messages)
//  - neverAllowed  → hard-locked at all times (no parole, shows a lock overlay)
export type BlockCategory = 'distracting' | 'alwaysAllowed' | 'neverAllowed';

export type AppSuspect = {
  id: string;
  displayName: string;
  packageName?: string;
  bundleId?: string;
  category: AppCategory;
  villainName: string;
  dailyUsageMinutes: number;
  dailyOpenCount: number;
  dangerLevel: 1 | 2 | 3 | 4 | 5;
  iconColor: string;
  isSelected: boolean;
  isPremium?: boolean;
  // ── Distraction management ──
  blockCategory?: BlockCategory;
  isWebsite?: boolean;
  url?: string;
  isCustom?: boolean;
  // Temporary unblock granted via the breathing flow — ISO timestamp.
  unblockedUntil?: string;
};

// A running focus timer. When it ends it can reduce an active jail sentence.
export type FocusSession = {
  id: string;
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
  reducesJail: boolean;
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

export type Charge = {
  id: string;
  lawId: string;
  appId: string;
  title: string;
  description: string;
  evidenceLine: string;
  severity: 1 | 2 | 3 | 4 | 5;
  punishmentMinutes: number;
  createdAt: string;
  status: 'filed' | 'sentenced' | 'served' | 'pardoned';
};

export type CourtCase = {
  id: string;
  date: string;
  title: string;
  charges: Charge[];
  totalSentenceMinutes: number;
  remainingSentenceSeconds: number;
  status: 'clean' | 'warning' | 'charged' | 'jailed' | 'parole' | 'dismissed';
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
