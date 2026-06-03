import type { FocusCourtAssetKey } from '@/src/constants/assets';

export type StrictnessLevel = 'soft' | 'balanced' | 'brutal';
export type HumorLevel = 'light' | 'sarcastic' | 'dramatic';

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
};

export type FocusLaw = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: AppCategory | 'all';
  appIds: string[];
  dailyLimitMinutes?: number;
  blockedStart?: string;
  blockedEnd?: string;
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
  dreams: DreamType[];
  customDream?: string;
  bedtime: string;
  wakeTime: string;
  strictness: StrictnessLevel;
  humorLevel: HumorLevel;
  cleanRecordStreak: number;
  focusCoins: number;
  parolePoints: number;
  mercyPasses: number;
  hasCompletedOnboarding: boolean;
};
