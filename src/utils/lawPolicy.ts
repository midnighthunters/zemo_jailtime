import type { AppSuspect, FocusLaw } from '@/src/types/court';

export type LawViolationReason = 'blockedWindow' | 'dailyLimit' | 'pickupLoop' | 'unlockCount' | 'appLaunch';

export type LawEvaluation = {
  law: FocusLaw;
  reason: LawViolationReason;
  priority: number;
};

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function isWithinWindow(start: string, end: string, date: Date) {
  const current = date.getHours() * 60 + date.getMinutes();
  const startMinutes = minutesFromTime(start);
  const endMinutes = minutesFromTime(end);

  if (startMinutes === endMinutes) return true;
  if (startMinutes < endMinutes) return current >= startMinutes && current < endMinutes;
  return current >= startMinutes || current < endMinutes;
}

function appliesToday(law: FocusLaw, date: Date) {
  if (!law.activeDays?.length) return true;
  return law.activeDays.includes(date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6);
}

export function describesSchedule(law: FocusLaw) {
  const window = law.blockedStart && law.blockedEnd ? `${law.blockedStart}-${law.blockedEnd}` : undefined;
  const days = law.activeDays?.length ? `${law.activeDays.length} day${law.activeDays.length === 1 ? '' : 's'}` : 'daily';
  if (window) return `${window} ${days}`;
  if (law.focusSessionMinutes) return `${law.focusSessionMinutes} min focus`;
  if (law.cooldownMinutes) return `${law.cooldownMinutes} min cooldown`;
  if (law.unlockLimit) return `${law.unlockLimit} unlock cap`;
  if (law.dailyLimitMinutes) return `${law.dailyLimitMinutes} min limit`;
  return 'always on';
}

export function evaluateLawViolation(law: FocusLaw, suspect: AppSuspect, nextOpenCount: number, nextUsageMinutes: number, date = new Date()): LawEvaluation | undefined {
  if (!law.isEnabled) return undefined;
  if (!appliesToday(law, date)) return undefined;
  if (!(law.category === 'all' || law.category === suspect.category || law.appIds.includes(suspect.id))) return undefined;

  const blockedNow = law.blockedStart && law.blockedEnd && isWithinWindow(law.blockedStart, law.blockedEnd, date);
  if (blockedNow && law.trigger === 'blockedWindow') {
    return { law, reason: 'blockedWindow', priority: law.enforcementMode === 'hardBlock' ? 100 : 80 };
  }

  if (law.dailyLimitMinutes && nextUsageMinutes > law.dailyLimitMinutes) {
    return { law, reason: 'dailyLimit', priority: 70 };
  }

  if (law.unlockLimit && nextOpenCount > law.unlockLimit) {
    return { law, reason: 'unlockCount', priority: 60 };
  }

  if ((law.trigger === 'pickupLoop' || law.cooldownMinutes) && nextOpenCount > law.graceOpens) {
    return { law, reason: 'pickupLoop', priority: 50 };
  }

  if (nextOpenCount > law.graceOpens) {
    return { law, reason: 'appLaunch', priority: 40 };
  }

  return undefined;
}

export function selectBestViolation(evaluations: Array<LawEvaluation | undefined>) {
  return evaluations
    .filter((evaluation): evaluation is LawEvaluation => Boolean(evaluation))
    .sort((left, right) => right.priority - left.priority || right.law.firstPunishmentMinutes - left.law.firstPunishmentMinutes)[0];
}

export function violationCopy(reason: LawViolationReason) {
  switch (reason) {
    case 'blockedWindow':
      return 'protected time window';
    case 'dailyLimit':
      return 'daily limit';
    case 'pickupLoop':
      return 'rapid reopen pattern';
    case 'unlockCount':
      return 'unlock count';
    default:
      return 'open count';
  }
}
