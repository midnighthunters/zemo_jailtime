import type { FocusCourtAssetKey, OnboardingArtKey } from '@/src/constants/assets';
import type { AgeRange, DailyScreenTime, DreamType, FocusGoal, UserRole } from '@/src/types/court';

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
    id: 'goals',
    route: '/onboarding/goals',
    title: 'What Matters Most To You?',
    subtitle: 'Pick what you want back from your screen time.',
    artKey: 'DREAMS',
    assetKeys: ['ASSET_DREAM_RECOVERED_STAR', 'ASSET_FREEDOM_PATH_SIGNPOST'],
    cta: 'Continue',
  },
  {
    id: 'age',
    route: '/onboarding/age',
    title: 'How Old Are You?',
    subtitle: 'The court tailors its approach to your stage of life.',
    artKey: 'COURT_SESSION',
    assetKeys: ['ASSET_MONKEY_CLERK_RECORDS'],
    cta: 'Continue',
  },
  {
    id: 'role',
    route: '/onboarding/role',
    title: 'What Best Describes You?',
    subtitle: 'Helps the court build a focus plan that fits your lifestyle.',
    artKey: 'COURT_SESSION',
    assetKeys: ['ASSET_EXHIBIT_A_FILE', 'ASSET_ATTORNEY_CROC_EVIDENCE'],
    cta: 'Continue',
  },
  {
    id: 'screentime_intake',
    route: '/onboarding/screentime-intake',
    title: "What's Your Average Screen Time Per Day?",
    subtitle: 'Your honest answer sets the opening argument.',
    artKey: 'EVIDENCE_BRUTAL',
    assetKeys: ['ASSET_EVIDENCE_BOARD_SCREEN_TIME', 'ASSET_DANGER_HOURS_CLOCK'],
    cta: 'Continue',
  },
  {
    id: 'profile',
    route: '/onboarding/profile',
    title: 'Open Your Case File',
    subtitle: 'Tell the court who we are defending and why focus matters.',
    artKey: 'COURT_SESSION',
    assetKeys: ['ASSET_MONKEY_CLERK_RECORDS', 'ASSET_EXHIBIT_A_FILE'],
    cta: 'File Statement',
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
    id: 'screen_time_permission',
    route: '/onboarding/screen-time-permission',
    title: 'Access Screen Time',
    subtitle: 'JailTime needs Screen Time access to monitor and block the apps keeping you in digital jail.',
    artKey: 'EVIDENCE_BRUTAL',
    assetKeys: ['ASSET_PHONE_LOCKED_CHEST', 'ASSET_COURT_AUTHORITY_PERMISSION'],
    cta: 'Grant Access',
  },
  {
    id: 'notifications_permission',
    route: '/onboarding/notifications-permission',
    title: 'Allow Notifications',
    subtitle: 'Get verdicts, warnings, and parole updates before it is too late.',
    artKey: 'COURT_SESSION',
    assetKeys: ['ASSET_LEGAL_NOTICE_ENVELOPE', 'ASSET_GAVEL_IMPACT'],
    cta: 'Allow Notifications',
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
    id: 'routine',
    route: '/onboarding/routine',
    title: 'Map Your Danger Hours',
    subtitle: 'Your sentence gets fairer when the court knows your daily rhythm.',
    artKey: 'EVIDENCE_BRUTAL',
    assetKeys: ['ASSET_DANGER_HOURS_CLOCK', 'ASSET_EVIDENCE_LOST_SLEEP'],
    cta: 'Set Schedule',
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
    id: 'style',
    route: '/onboarding/style',
    title: 'Choose Court Style',
    subtitle: 'Pick how strict and dramatic your focus court should be.',
    artKey: 'PAROLE',
    assetKeys: ['ASSET_STRICT_MODE_LOCK', 'ASSET_FOCUS_SCALES'],
    cta: 'Approve Style',
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

export function getOnboardingStep(id: string) {
  const step = ONBOARDING_STEPS.find((item) => item.id === id);
  if (!step) throw new Error(`Missing onboarding step: ${id}`);
  return step;
}

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

export const FOCUS_GOAL_OPTIONS: { id: FocusGoal; label: string; description: string }[] = [
  { id: 'focus_better', label: 'Focus Better', description: 'Deep work without constant distractions.' },
  { id: 'sleep_better', label: 'Sleep Better', description: 'Stop the late-night scroll that kills your rest.' },
  { id: 'be_present', label: 'Be More Present', description: 'Less half-watching life through a screen.' },
  { id: 'reduce_anxiety', label: 'Reduce Anxiety', description: 'Less doomscrolling and news overload.' },
  { id: 'read_more', label: 'Read More', description: 'Swap feed time for books and real learning.' },
  { id: 'exercise_more', label: 'Exercise More', description: 'Reclaim the time that was going to apps.' },
  { id: 'spend_less', label: 'Spend Less', description: 'Stop impulse-buying from targeted feeds.' },
  { id: 'study_better', label: 'Study Better', description: 'Protect your study hours from interruption.' },
];

export const AGE_RANGE_OPTIONS: { id: AgeRange; label: string }[] = [
  { id: 'under_18', label: 'Under 18' },
  { id: '18_24', label: '18 – 24' },
  { id: '25_34', label: '25 – 34' },
  { id: '35_44', label: '35 – 44' },
  { id: '45_54', label: '45 – 54' },
  { id: '55_plus', label: '55+' },
];

export const USER_ROLE_OPTIONS: { id: UserRole; label: string; description: string }[] = [
  { id: 'student', label: 'Student', description: 'School, college, or university.' },
  { id: 'technologist', label: 'Technologist', description: 'Software, engineering, or IT.' },
  { id: 'entrepreneur', label: 'Entrepreneur', description: 'Building or running your own thing.' },
  { id: 'remote_worker', label: 'Remote Worker', description: 'Working from home or anywhere.' },
  { id: 'creative', label: 'Creative', description: 'Design, writing, media, or arts.' },
  { id: 'parent', label: 'Parent', description: 'Raising kids while staying sane.' },
  { id: 'executive', label: 'Executive', description: 'Leading teams or organisations.' },
  { id: 'other', label: 'Other', description: 'Something the court hasn\'t categorised yet.' },
];

export const DAILY_SCREEN_TIME_OPTIONS: { id: DailyScreenTime; label: string; description: string }[] = [
  { id: 'under_2h', label: 'Under 2 hours', description: 'You are already disciplined. Let\'s keep it that way.' },
  { id: '2_4h', label: '2 – 4 hours', description: 'Reasonable, but there\'s room to reclaim time.' },
  { id: '4_6h', label: '4 – 6 hours', description: 'The average. The court has seen worse.' },
  { id: '6_8h', label: '6 – 8 hours', description: 'Evidence is mounting. Time to act.' },
  { id: 'over_8h', label: 'Over 8 hours', description: 'Maximum sentence recommended by the prosecution.' },
];
