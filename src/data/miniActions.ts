import type { FocusCourtAssetKey } from '@/src/constants/assets';

export type MiniAction = {
  id: string;
  title: string;
  reductionMinutes: number;
  parolePoints: number;
  assetKey: FocusCourtAssetKey;
};

export const MINI_ACTIONS: MiniAction[] = [
  { id: 'breathe', title: 'Breathe for 60 seconds', reductionMinutes: 2, parolePoints: 8, assetKey: 'ASSET_SENTENCE_REDUCTION_CHECKLIST' },
  { id: 'task', title: 'Write one real task', reductionMinutes: 3, parolePoints: 12, assetKey: 'ASSET_EXHIBIT_A_FILE' },
  { id: 'focus', title: 'Start 15-minute focus', reductionMinutes: 15, parolePoints: 30, assetKey: 'ASSET_BROKEN_CHAIN_FREEDOM' },
  { id: 'phone-down', title: 'Put phone down for 5 minutes', reductionMinutes: 5, parolePoints: 16, assetKey: 'ASSET_PHONE_LOCKED_CHEST' },
  { id: 'water', title: 'Drink water', reductionMinutes: 1, parolePoints: 5, assetKey: 'ASSET_MERCY_PASS_TICKET' },
  { id: 'walk', title: 'Walk 300 steps', reductionMinutes: 4, parolePoints: 14, assetKey: 'ASSET_DEFENDANT_FITNESS_WIN' },
  { id: 'read', title: 'Read 2 pages', reductionMinutes: 4, parolePoints: 14, assetKey: 'ASSET_DEFENDANT_READING_FOCUS' },
  { id: 'desk', title: 'Clean desk', reductionMinutes: 3, parolePoints: 10, assetKey: 'ASSET_CLEAN_RECORD_MEDAL' },
];
