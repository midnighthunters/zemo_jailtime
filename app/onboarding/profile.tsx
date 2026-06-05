import { StyleSheet, View } from 'react-native';
import { FieldLabel, IntakeInput, OptionCard } from '@/src/components/OnboardingIntake';
import { OnboardingScene } from '@/src/components/OnboardingScene';
import { getOnboardingStep } from '@/src/data/onboarding';
import { useCourtStore } from '@/src/store/useCourtStore';
import type { FocusReason } from '@/src/types/court';

const reasonOptions: { id: FocusReason; title: string; description: string; meta: string }[] = [
  {
    id: 'sleep_better',
    title: 'Sleep without late-night evidence',
    description: 'Wind down earlier and make tomorrow easier.',
    meta: 'Rest',
  },
  {
    id: 'study_work',
    title: 'Protect deep work',
    description: 'Keep attention available for study, work, or building.',
    meta: 'Focus',
  },
  {
    id: 'be_present',
    title: 'Feel present again',
    description: 'Spend less time half-looking at life through a screen.',
    meta: 'Life',
  },
  {
    id: 'less_doomscrolling',
    title: 'Break the scroll loop',
    description: 'Stop one tap from becoming the whole evening.',
    meta: 'Control',
  },
];

export default function ProfileOnboarding() {
  const profile = useCourtStore((state) => state.profile);
  const updateProfile = useCourtStore((state) => state.updateProfile);

  return (
    <OnboardingScene step={getOnboardingStep('profile')}>
      <View style={styles.form}>
        <View style={styles.section}>
          <FieldLabel title="Defendant name" caption="Optional, but it makes court notices feel personal." />
          <IntakeInput
            value={profile.name ?? ''}
            placeholder="What should the court call you?"
            onChangeText={(name) => updateProfile({ name })}
          />
        </View>

        <View style={styles.section}>
          <FieldLabel title="Why are we here?" caption="Pick the motive that should shape your first focus plan." />
          <View style={styles.options}>
            {reasonOptions.map((option) => (
              <OptionCard
                key={option.id}
                title={option.title}
                description={option.description}
                meta={option.meta}
                selected={profile.whyFocus === option.id}
                onPress={() => updateProfile({ whyFocus: option.id })}
              />
            ))}
          </View>
        </View>
      </View>
    </OnboardingScene>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 18,
  },
  section: {
    gap: 10,
  },
  options: {
    gap: 8,
  },
});
