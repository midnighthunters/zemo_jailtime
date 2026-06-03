import type { FocusCourtAssetKey, OnboardingArtKey } from '@/src/constants/assets';
import type { DreamType } from '@/src/types/court';

export type OnboardingStep = {
  id: string;
  route: string;
  title: string;
  subtitle: string;
  artKey: OnboardingArtKey;
  assetKeys: FocusCourtAssetKey[];
  cta: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'court',
    route: '/onboarding',
    title: 'Court Is In Session!',
    subtitle: 'Your screen habits are officially on trial.',
    artKey: 'COURT_SESSION',
    assetKeys: ['ASSET_JUDGE_LION_GAVEL'],
    cta: 'Enter Court',
  },
  {
    id: 'evidence',
    route: '/onboarding/permissions',
    title: 'The Evidence Is Brutal',
    subtitle: 'Every tap can steal sleep, focus, and dreams.',
    artKey: 'EVIDENCE_BRUTAL',
    assetKeys: ['ASSET_EVIDENCE_BOARD_SCREEN_TIME', 'ASSET_DREAMS_DELAYED_BOARD', 'ASSET_OWL_JUSTICE_INSPECT'],
    cta: 'Review Evidence',
  },
  {
    id: 'dreams',
    route: '/onboarding/dreams',
    title: 'Choose Your Dreams',
    subtitle: 'What is screen time stealing from you?',
    artKey: 'DREAMS',
    assetKeys: ['ASSET_DREAM_RECOVERED_STAR', 'ASSET_FREEDOM_PATH_SIGNPOST'],
    cta: 'Protect Dreams',
  },
  {
    id: 'suspects',
    route: '/onboarding/suspects',
    title: 'Select The Usual Suspects',
    subtitle: 'Pick the apps that keep dragging you back.',
    artKey: 'SUSPECTS',
    assetKeys: ['ASSET_SELECT_SUSPECTS_LINEUP'],
    cta: 'Name Suspects',
  },
  {
    id: 'laws',
    route: '/onboarding/laws',
    title: 'Write Your Focus Laws',
    subtitle: 'Set funny fake laws that protect your real life.',
    artKey: 'PAROLE',
    assetKeys: ['ASSET_LAW_BOOK_LIBRARY', 'ASSET_LAW_ANTI_DOOMSCROLL', 'ASSET_LAW_MIDNIGHT_SWIPE'],
    cta: 'Sign Laws',
  },
  {
    id: 'parole',
    route: '/onboarding/parole',
    title: 'Earn Parole',
    subtitle: 'Focus, sleep, study, and discipline reduce your sentence.',
    artKey: 'COURT_SESSION',
    assetKeys: ['ASSET_PAROLE_GRANTED_BADGE', 'ASSET_DEFENDANT_FREEDOM_WALK', 'ASSET_FREEDOM_PATH_SIGNPOST'],
    cta: 'Start Trial',
  },
];

export const DREAM_OPTIONS: { id: DreamType; label: string }[] = [
  { id: 'sleep', label: 'Sleep' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'study', label: 'Study' },
  { id: 'career', label: 'Career' },
  { id: 'business', label: 'Business' },
  { id: 'reading', label: 'Reading' },
  { id: 'family', label: 'Family' },
  { id: 'peace', label: 'Peace' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'creativity', label: 'Creativity' },
  { id: 'spirituality', label: 'Spirituality' },
  { id: 'custom', label: 'Custom' },
];
