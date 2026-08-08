import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LAWS } from '@/src/data/laws';
import { DEFAULT_PERMISSION_STATUSES } from '@/src/data/permissions';
import { DEFAULT_SUSPECTS } from '@/src/data/suspects';
import type { AgeRange, AppCategory, AppSuspect, BlockCategory, CaseVerdict, CourtCase, DailyScreenTime, DreamType, FocusGoal, FocusLaw, FocusSession, PermissionId, PermissionStatus, StrictnessLevel, UserProfile, UserRole } from '@/src/types/court';
import { nowIso, todayKey } from '@/src/utils/date';
import { caseFocusRemainingSeconds } from '@/src/utils/docket';
import { sentenceForRepeat } from '@/src/utils/sentence';

const freeSuspectLimit = 3;
const freeLawLimit = 3;
// The court will never grant more than 15 minutes of temporary access.
export const MAX_UNBLOCK_MINUTES = 15;

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
  const merged = defaults.map((item) => ({ ...item, ...(saved?.find((savedItem) => savedItem.id === item.id) ?? {}) }));
  // Preserve user-added items (e.g. custom apps) that aren't in the defaults.
  const defaultIds = new Set(defaults.map((item) => item.id));
  const extras = (saved ?? []).filter((item) => !defaultIds.has(item.id));
  return [...merged, ...extras];
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

type ToggleResult = { allowed: boolean; reason?: string };

// Input for filing a case. Everything not supplied is derived from the law and
// the suspect so callers stay terse.
type FileCaseInput = {
  lawId: string;
  appId: string;
  title?: string;
  evidenceLine?: string;
  requiredFocusMinutes?: number;
};

type AddSuspectInput = {
  displayName: string;
  category: AppCategory;
  villainName?: string;
  iconColor?: string;
  dangerLevel?: 1 | 2 | 3 | 4 | 5;
  blockCategory?: BlockCategory;
  isWebsite?: boolean;
  url?: string;
};

type AddSuspectResult = ToggleResult & { id?: string };

type CourtState = {
  profile: UserProfile;
  suspects: AppSuspect[];
  laws: FocusLaw[];
  // Today's docket, newest case first. Cleared and renewed each local day.
  cases: CourtCase[];
  // Local day key the docket belongs to. Drives the daily renewal.
  docketDate: string;
  // Master switch. When false nothing locks, whatever the docket says.
  enforcementEnabled: boolean;
  focusSession: FocusSession | null;
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
  setBlockCategory: (id: string, blockCategory: BlockCategory) => void;
  addSuspect: (input: AddSuspectInput, isPro?: boolean) => AddSuspectResult;
  removeSuspect: (id: string) => void;
  unblockApp: (id: string, minutes: number) => void;
  setEnforcementEnabled: (enabled: boolean) => void;
  startFocusSession: (minutes: number, caseId?: string) => void;
  cancelFocusSession: () => void;
  tickFocusSession: () => void;
  toggleLaw: (id: string, isPro?: boolean) => ToggleResult;
  updateLaw: (id: string, law: Partial<FocusLaw>, isPro?: boolean) => ToggleResult;
  setStrictness: (strictness: StrictnessLevel, isPro?: boolean) => ToggleResult;
  setBedtime: (bedtime: string) => void;
  setWakeTime: (wakeTime: string) => void;
  // ── Docket ──
  fileCase: (input: FileCaseInput) => string | undefined;
  setVerdict: (caseId: string, verdict: CaseVerdict) => void;
  jailCase: (caseId: string) => void;
  warnCase: (caseId: string) => void;
  dismissCase: (caseId: string) => void;
  serveFocusSeconds: (caseId: string, seconds: number) => boolean;
  requestMercy: (caseId?: string) => boolean;
  grantParole: (message?: string, points?: number) => void;
  tickDocket: () => void;
  renewDocket: (force?: boolean) => void;
};

export const useCourtStore = create<CourtState>()(
  persist(
    (set, get) => ({
      profile: initialProfile,
      suspects: DEFAULT_SUSPECTS,
      laws: DEFAULT_LAWS,
      cases: [],
      docketDate: todayKey(),
      enforcementEnabled: true,
      focusSession: null,
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

      setBlockCategory(id, blockCategory) {
        set((current) => ({
          suspects: current.suspects.map((item) =>
            item.id === id
              ? {
                  ...item,
                  blockCategory,
                  // Always-allowed apps are never monitored; the other two are.
                  isSelected: blockCategory === 'alwaysAllowed' ? false : true,
                  // Re-categorising clears any temporary unblock.
                  unblockedUntil: undefined,
                }
              : item,
          ),
        }));
      },

      addSuspect(input, isPro = false) {
        const state = get();
        if (!isPro) {
          const customCount = state.suspects.filter((item) => item.isCustom).length;
          if (customCount >= freeSuspectLimit) {
            return { allowed: false, reason: 'Free court authority covers 3 custom apps or sites.' };
          }
        }
        const slug = input.displayName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const id = `custom-${slug || 'app'}-${Date.now().toString(36)}`;
        const suspect: AppSuspect = {
          id,
          displayName: input.displayName,
          category: input.category,
          villainName: input.villainName ?? 'Mystery Culprit',
          dailyUsageMinutes: 0,
          dailyOpenCount: 0,
          dangerLevel: input.dangerLevel ?? 3,
          iconColor: input.iconColor ?? '#40B96E',
          isSelected: input.blockCategory !== 'alwaysAllowed',
          isCustom: true,
          blockCategory: input.blockCategory ?? 'distracting',
          isWebsite: input.isWebsite,
          url: input.url,
        };
        set((current) => ({ suspects: [...current.suspects, suspect] }));
        return { allowed: true, id };
      },

      removeSuspect(id) {
        set((current) => ({ suspects: current.suspects.filter((item) => item.id !== id) }));
      },

      unblockApp(id, minutes) {
        const capped = Math.min(MAX_UNBLOCK_MINUTES, Math.max(1, Math.round(minutes)));
        const until = new Date(Date.now() + capped * 60 * 1000).toISOString();
        set((current) => ({
          suspects: current.suspects.map((item) => (item.id === id ? { ...item, unblockedUntil: until } : item)),
          paroleRecords: [
            {
              id: `unblock-${Date.now()}`,
              type: 'manual',
              pointsEarned: 0,
              message: `Temporary access granted for ${capped} min after a breathing check-in.`,
              createdAt: nowIso(),
            },
            ...current.paroleRecords,
          ],
        }));
      },

      setEnforcementEnabled(enabled) {
        set(() => ({ enforcementEnabled: enabled }));
      },

      /**
       * Starts a focus timer. Pass a `caseId` to serve a jailed case and release
       * its app; omit it for free-standing deep work that only earns points.
       */
      startFocusSession(minutes, caseId) {
        const duration = Math.min(120, Math.max(1, Math.round(minutes)));
        const now = Date.now();
        set(() => ({
          focusSession: {
            id: `focus-${now}`,
            startedAt: new Date(now).toISOString(),
            endsAt: new Date(now + duration * 60 * 1000).toISOString(),
            durationMinutes: duration,
            caseId,
          },
        }));
      },

      /**
       * Gives up on the running timer. Time already banked against a case is
       * kept — quitting early costs progress, it does not erase it.
       */
      cancelFocusSession() {
        set(() => ({ focusSession: null }));
      },

      tickFocusSession() {
        const session = get().focusSession;
        if (!session) return;
        if (Date.now() < new Date(session.endsAt).getTime()) return;

        const minutes = session.durationMinutes;

        if (session.caseId) {
          // The per-second tick banks progress while the app is foregrounded.
          // Top up whatever it missed (backgrounded time, rounding) so a timer
          // that ran to the end always clears its case.
          const target = get().cases.find((item) => item.id === session.caseId);
          if (target && target.verdict === 'jailed') {
            get().serveFocusSeconds(session.caseId, Math.max(1, caseFocusRemainingSeconds(target)));
          }
        }

        // One payout per completed session, whatever it was serving.
        const points = session.caseId ? minutes * 3 : minutes * 2;
        set((current) => ({
          profile: {
            ...current.profile,
            parolePoints: current.profile.parolePoints + points,
            focusCoins: current.profile.focusCoins + minutes,
          },
          paroleRecords: [
            {
              id: `focus-done-${Date.now()}`,
              type: 'focus',
              pointsEarned: points,
              message: `Focus session complete — ${minutes} min of deep work.`,
              createdAt: nowIso(),
            },
            ...current.paroleRecords,
          ],
        }));

        set(() => ({ focusSession: null }));
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

      // ── Docket ────────────────────────────────────────────────────────────
      // One law break equals one case against one app. Cases open as a
      // 'hearing'; the user converts them to a warning or a jail term.

      fileCase(input) {
        const state = get();
        const law = state.laws.find((item) => item.id === input.lawId);
        const suspect = state.suspects.find((item) => item.id === input.appId);
        if (!law || !suspect) return undefined;

        const today = todayKey();
        // One law break yields one case per app per day.
        const duplicate = state.cases.find(
          (item) => item.date === today && item.lawId === law.id && item.appId === suspect.id,
        );
        if (duplicate) return duplicate.id;

        const id = `case-${today}-${law.id}-${suspect.id}`;
        const item: CourtCase = {
          id,
          date: today,
          lawId: law.id,
          lawName: law.name,
          appId: suspect.id,
          appName: suspect.displayName,
          title: input.title ?? `${law.shortName} broken`,
          evidenceLine:
            input.evidenceLine ??
            `${suspect.displayName} crossed the line set by ${law.name}.`,
          severity: suspect.dangerLevel,
          verdict: 'hearing',
          filedAt: nowIso(),
          requiredFocusMinutes:
            input.requiredFocusMinutes ?? sentenceForRepeat(law, state.cases),
          focusServedSeconds: 0,
        };

        set((current) => ({ cases: [item, ...current.cases] }));
        return id;
      },

      setVerdict(caseId, verdict) {
        const resolved = verdict !== 'hearing' && verdict !== 'jailed';
        set((current) => {
          const target = current.cases.find((item) => item.id === caseId);
          if (!target) return current;
          return {
            cases: current.cases.map((item) =>
              item.id === caseId
                ? { ...item, verdict, resolvedAt: resolved ? nowIso() : undefined }
                : item,
            ),
            // Leaving custody also drops any temporary access window.
            suspects:
              verdict === 'jailed'
                ? current.suspects
                : current.suspects.map((suspect) =>
                    suspect.id === target.appId ? { ...suspect, unblockedUntil: undefined } : suspect,
                  ),
            // A session serving a case that just left custody is finished.
            focusSession:
              !resolved || current.focusSession?.caseId !== caseId ? current.focusSession : null,
          };
        });
      },

      jailCase(caseId) {
        get().setVerdict(caseId, 'jailed');
      },

      warnCase(caseId) {
        const state = get();
        const item = state.cases.find((entry) => entry.id === caseId);
        state.setVerdict(caseId, 'warning');
        if (!item) return;
        set((current) => ({
          paroleRecords: [
            {
              id: `warning-${caseId}-${Date.now()}`,
              type: 'manual',
              pointsEarned: 0,
              message: `Warning issued for ${item.appName}. The court is keeping the file open.`,
              createdAt: nowIso(),
            },
            ...current.paroleRecords,
          ],
        }));
      },

      dismissCase(caseId) {
        get().setVerdict(caseId, 'dismissed');
      },

      /**
       * Banks focus seconds against a jailed case and flips it to 'served' once
       * the required time is covered. Returns true when the app is released.
       *
       * Progress only — rewards are paid once per completed session in
       * `tickFocusSession`, so the per-second tick cannot inflate them.
       */
      serveFocusSeconds(caseId, seconds) {
        const banked = Math.max(0, Math.round(seconds));
        if (banked === 0) return false;

        let served = false;
        let releasedName = '';

        set((current) => {
          const target = current.cases.find((item) => item.id === caseId);
          if (!target || target.verdict !== 'jailed') return current;

          const total = target.focusServedSeconds + banked;
          served = total >= target.requiredFocusMinutes * 60;
          releasedName = target.appName;

          return {
            cases: current.cases.map((item) =>
              item.id === caseId
                ? {
                    ...item,
                    focusServedSeconds: total,
                    verdict: served ? ('served' as const) : ('jailed' as const),
                    resolvedAt: served ? nowIso() : undefined,
                  }
                : item,
            ),
          };
        });

        if (served) {
          set((current) => ({
            profile: {
              ...current.profile,
              cleanRecordStreak: current.profile.cleanRecordStreak + 1,
            },
            paroleRecords: [
              {
                id: `released-${caseId}-${Date.now()}`,
                type: 'focus' as const,
                pointsEarned: 0,
                message: `${releasedName} released. Focus time served in full.`,
                createdAt: nowIso(),
              },
              ...current.paroleRecords,
            ],
          }));
        }

        return served;
      },

      requestMercy(caseId) {
        const state = get();
        if (state.profile.mercyPasses <= 0) return false;
        const target =
          state.cases.find((item) => item.id === caseId) ??
          state.cases.find((item) => item.verdict === 'jailed') ??
          state.cases.find((item) => item.verdict === 'hearing');
        if (!target) return false;

        state.setVerdict(target.id, 'dismissed');
        set((current) => ({
          profile: {
            ...current.profile,
            mercyPasses: current.profile.mercyPasses - 1,
            parolePoints: current.profile.parolePoints + 12,
          },
          paroleRecords: [
            {
              id: `mercy-${Date.now()}`,
              type: 'manual',
              pointsEarned: 12,
              message: `Mercy pass spent on ${target.appName}. The court allows emergencies, not excuses.`,
              createdAt: nowIso(),
            },
            ...current.paroleRecords,
          ],
        }));
        return true;
      },

      grantParole(message = 'Parole granted. You protected your focus record.', points = 20) {
        set((current) => ({
          profile: {
            ...current.profile,
            parolePoints: current.profile.parolePoints + points,
            focusCoins: current.profile.focusCoins + 10,
            cleanRecordStreak: current.profile.cleanRecordStreak + 1,
          },
          // Parole clears every app still in custody.
          cases: current.cases.map((item) =>
            item.verdict === 'jailed'
              ? { ...item, verdict: 'served' as const, resolvedAt: nowIso() }
              : item,
          ),
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

      /**
       * Credits one second of focus to the case the running session is serving.
       * Free-standing sessions (no `caseId`) are settled in `tickFocusSession`.
       */
      tickDocket() {
        const state = get();
        const session = state.focusSession;
        if (!session?.caseId) return;
        const target = state.cases.find((item) => item.id === session.caseId);
        if (!target || target.verdict !== 'jailed') return;

        set((current) => ({
          cases: current.cases.map((item) =>
            item.id === session.caseId
              ? { ...item, focusServedSeconds: item.focusServedSeconds + 1 }
              : item,
          ),
        }));
      },

      /**
       * Clears the docket and every daily counter at the start of a new local
       * day so the user always begins fresh. No debt carries over.
       */
      renewDocket(force = false) {
        const today = todayKey();
        if (!force && get().docketDate === today) return;
        set((current) => ({
          docketDate: today,
          cases: [],
          focusSession: null,
          suspects: current.suspects.map((suspect) => ({
            ...suspect,
            dailyUsageMinutes: 0,
            dailyOpenCount: 0,
            unblockedUntil: undefined,
          })),
        }));
      },
    }),
    {
      name: 'focus-court-store',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      // v1 stored a single global `activeCase` plus a flat `charges` array.
      // Those shapes cannot be mapped onto per-app cases, so case state is
      // dropped and the user starts on a clean docket. Profile, laws,
      // suspects, and parole history are preserved.
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as Record<string, unknown>;
        if (version >= 2) return saved as Partial<CourtState>;
        const { activeCase, charges, activeChargeId, ...rest } = saved;
        return {
          ...rest,
          cases: [],
          docketDate: todayKey(),
          enforcementEnabled: true,
          focusSession: null,
        } as Partial<CourtState>;
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<CourtState> | undefined;
        const savedDate = saved?.docketDate;
        // A docket from an earlier day never survives a relaunch.
        const isToday = savedDate === todayKey();
        return {
          ...current,
          ...saved,
          profile: mergeProfile(saved?.profile),
          laws: mergeById(DEFAULT_LAWS, saved?.laws),
          suspects: mergeById(DEFAULT_SUSPECTS, saved?.suspects),
          docketDate: todayKey(),
          cases: isToday ? saved?.cases ?? [] : [],
          enforcementEnabled: saved?.enforcementEnabled ?? true,
          focusSession: isToday ? saved?.focusSession ?? null : null,
          paroleRecords: saved?.paroleRecords ?? current.paroleRecords,
        };
      },
    },
  ),
);
