import type { CaseVerdict, CourtCase } from '@/src/types/court';

// Single source of truth for reading the docket. Screens must not re-derive
// lock state or verdict labels themselves.

/** A case still needs the user's attention. */
export function isCaseOpen(item: CourtCase) {
  return item.verdict === 'hearing' || item.verdict === 'jailed';
}

/** Every case currently holding the protected apps in custody. */
export function jailedCases(cases: CourtCase[]) {
  return cases.filter((item) => item.verdict === 'jailed');
}

/** The case to serve first — the one with the least focus time left. */
export function primaryJailedCase(cases: CourtCase[]) {
  return jailedCases(cases).sort(
    (a, b) => caseFocusRemainingSeconds(a) - caseFocusRemainingSeconds(b),
  )[0];
}

/**
 * Whether the protected apps are locked right now. A jail verdict shields the
 * whole selection, because iOS reports a limit breach without naming the app.
 * Enforcement being off unlocks everything, whatever the docket says.
 */
export function appsLocked(cases: CourtCase[], enforcementEnabled: boolean) {
  if (!enforcementEnabled) return false;
  return jailedCases(cases).length > 0;
}

/** Total focus seconds owed across every open jail verdict. */
export function totalFocusOwedSeconds(cases: CourtCase[]) {
  return jailedCases(cases).reduce((sum, item) => sum + caseFocusRemainingSeconds(item), 0);
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
