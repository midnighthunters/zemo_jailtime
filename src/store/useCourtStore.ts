import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_LAWS } from '@/src/data/laws';
import { DEFAULT_PERMISSION_STATUSES } from '@/src/data/permissions';
import type { AgeRange, AppSelection, CaseVerdict, CourtCase, DailyScreenTime, DreamType, FocusGoal, FocusLaw, FocusSession, PermissionId, PermissionStatus, StrictnessLevel, UserProfile, UserRole } from '@/src/types/court';
import { nowIso, todayKey } from '@/src/utils/date';
import { caseFocusRemainingSeconds } from '@/src/utils/docket';
import { sentenceForRepeat } from '@/src/utils/sentence';

const freeLawLimit = 3;

/** No apps under the court's authority until the user picks real ones. */
const emptySelection: AppSelection = { applications: 0, categories: 0, webDomains: 0 };

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

// Input for filing a case. Everything not supplied is derived from the law so
// callers stay terse.
type FileCaseInput = {
  lawId: string;
  source: CourtCase['source'];
  title?: string;
  evidenceLine?: string;
  requiredFocusMinutes?: number;
  /** Dedupe key within the day. Defaults to the law id. */
  dedupeKey?: string;
};

type CourtState = {
  profile: UserProfile;
  /** Counts from the system app picker. Never app names — iOS does not expose them. */
  appSelection: AppSelection;
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
  setAppSelection: (selection: Partial<AppSelection>) => void;
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
      appSelection: emptySelection,
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

      /**
       * Records what the system picker reported. Counts only — iOS never hands
       * over the app identities behind a FamilyActivitySelection.
       */
      setAppSelection(selection) {
        set((current) => ({
          appSelection: {
            ...current.appSelection,
            ...selection,
            updatedAt: nowIso(),
          },
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
        if (!law) return undefined;

        const today = todayKey();
        const dedupeKey = input.dedupeKey ?? law.id;
        // One breach yields one case per key per day.
        const duplicate = state.cases.find(
          (item) => item.date === today && item.id === `case-${today}-${dedupeKey}`,
        );
        if (duplicate) return duplicate.id;

        const id = `case-${today}-${dedupeKey}`;
        const item: CourtCase = {
          id,
          date: today,
          lawId: law.id,
          lawName: law.name,
          title: input.title ?? `${law.shortName} broken`,
          evidenceLine:
            input.evidenceLine ?? `Your protected apps crossed the line set by ${law.name}.`,
          severity: law.strictness === 'brutal' ? 5 : law.strictness === 'balanced' ? 3 : 2,
          verdict: 'hearing',
          filedAt: nowIso(),
          source: input.source,
          requiredFocusMinutes: input.requiredFocusMinutes ?? sentenceForRepeat(law, state.cases),
          focusServedSeconds: 0,
        };

        set((current) => ({ cases: [item, ...current.cases] }));
        return id;
      },

      setVerdict(caseId, verdict) {
        const resolved = verdict !== 'hearing' && verdict !== 'jailed';
        set((current) => {
          if (!current.cases.some((item) => item.id === caseId)) return current;
          return {
            cases: current.cases.map((item) =>
              item.id === caseId
                ? { ...item, verdict, resolvedAt: resolved ? nowIso() : undefined }
                : item,
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
              message: `Warning issued under ${item.lawName}. The court is keeping the file open.`,
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
          releasedName = target.lawName;

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
                message: `Apps released. Focus time served in full under ${releasedName}.`,
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
              message: `Mercy pass spent on ${target.lawName}. The court allows emergencies, not excuses.`,
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
          // Parole clears every case still holding apps in custody.
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
        set(() => ({
          docketDate: today,
          cases: [],
          focusSession: null,
        }));
      },
    }),
    {
      name: 'focus-court-store',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      // v1: one global `activeCase` plus a flat `charges` array.
      // v2: per-app cases plus a `suspects` list of placeholder apps.
      // v3: law-scoped cases and a real app selection from the system picker.
      //     The placeholder suspect list is dropped because the app can no
      //     longer invent apps — the user re-picks real ones in the picker.
      //     Profile, laws, and parole history are preserved throughout.
      migrate: (persisted, version) => {
        const saved = (persisted ?? {}) as Record<string, unknown>;
        if (version >= 3) return saved as Partial<CourtState>;
        const { activeCase, charges, activeChargeId, suspects, ...rest } = saved;
        return {
          ...rest,
          cases: [],
          docketDate: todayKey(),
          enforcementEnabled: true,
          appSelection: emptySelection,
          focusSession: null,
        } as Partial<CourtState>;
      },
      merge: (persisted, current) => {
        const saved = persisted as Partial<CourtState> | undefined;
        // A docket from an earlier day never survives a relaunch.
        const isToday = saved?.docketDate === todayKey();
        return {
          ...current,
          ...saved,
          profile: mergeProfile(saved?.profile),
          laws: mergeById(DEFAULT_LAWS, saved?.laws),
          appSelection: { ...emptySelection, ...saved?.appSelection },
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
