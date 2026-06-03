import type { FocusCourtAssetKey } from '@/src/constants/assets';

export const REWARD_CARDS: { title: string; copy: string; assetKey: FocusCourtAssetKey }[] = [
  {
    title: 'Clean Record Medal',
    copy: 'Keep a clean day and the court polishes your record.',
    assetKey: 'ASSET_CLEAN_RECORD_MEDAL',
  },
  {
    title: 'Focus Coins',
    copy: 'Every parole action adds currency for future upgrades.',
    assetKey: 'ASSET_FOCUS_COINS_STACK',
  },
  {
    title: 'Supreme Focus Trophy',
    copy: 'Long streaks unlock a louder verdict: discipline wins.',
    assetKey: 'ASSET_SUPREME_FOCUS_TROPHY',
  },
  {
    title: 'Full Pardon',
    copy: 'A full day protected means the case can be dismissed.',
    assetKey: 'ASSET_FULL_PARDON_CERTIFICATE',
  },
];
