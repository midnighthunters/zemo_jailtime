import type { CaseVerdict, CourtCase } from '@/src/types/court';

// Single source of truth for reading the docket. Screens must not re-derive
// lock state or verdict labels themselves.

/** A case still needs the user's attention. */
export function isCaseOpen(item: CourtCase) {
  return item.verdict === 'hearing' || item.verdict === 'jailed';
}

/** The case currently holding an app in custody, if any. */
export function jailedCaseForApp(cases: CourtCase[], appId: string) {
  return cases.find((item) => item.appId === appId && item.verdict === 'jailed');
}

/** Every app held by an active jail verdict. */
export function jailedAppIds(cases: CourtCase[]) {
  return Array.from(
    new Set(cases.filter((item) => item.verdict === 'jailed').map((item) => item.appId)),
  );
}

/**
 * Whether an app is locked right now.
 * Enforcement being off unlocks everything, whatever the docket says.
 */
export function isAppLocked(cases: CourtCase[], appId: string, enforcementEnabled: boolean) {
  if (!enforcementEnabled) return false;
  return Boolean(jailedCaseForApp(cases, appId));
}

/** Focus seconds still owed before a jailed case is served. */
export function caseFocusRemainingSeconds(item: CourtCase) {
  return Math.max(0, item.requiredFocusMinutes * 60 - item.focusServedSeconds);
}

/** 0–100 progress toward serving a jailed case. */
export function caseFocusProgress(item: CourtCase) {
  const total = Math.max(1, item.requiredFocusMinutes * 60);
  return Math.min(100, Math.round((item.focusServedSeconds / total) * 100));
}

export function verdictLabel(verdict: CaseVerdict) {
  switch (verdict) {
    case 'hearing':
      return 'Hearing in progress';
    case 'warning':
      return 'Warning issued';
    case 'jailed':
      return 'Jailed';
    case 'served':
      return 'Time served';
    case 'dismissed':
      return 'Dismissed';
  }
}

export function verdictTone(verdict: CaseVerdict) {
  switch (verdict) {
    case 'hearing':
      return 'gold' as const;
    case 'warning':
      return 'orange' as const;
    case 'jailed':
      return 'danger' as const;
    case 'served':
      return 'success' as const;
    case 'dismissed':
      return 'muted' as const;
  }
}

/** Card variant that matches a verdict without inventing new colors. */
export function verdictVariant(verdict: CaseVerdict) {
  switch (verdict) {
    case 'hearing':
      return 'parchment' as const;
    case 'warning':
      return 'orange' as const;
    case 'jailed':
      return 'red' as const;
    case 'served':
      return 'green' as const;
    case 'dismissed':
      return 'glass' as const;
  }
}
