import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LAWS } from '@/src/data/laws';
import { DEFAULT_PERMISSION_STATUSES } from '@/src/data/permissions';
import { DEFAULT_SUSPECTS } from '@/src/data/suspects';
import type { AgeRange, AppSuspect, Charge, CourtCase, DailyScreenTime, DreamType, FocusGoal, FocusLaw, PermissionId, PermissionStatus, StrictnessLevel, UserProfile, UserRole } from '@/src/types/court';
import { nowIso, todayKey } from '@/src/utils/date';

const freeSuspectLimit = 3;
const freeLawLimit = 3;

const initialProfile: UserProfile = {
  whyFocus: 'sleep_better',
  dangerWindow: 'late_night',
  dailyScreenGoalMinutes: 120,
  dreams: ['sleep', 'study', 'fitness'],
  bedtime: '22:30',
  wakeTime: '06:30',
  strictness: 'balanced',
  humorLevel: 'dramatic',
  screenTimeSettings: {
    monitoringEnabled: false,
    shieldIntensity: 'standard',
    blockDuringActiveSentence: true,
    allowEmergencyBypass: true,
    emergencyBypassMinutes: 5,
    requireFocusSessionForParole: false,
    notifyBeforeLimitMinutes: 5,
    weekendRelaxationMinutes: 30,
    backgroundRefreshEnabled: false,
    reopenCooldownMinutes: 10,
  },
  permissionStatuses: DEFAULT_PERMISSION_STATUSES,
  cleanRecordStreak: 0,
  focusCoins: 35,
  parolePoints: 25,
  mercyPasses: 1,
  hasCompletedOnboarding: false,
};

function mergeById<T extends { id: string }>(defaults: T[], saved?: T[]) {
  return defaults.map((item) => ({ ...item, ...(saved?.find((savedItem) => savedItem.id === item.id) ?? {}) }));
}

function mergeProfile(saved?: Partial<UserProfile>): UserProfile {
  return {
    ...initialProfile,
    ...saved,
    screenTimeSettings: {
      ...initialProfile.screenTimeSettings,
      ...saved?.screenTimeSettings,
    },
    permissionStatuses: {
      ...DEFAULT_PERMISSION_STATUSES,
      ...saved?.permissionStatuses,
    },
  };
}

function createCase(): CourtCase {
  return {
    id: todayKey(),
    date: todayKey(),
    title: 'The People vs. Your Screen Habits',
    charges: [],
    totalSentenceMinutes: 0,
    remainingSentenceSeconds: 0,
    status: 'clean',
  };
}

type ToggleResult = { allowed: boolean; reason?: string };

type CourtState = {
  profile: UserProfile;
  suspects: AppSuspect[];
  laws: FocusLaw[];
  activeCase: CourtCase;
  charges: Charge[];
  activeChargeId?: string;
  paroleRecords: {
    id: string;
    type: 'focus' | 'sleep' | 'limit' | 'streak' | 'miniAction' | 'manual' | 'purchase';
    pointsEarned: number;
    message: string;
    createdAt: string;
  }[];
  completeOnboarding: () => void;
  updateProfile: (profile: Partial<Omit<UserProfile, 'hasCompletedOnboarding'>>) => void;
  updateScreenTimeSettings: (settings: Partial<UserProfile['screenTimeSettings']>) => void;
  setPermissionStatus: (id: PermissionId, status: PermissionStatus) => void;
  toggleDream: (dream: DreamType) => void;
  toggleFocusGoal: (goal: FocusGoal) => void;
  setAgeRange: (age: AgeRange) => void;
  setUserRole: (role: UserRole) => void;
  setDailyScreenTime: (screenTime: DailyScreenTime) => void;
  toggleSuspect: (id: string, isPro?: boolean) => ToggleResult;
  toggleLaw: (id: string, isPro?: boolean) => ToggleResult;
  updateLaw: (id: string, law: Partial<FocusLaw>, isPro?: boolean) => ToggleResult;
  setStrictness: (strictness: StrictnessLevel, isPro?: boolean) => ToggleResult;
  setBedtime: (bedtime: string) => void;
  setWakeTime: (wakeTime: string) => void;
  acceptSentence: (chargeId?: string) => void;
  requestMercy: (chargeId?: string) => boolean;
  reduceSentence: (minutes: number, message: string, points?: number) => boolean;
  grantParole: (message?: string, points?: number) => void;
  tickSentence: () => void;
  resetCourtDay: () => void;
};

export const useCourtStore = create<CourtState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      suspects: DEFAULT_SUSPECTS,
      laws: DEFAULT_LAWS,
      activeCase: createCase(),
      charges: [],
      paroleRecords: [
        {
          id: 'welcome-parole',
          type: 'manual',
          pointsEarned: 25,
          message: 'The court opened your first focus record.',
          createdAt: nowIso(),
        },
      ],

      completeOnboarding() {
        set((state) => ({ profile: { ...state.profile, hasCompletedOnboarding: true } }));
      },

      updateProfile(profile) {
        set((state) => ({ profile: { ...state.profile, ...profile } }));
      },

      updateScreenTimeSettings(settings) {
        set((state) => ({
          profile: {
            ...state.profile,
            screenTimeSettings: {
              ...state.profile.screenTimeSettings,
              ...settings,
            },
          },
        }));
      },

      setPermissionStatus(id, status) {
        set((state) => ({
          profile: {
            ...state.profile,
            permissionStatuses: {
              ...state.profile.permissionStatuses,
              [id]: status,
            },
          },
        }));
      },

      toggleDream(dream) {
        set((state) => {
          const dreams = state.profile.dreams.includes(dream)
            ? state.profile.dreams.filter((item) => item !== dream)
            : [...state.profile.dreams, dream];
          return { profile: { ...state.profile, dreams } };
        });
      },

      toggleFocusGoal(goal) {
        set((state) => {
          const goals = state.profile.focusGoals ?? [];
          const updated = goals.includes(goal) ? goals.filter((g) => g !== goal) : [...goals, goal];
          return { profile: { ...state.profile, focusGoals: updated } };
        });
      },

      setAgeRange(ageRange) {
        set((state) => ({ profile: { ...state.profile, ageRange } }));
      },

      setUserRole(userRole) {
        set((state) => ({ profile: { ...state.profile, userRole } }));
      },

      setDailyScreenTime(dailyScreenTime) {
        set((state) => ({ profile: { ...state.profile, dailyScreenTime } }));
      },

      toggleSuspect(id, isPro = false) {
        const state = get();
        const suspect = state.suspects.find((item) => item.id === id);
        if (!suspect) return { allowed: false, reason: 'Suspect not found' };
        if (!suspect.isSelected && suspect.isPremium && !isPro) {
          return { allowed: false, reason: 'Supreme Court Mode unlocks this suspect.' };
        }
        const selectedCount = state.suspects.filter((item) => item.isSelected).length;
        if (!suspect.isSelected && !isPro && selectedCount >= freeSuspectLimit) {
          return { allowed: false, reason: 'Free court authority covers 3 suspect apps.' };
        }
        set((current) => ({
          suspects: current.suspects.map((item) => (item.id === id ? { ...item, isSelected: !item.isSelected } : item)),
        }));
        return { allowed: true };
      },

      toggleLaw(id, isPro = false) {
        const state = get();
        const law = state.laws.find((item) => item.id === id);
        if (!law) return { allowed: false, reason: 'Law not found' };
        if (!law.isEnabled && law.isPremium && !isPro) {
          return { allowed: false, reason: 'Higher court authority required.' };
        }
        const enabledCount = state.laws.filter((item) => item.isEnabled).length;
        if (!law.isEnabled && !isPro && enabledCount >= freeLawLimit) {
          return { allowed: false, reason: 'Free court authority covers 3 active laws.' };
        }
        set((current) => ({
          laws: current.laws.map((item) => (item.id === id ? { ...item, isEnabled: !item.isEnabled } : item)),
        }));
        return { allowed: true };
      },

      updateLaw(id, law, isPro = false) {
        const state = get();
        const target = state.laws.find((item) => item.id === id);
        if (!target) return { allowed: false, reason: 'Law not found' };
        if ((target.isPremium || target.category === 'custom') && !isPro) {
          return { allowed: false, reason: 'Supreme Court Mode unlocks custom law editing.' };
        }
        set((current) => ({
          laws: current.laws.map((item) => (item.id === id ? { ...item, ...law, id: item.id } : item)),
        }));
        return { allowed: true };
      },

      setStrictness(strictness, isPro = false) {
        if (strictness === 'brutal' && !isPro) {
          return { allowed: false, reason: 'Supreme Court Mode unlocks brutal strictness.' };
        }
        set((state) => ({ profile: { ...state.profile, strictness } }));
        return { allowed: true };
      },

      setBedtime(bedtime) {
        set((state) => ({ profile: { ...state.profile, bedtime } }));
      },

      setWakeTime(wakeTime) {
        set((state) => ({ profile: { ...state.profile, wakeTime } }));
      },

      acceptSentence(chargeId) {
        const state = get();
        const targetId = chargeId ?? state.activeChargeId ?? state.charges[0]?.id;
        const charge = state.charges.find((item) => item.id === targetId);
        if (!charge) return;

        set((current) => ({
          charges: current.charges.map((item) => (item.id === charge.id ? { ...item, status: 'sentenced' } : item)),
          activeChargeId: charge.id,
          activeCase: {
            ...current.activeCase,
            remainingSentenceSeconds: charge.punishmentMinutes * 60,
            totalSentenceMinutes: Math.max(current.activeCase.totalSentenceMinutes, charge.punishmentMinutes),
            status: 'jailed',
          },
        }));
      },

      requestMercy(chargeId) {
        const state = get();
        if (state.profile.mercyPasses <= 0) return false;
        const targetId = chargeId ?? state.activeChargeId ?? state.charges[0]?.id;
        if (!targetId) return false;
        set((current) => ({
          profile: {
            ...current.profile,
            mercyPasses: current.profile.mercyPasses - 1,
            parolePoints: current.profile.parolePoints + 12,
          },
          charges: current.charges.map((item) => (item.id === targetId ? { ...item, status: 'pardoned' } : item)),
          activeChargeId: undefined,
          activeCase: {
            ...current.activeCase,
            status: 'parole',
          },
          paroleRecords: [
            {
              id: `mercy-${Date.now()}`,
              type: 'manual',
              pointsEarned: 12,
              message: 'Mercy pass accepted. The court allows emergencies, not excuses.',
              createdAt: nowIso(),
            },
            ...current.paroleRecords,
          ],
        }));
        return true;
      },

      reduceSentence(minutes, message, points = Math.max(5, minutes * 3)) {
        let granted = false;
        set((current) => {
          const remaining = Math.max(0, current.activeCase.remainingSentenceSeconds - minutes * 60);
          granted = remaining === 0;
          return {
            profile: {
              ...current.profile,
              focusCoins: current.profile.focusCoins + Math.max(1, minutes),
              parolePoints: current.profile.parolePoints + points,
              cleanRecordStreak: granted ? current.profile.cleanRecordStreak + 1 : current.profile.cleanRecordStreak,
            },
            activeCase: {
              ...current.activeCase,
              remainingSentenceSeconds: remaining,
              status: granted ? 'parole' : current.activeCase.status,
            },
            paroleRecords: [
              {
                id: `mini-${Date.now()}`,
                type: 'miniAction',
                pointsEarned: points,
                message,
                createdAt: nowIso(),
              },
              ...current.paroleRecords,
            ],
          };
        });
        return granted;
      },

      grantParole(message = 'Parole granted. You protected your focus record.', points = 20) {
        set((current) => ({
          profile: {
            ...current.profile,
            parolePoints: current.profile.parolePoints + points,
            focusCoins: current.profile.focusCoins + 10,
            cleanRecordStreak: current.profile.cleanRecordStreak + 1,
          },
          activeChargeId: undefined,
          activeCase: {
            ...current.activeCase,
            remainingSentenceSeconds: 0,
            status: 'parole',
          },
          paroleRecords: [
            {
              id: `parole-${Date.now()}`,
              type: 'focus',
              pointsEarned: points,
              message,
              createdAt: nowIso(),
            },
            ...current.paroleRecords,
          ],
        }));
      },

      tickSentence() {
        set((current) => {
          if (current.activeCase.status !== 'jailed' || current.activeCase.remainingSentenceSeconds <= 0) return current;
          const remaining = Math.max(0, current.activeCase.remainingSentenceSeconds - 1);
          return {
            activeCase: {
              ...current.activeCase,
              remainingSentenceSeconds: remaining,
              status: remaining === 0 ? 'parole' : 'jailed',
            },
          };
        });
      },

      resetCourtDay() {
        set((current) => ({
          activeChargeId: undefined,
          activeCase: createCase(),
          suspects: current.suspects.map((suspect) => ({ ...suspect, dailyUsageMinutes: 0, dailyOpenCount: 0 })),
        }));
      },
    }),
    {
      name: 'focus-court-store',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<CourtState> | undefined;
        return {
          ...current,
          ...saved,
          profile: mergeProfile(saved?.profile),
          laws: mergeById(DEFAULT_LAWS, saved?.laws),
          suspects: mergeById(DEFAULT_SUSPECTS, saved?.suspects),
          activeCase: saved?.activeCase ?? current.activeCase,
          charges: saved?.charges ?? current.charges,
          paroleRecords: saved?.paroleRecords ?? current.paroleRecords,
        };
      },
    },
  ),
);
