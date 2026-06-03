import type { Charge, FocusLaw } from '@/src/types/court';

export function sentenceForRepeat(law: FocusLaw, previousCharges: Charge[]) {
  const repeats = previousCharges.filter((charge) => charge.lawId === law.id).length;
  const escalated = Math.ceil(law.firstPunishmentMinutes * Math.pow(law.repeatMultiplier, repeats));
  return Math.min(law.maxSentenceMinutes, escalated);
}

export function statusLabel(status: string) {
  switch (status) {
    case 'charged':
      return 'CHARGES FILED';
    case 'jailed':
      return 'SENTENCE ACTIVE';
    case 'parole':
      return 'PAROLE GRANTED';
    case 'dismissed':
      return 'CASE DISMISSED';
    case 'warning':
      return 'LEGAL NOTICE';
    default:
      return 'CLEAN RECORD';
  }
}
