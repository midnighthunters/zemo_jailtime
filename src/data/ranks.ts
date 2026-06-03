export const COURT_RANKS = [
  { name: 'Repeat Offender', minPoints: 0 },
  { name: 'Under Investigation', minPoints: 50 },
  { name: 'First-Time Focus Citizen', minPoints: 120 },
  { name: 'Clean Record Holder', minPoints: 240 },
  { name: 'Parole Champion', minPoints: 420 },
  { name: 'Focus Advocate', minPoints: 700 },
  { name: 'Supreme Focus Citizen', minPoints: 1000 },
];

export function rankForPoints(points: number) {
  return [...COURT_RANKS].reverse().find((rank) => points >= rank.minPoints) ?? COURT_RANKS[0];
}
