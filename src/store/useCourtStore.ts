import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LAWS } from '@/src/data/laws';
import { DEFAULT_SUSPECTS } from '@/src/data/suspects';
import type { AppSuspect, Charge, CourtCase, DreamType, FocusLaw, StrictnessLevel, UserProfile } from '@/src/types/court';
import { evidenceLine, randomCaseId } from '@/src/utils/copy';
import { nowIso, todayKey } from '@/src/utils/date';
import { sentenceForRepeat } from '@/src/utils/sentence';

const freeSuspectLimit = 3;
const freeLawLimit = 3;

const initialProfile: UserProfile = {
  dreams: ['sleep', 'study', 'fitness'],
  bedtime: '22:30',
  wakeTime: '06:30',
  strictness: 'balanced',
  humorLevel: 'dramatic',
  cleanRecordStreak: 0,
  focusCoins: 35,
  parolePoints: 25,
  mercyPasses: 1,
  hasCompletedOnboarding: false,
};

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
  toggleDream: (dream: DreamType) => void;
  toggleSuspect: (id: string, isPro?: boolean) => ToggleResult;
  toggleLaw: (id: string, isPro?: boolean) => ToggleResult;
  setStrictness: (strictness: StrictnessLevel, isPro?: boolean) => ToggleResult;
  setBedtime: (bedtime: string) => void;
  setWakeTime: (wakeTime: string) => void;
  simulateAppOpen: (appId: string) => Charge | undefined;
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

      toggleDream(dream) {
        set((state) => {
          const dreams = state.profile.dreams.includes(dream)
            ? state.profile.dreams.filter((item) => item !== dream)
            : [...state.profile.dreams, dream];
          return { profile: { ...state.profile, dreams } };
        });
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

      simulateAppOpen(appId) {
        const state = get();
        const suspect = state.suspects.find((item) => item.id === appId);
        if (!suspect) return undefined;

        const nextOpenCount = suspect.dailyOpenCount + 1;
        const nextUsage = suspect.dailyUsageMinutes + Math.ceil(4 + suspect.dangerLevel * 2);
        const updatedSuspect = { ...suspect, dailyOpenCount: nextOpenCount, dailyUsageMinutes: nextUsage };
        const matchingLaw = state.laws.find(
          (law) =>
            law.isEnabled &&
            (law.category === 'all' || law.category === suspect.category || law.appIds.includes(suspect.id)),
        );

        let charge: Charge | undefined;
        if (matchingLaw && nextOpenCount > matchingLaw.graceOpens) {
          const punishmentMinutes = sentenceForRepeat(matchingLaw, state.charges);
          charge = {
            id: `${matchingLaw.id}-${Date.now()}`,
            lawId: matchingLaw.id,
            appId: suspect.id,
            title: 'Charges Filed',
            description: `${matchingLaw.shortName} was violated by ${suspect.displayName}.`,
            evidenceLine: evidenceLine(suspect.displayName, nextOpenCount),
            severity: suspect.dangerLevel,
            punishmentMinutes,
            createdAt: nowIso(),
            status: 'filed',
          };
        }

        set((current) => {
          const updatedSuspects = current.suspects.map((item) => (item.id === appId ? updatedSuspect : item));
          if (!charge) {
            return {
              suspects: updatedSuspects,
              activeCase: {
                ...current.activeCase,
                status: current.activeCase.status === 'clean' ? 'warning' : current.activeCase.status,
              },
            };
          }

          const charges = [charge, ...current.charges];
          const caseCharges = [charge, ...current.activeCase.charges];
          return {
            suspects: updatedSuspects,
            charges,
            activeChargeId: charge.id,
            activeCase: {
              ...current.activeCase,
              title: `${randomCaseId()}: The People vs. ${suspect.displayName}`,
              charges: caseCharges,
              totalSentenceMinutes: current.activeCase.totalSentenceMinutes + charge.punishmentMinutes,
              status: 'charged',
            },
          };
        });

        return charge;
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
    },
  ),
);
