import type { CourtCase, FocusLaw } from '@/src/types/court';

/**
 * Focus minutes owed for breaking a law, escalating with each repeat on the
 * same docket. Capped by the law's own maximum.
 */
export function sentenceForRepeat(law: FocusLaw, previousCases: CourtCase[]) {
  const repeats = previousCases.filter((item) => item.lawId === law.id).length;
  const escalated = Math.ceil(law.firstPunishmentMinutes * Math.pow(law.repeatMultiplier, repeats));
  return Math.min(law.maxSentenceMinutes, escalated);
}
